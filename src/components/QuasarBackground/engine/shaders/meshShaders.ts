import { GLSL_BLACKBODY, GLSL_NOISE, GLSL_SHELL_COLOR, GLSL_STAR_SURFACE } from './chunks'

/** Disk: RingGeometry lies in object XY; the mesh is rotated flat by MeshRenderer. */
export const DISK_VERT = /* glsl */ `
varying vec2 vPos;
void main() {
  vPos = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const DISK_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uIgnition;
uniform float uInner;
uniform float uOuter;
varying vec2 vPos;
${GLSL_NOISE}
${GLSL_BLACKBODY}
void main() {
  float r = length(vPos);
  float azimuth = atan(vPos.y, vPos.x);
  float omega = 1.1 * pow(r, -1.5) * 6.2831853;
  float ang = azimuth - omega * uTime;
  vec2 q = vec2(cos(ang), sin(ang)) * r;
  float turb = 0.25 + 1.75 * pow(fbm(vec3(q * 0.9, r * 0.35)), 2.0);

  float tNorm = clamp(1.0 - (r - uInner) / (uOuter - uInner), 0.0, 1.0);
  vec3 bb = blackbody(pow(tNorm, 0.75));

  // Static Doppler approximation: fixed approaching side (fallback-tier compromise).
  float beam = pow(1.0 / (1.0 - 0.45 * sin(azimuth)), 2.5);

  float radial = pow(uInner / r, 1.6);
  float edges = smoothstep(uInner, uInner + 0.35, r)
              * (1.0 - smoothstep(uOuter - 2.5, uOuter, r));
  float front = mix(uInner, uOuter + 2.0, uIgnition);
  float lit = smoothstep(front + 1.0, front - 1.0, r);

  gl_FragColor = vec4(bb * turb * beam * radial * edges * lit * 2.0, 1.0);
}
`

/** Jets: open-ended cones, vUv.y runs base->tip. */
export const JET_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const JET_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uIgnition;
varying vec2 vUv;
${GLSL_NOISE}
void main() {
  float knots = 0.3 + 1.4 * pow(
    fbm(vec3(vUv.x * 6.2831853, vUv.y * 18.0 - uTime * 2.2, 0.0)), 2.0);
  float lengthFade = pow(1.0 - vUv.y, 2.0);
  gl_FragColor = vec4(vec3(0.55, 0.7, 1.0) * knots * lengthFade * uIgnition * 0.6, 1.0);
}
`

export const STAR_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
}
`

export const STAR_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uCollapse;
varying vec3 vNormal;
varying vec3 vWorldPos;
${GLSL_NOISE}
${GLSL_STAR_SURFACE}
void main() {
  vec3 rd = normalize(vWorldPos - cameraPosition);
  gl_FragColor = vec4(starSurface(normalize(vNormal), rd, uTime, uCollapse), 1.0);
}
`

/** Supernova shell as shader-driven points: dir/seed attributes, radius uniform. */
export const SHELL_VERT = /* glsl */ `
attribute vec3 dir;
attribute float seed;
uniform float uShellRadius;
varying float vSeed;
void main() {
  vSeed = seed;
  vec3 p = dir * uShellRadius * (1.0 + 0.22 * (seed - 0.5));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (60.0 + 90.0 * seed) / max(-mv.z, 1.0);
  gl_Position = projectionMatrix * mv;
}
`

export const SHELL_FRAG = /* glsl */ `
precision highp float;
uniform float uCool;
uniform float uFade;
varying float vSeed;
${GLSL_SHELL_COLOR}
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float soft = smoothstep(0.5, 0.05, length(c));
  float alpha = soft * (0.25 + 0.75 * fract(vSeed * 7.13)) * uFade;
  gl_FragColor = vec4(shellColorRamp(uCool) * alpha, 1.0);
}
`
