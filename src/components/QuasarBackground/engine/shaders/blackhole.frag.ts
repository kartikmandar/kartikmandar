import {
  GLSL_BLACKBODY,
  GLSL_NOISE,
  GLSL_SHELL_COLOR,
  GLSL_SPHERE_INTERVAL,
  GLSL_STAR_SURFACE,
} from './chunks'
import { CONSTANTS } from '../types'

export const FULLSCREEN_VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const JET_TAN = Math.tan((CONSTANTS.JET_HALF_ANGLE_DEG * Math.PI) / 180).toFixed(5)

export const BLACKHOLE_FRAG = /* glsl */ `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uCamPos;
uniform mat4 uInvProjView;
uniform mat3 uWorldToDisk;   // world -> disk frame (disk plane is y = 0)
uniform samplerCube uBackground;
uniform int uPhase;          // Phase enum: 0 STAR .. 5 QUASAR
uniform float uProgress;
uniform float uStarRadius;
uniform float uShellRadius;
uniform float uFlash;
uniform float uLensing;
uniform float uIgnition;

#define DISK_INNER ${CONSTANTS.DISK_INNER_RS.toFixed(1)}
#define DISK_OUTER ${CONSTANTS.DISK_OUTER_RS.toFixed(1)}
#define ESCAPE_R ${CONSTANTS.ESCAPE_RADIUS_RS.toFixed(1)}
#define JET_LEN ${CONSTANTS.JET_LENGTH_RS.toFixed(1)}
#define JET_TAN ${JET_TAN}
#define MAX_STEPS 128
#define SHELL_SAMPLES 10

${GLSL_NOISE}
${GLSL_BLACKBODY}
${GLSL_SHELL_COLOR}
${GLSL_STAR_SURFACE}
${GLSL_SPHERE_INTERVAL}

vec3 sampleBackground(vec3 dirDisk) {
  // v * M == transpose(M) * v: inverse rotation for orthonormal uWorldToDisk
  vec3 worldDir = dirDisk * uWorldToDisk;
  return textureCube(uBackground, worldDir).rgb;
}

// Volumetric supernova shell between R-thickness and R, with fbm filaments.
vec3 shellEmission(vec3 ro, vec3 rd) {
  float R = uShellRadius;
  if (R <= 0.01) return vec3(0.0);
  float thick = 0.18 * R + 0.4;
  vec2 tOut = sphereInterval(ro, rd, R);
  if (tOut.y < 0.0) return vec3(0.0);
  float t0 = max(tOut.x, 0.0);
  float t1 = tOut.y;
  // cooled color: FLASH = white, SHELL cools with progress, BIRTH = fully cooled + fading
  float coolT = uPhase == 2 ? 0.0 : (uPhase == 3 ? uProgress : 1.0);
  float fade = uPhase == 4 ? (1.0 - uProgress) : 1.0;
  vec3 acc = vec3(0.0);
  for (int i = 0; i < SHELL_SAMPLES; i++) {
    float t = mix(t0, t1, (float(i) + 0.5) / float(SHELL_SAMPLES));
    vec3 p = ro + rd * t;
    float pr = length(p);
    float band = exp(-pow((pr - (R - thick * 0.5)) / (thick * 0.5), 2.0));
    if (band < 0.01) continue;
    vec3 dir = p / max(pr, 1e-4);
    float fil = pow(fbm(dir * 6.0 + vec3(0.0, 0.0, 1.7)), 3.0) * 2.5;   // filaments
    float aniso = 0.55 + 0.9 * fbm(dir * 2.1 + vec3(13.1));             // large-scale asymmetry
    acc += shellColorRamp(coolT) * band * fil * aniso;
  }
  return acc * (t1 - t0) / float(SHELL_SAMPLES) * 0.6 * fade;
}

// Accretion disk emission at a plane-crossing point.
vec3 diskSample(vec3 cp, float cr, vec3 stepDir) {
  float azimuth = atan(cp.z, cp.x);
  float omega = 1.1 * pow(cr, -1.5) * 6.2831853;     // Keplerian differential rotation
  float ang = azimuth - omega * uTime;
  vec2 q = vec2(cos(ang), sin(ang)) * cr;
  float turb = 0.25 + 1.75 * pow(fbm(vec3(q * 0.9, cr * 0.35)), 2.0);

  float tNorm = clamp(1.0 - (cr - DISK_INNER) / (DISK_OUTER - DISK_INNER), 0.0, 1.0);
  vec3 bb = blackbody(pow(tNorm, 0.75));             // T ~ r^-3/4

  vec3 vdir = normalize(vec3(-cp.z, 0.0, cp.x));     // orbital direction
  float beta = clamp(sqrt(0.5 / max(cr - 1.0, 0.8)), 0.0, 0.6);
  float cosTheta = dot(vdir, -stepDir);              // photon travels -stepDir to observer
  float beam = pow(1.0 / max(1.0 - beta * cosTheta, 0.3), 3.5);

  float g = sqrt(max(1.0 - 1.0 / cr, 0.0));          // gravitational redshift dimming
  float radial = pow(DISK_INNER / cr, 1.6);
  float edges = smoothstep(DISK_INNER, DISK_INNER + 0.35, cr)
              * (1.0 - smoothstep(DISK_OUTER - 2.5, DISK_OUTER, cr));
  float front = mix(DISK_INNER, DISK_OUTER + 2.0, uIgnition);
  float lit = smoothstep(front + 1.0, front - 1.0, cr); // ignites inner-out (BIRTH)

  return bb * turb * beam * g * radial * edges * lit * 2.4;
}

// Bipolar jets, sampled volumetrically along the march.
vec3 jetSample(vec3 p) {
  float ay = abs(p.y);
  if (ay < 0.5 || ay > JET_LEN) return vec3(0.0);
  float rho = length(p.xz);
  float coneR = 0.25 + JET_TAN * ay;
  float radial = exp(-pow(rho / coneR, 2.0) * 2.0);
  if (radial < 0.01) return vec3(0.0);
  float knots = 0.3 + 1.4 * pow(
    fbm(vec3(rho * 1.5, p.y * 0.35 - sign(p.y) * uTime * 2.2, atan(p.z, p.x) * 1.5)), 2.0);
  float lf = 1.0 - ay / JET_LEN;
  return vec3(0.55, 0.7, 1.0) * radial * knots * lf * lf * 0.035 * uIgnition;
}

// Schwarzschild null geodesic march: u'' = 1.5*L*u^2 - u, u = 1/r, r_s = 1.
vec3 marchBlackHole(vec3 ro, vec3 rd) {
  float r0 = length(ro);
  vec3 er = ro / r0;
  vec3 nvec = cross(er, rd);
  float nlen = length(nvec);
  if (nlen < 1e-4) {
    // purely radial ray
    if (dot(rd, er) < 0.0) return vec3(0.0);
    return sampleBackground(rd);
  }
  vec3 n = nvec / nlen;
  vec3 et = cross(n, er);                  // in-plane tangent, dot(rd, et) >= 0
  float u = 1.0 / r0;
  float drds = dot(rd, er);
  float rdphids = max(dot(rd, et), 1e-6);
  float up = -drds * u / rdphids;          // du/dphi

  float phi = 0.0;
  vec3 col = vec3(0.0);
  vec3 prevPos = ro;
  vec3 pos = ro;
  float minR = r0;
  int crossings = 0;
  bool escaped = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    float r = 1.0 / max(u, 1e-6);
    float dphi = r < 3.0 ? 0.015 : (r < 10.0 ? 0.04 : 0.12);

    // RK2 midpoint
    float a1 = 1.5 * uLensing * u * u - u;
    float um = u + up * 0.5 * dphi;
    float upm = up + a1 * 0.5 * dphi;
    float a2 = 1.5 * uLensing * um * um - um;
    u += upm * dphi;
    up += a2 * dphi;
    phi += dphi;

    if (u <= 0.0) { escaped = true; break; }
    float rNew = 1.0 / u;
    minR = min(minR, rNew);
    if (rNew < 1.0) break;                  // captured by horizon
    pos = (cos(phi) * er + sin(phi) * et) * rNew;

    if (uIgnition > 0.001 && crossings < 3 && sign(pos.y) != sign(prevPos.y)) {
      float f = abs(prevPos.y) / max(abs(prevPos.y) + abs(pos.y), 1e-6);
      vec3 cp = mix(prevPos, pos, f);
      float cr = length(cp.xz);
      if (cr > DISK_INNER && cr < DISK_OUTER) {
        col += diskSample(cp, cr, normalize(pos - prevPos));
      }
      crossings++;
    }

    if (uIgnition > 0.001) col += jetSample(pos) * length(pos - prevPos);

    if (rNew > ESCAPE_R && up < 0.0) { escaped = true; break; }
    prevPos = pos;
  }

  // photon-ring rim from closest approach to the photon sphere (1.5 r_s)
  float ring = exp(-pow((minR - 1.5) * 2.8, 2.0));
  col += vec3(1.0, 0.9, 0.75) * ring * 0.6 * uLensing * uIgnition;

  if (escaped) {
    vec3 outDir = rd;
    if (length(pos - prevPos) > 1e-6) outDir = normalize(pos - prevPos);
    col += sampleBackground(outDir);
  }
  return col;
}

// Phases 0-2 (+3): analytic star + shell + straight-ray background. No march.
vec3 preBirthScene(vec3 ro, vec3 rd) {
  vec3 col = sampleBackground(rd);
  float effR = uStarRadius;
  if (uPhase == 0) effR *= 1.0 + 0.02 * sin(uTime * 0.7);   // gentle pulsation
  if (effR > 0.01) {
    vec2 t = sphereInterval(ro, rd, effR);
    if (t.x > 0.0) {
      vec3 nrm = (ro + rd * t.x) / effR;
      col = starSurface(nrm, rd, uTime, uPhase == 1 ? uProgress : 0.0);
    }
  }
  if (uPhase == 2 || uPhase == 3) col += shellEmission(ro, rd);
  return col;
}

void main() {
  vec2 ndc = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  vec4 pw = uInvProjView * vec4(ndc, 0.5, 1.0);
  vec3 rdWorld = normalize(pw.xyz / pw.w - uCamPos);
  vec3 ro = uWorldToDisk * uCamPos;
  vec3 rd = uWorldToDisk * rdWorld;

  vec3 col;
  if (uPhase < 4) {
    col = preBirthScene(ro, rd);
  } else {
    col = marchBlackHole(ro, rd);
    if (uPhase == 4) col += shellEmission(ro, rd);   // remnant fading during BIRTH
  }
  col += vec3(uFlash);
  gl_FragColor = vec4(col, 1.0);
}
`
