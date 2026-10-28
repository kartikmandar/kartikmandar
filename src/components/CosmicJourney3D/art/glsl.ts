// src/components/CosmicJourney3D/art/glsl.ts
// Shared GLSL snippets for the art kit.

/** Value noise + fbm. hash13 follows the "Hash without Sine" pattern (Dave Hoskins, MIT). */
export const NOISE_GLSL = /* glsl */ `
float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash13(i);
  float b = hash13(i + vec3(1.0, 0.0, 0.0));
  float c = hash13(i + vec3(0.0, 1.0, 0.0));
  float d = hash13(i + vec3(1.0, 1.0, 0.0));
  float e = hash13(i + vec3(0.0, 0.0, 1.0));
  float g = hash13(i + vec3(1.0, 0.0, 1.0));
  float h = hash13(i + vec3(0.0, 1.0, 1.0));
  float k = hash13(i + vec3(1.0, 1.0, 1.0));
  return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), mix(mix(e, g, f.x), mix(h, k, f.x), f.y), f.z);
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

/** Instancing-aware position/normal transform for custom ShaderMaterials. */
export const INSTANCED_VERTEX_GLSL = /* glsl */ `
vec4 instancedPosition(vec3 p) {
  vec4 local = vec4(p, 1.0);
  #ifdef USE_INSTANCING
    local = instanceMatrix * local;
  #endif
  return local;
}
vec3 instancedNormal(vec3 n) {
  #ifdef USE_INSTANCING
    n = mat3(instanceMatrix) * n;
  #endif
  return n;
}
`
