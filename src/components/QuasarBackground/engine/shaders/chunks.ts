/** Shared GLSL chunks (GLSL ES 1.0, used by both tiers). */

export const GLSL_NOISE = /* glsl */ `
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float a = hash13(i);
  float b = hash13(i + vec3(1.0, 0.0, 0.0));
  float c = hash13(i + vec3(0.0, 1.0, 0.0));
  float d = hash13(i + vec3(1.0, 1.0, 0.0));
  float e = hash13(i + vec3(0.0, 0.0, 1.0));
  float g = hash13(i + vec3(1.0, 0.0, 1.0));
  float h = hash13(i + vec3(0.0, 1.0, 1.0));
  float k = hash13(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
    mix(mix(e, g, u.x), mix(h, k, u.x), u.y),
    u.z
  );
}
float fbm(vec3 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * vnoise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return v;
}
`

export const GLSL_BLACKBODY = /* glsl */ `
// Normalized temperature t in [0,1] (0 = cool outer disk, 1 = ISCO) -> RGB.
vec3 blackbody(float t) {
  vec3 cold = vec3(0.55, 0.12, 0.03);
  vec3 mid  = vec3(1.00, 0.45, 0.10);
  vec3 warm = vec3(1.00, 0.85, 0.55);
  vec3 hot  = vec3(0.75, 0.85, 1.00);
  if (t < 0.33) return mix(cold, mid, t / 0.33);
  if (t < 0.66) return mix(mid, warm, (t - 0.33) / 0.33);
  return mix(warm, hot, (t - 0.66) / 0.34);
}
`

export const GLSL_SHELL_COLOR = /* glsl */ `
// Supernova ejecta cooling: white -> yellow -> orange -> deep red. HDR (>1 feeds bloom).
vec3 shellColorRamp(float t) {
  vec3 white  = vec3(1.30, 1.25, 1.15);
  vec3 yellow = vec3(1.20, 0.95, 0.45);
  vec3 orange = vec3(1.00, 0.45, 0.12);
  vec3 red    = vec3(0.60, 0.12, 0.05);
  if (t < 0.2) return mix(white, yellow, t / 0.2);
  if (t < 0.55) return mix(yellow, orange, (t - 0.2) / 0.35);
  return mix(orange, red, (t - 0.55) / 0.45);
}
`

export const GLSL_STAR_SURFACE = /* glsl */ `
// Red supergiant surface: convective granulation + limb darkening.
// collapse in [0,1] brightens the core during COLLAPSE.
vec3 starSurface(vec3 nrm, vec3 rd, float time, float collapse) {
  float gran = fbm(nrm * 6.0 + vec3(0.0, time * 0.12, 0.0));
  vec3 base = mix(vec3(0.85, 0.18, 0.04), vec3(1.0, 0.62, 0.25), gran);
  float limb = pow(max(dot(nrm, -rd), 0.0), 0.55);
  float brighten = 1.0 + 7.0 * collapse * collapse;
  return base * limb * brighten * 1.6;
}
`

export const GLSL_SPHERE_INTERVAL = /* glsl */ `
// Ray/sphere (centered at origin): returns (tNear, tFar), or (-1,-1) on miss.
vec2 sphereInterval(vec3 ro, vec3 rd, float R) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - R * R;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}
`
