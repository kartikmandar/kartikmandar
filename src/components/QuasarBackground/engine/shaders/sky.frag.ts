import { GLSL_BLACKBODY, GLSL_NOISE } from './chunks'

/**
 * Procedural astrophoto sky (spec 2026-06-12-procedural-sky-background).
 * Pure function of view direction; baked once into the background cubemap by
 * `bakeBackgroundCubemap`. Everything derives from SKY_SEED + the const
 * arrays below, so the sky is identical on every visit.
 */

export const SKY_SEED = 7.31

type Vec3 = readonly [number, number, number]

const f = (n: number): string => n.toFixed(5)
const v3 = (v: Vec3): string => `vec3(${f(v[0])}, ${f(v[1])}, ${f(v[2])})`

function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2])
  return [v[0] / l, v[1] / l, v[2] / l]
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

/**
 * Galactic frame: pole tilted ~45° from the accretion-disk normal so the
 * Milky Way band crosses the default view without lying in the disk plane.
 * g = (dot(u,dir), dot(pole,dir), dot(v,dir)); latitude = asin(g.y).
 */
const GALACTIC_POLE = normalize([0.52, 0.8, -0.05])
const GALACTIC_U = normalize(cross(GALACTIC_POLE, [1, 0, 0]))
export const GALACTIC_BASIS = {
  u: GALACTIC_U,
  pole: GALACTIC_POLE,
  v: cross(GALACTIC_POLE, GALACTIC_U),
} as const

export interface HeroStar {
  dir: Vec3
  /** Peak HDR flux, 1.5-4.0: above the 0.85 bloom threshold by design. */
  flux: number
  /** Normalized blackbody temperature, 0 = cool red, 1 = hot blue. */
  temp: number
}

/** The ~12 brightest stars, hand-placed so the sky's anchors are art-directable. */
export const HERO_STARS: HeroStar[] = (
  [
    { dir: [0.2, 0.3, -0.93], flux: 3.8, temp: 0.85 },
    { dir: [-0.55, 0.1, -0.8], flux: 2.4, temp: 0.55 },
    { dir: [0.75, -0.2, -0.6], flux: 2.0, temp: 0.3 },
    { dir: [-0.85, 0.45, 0.25], flux: 3.2, temp: 0.65 },
    { dir: [0.1, -0.8, -0.55], flux: 2.8, temp: 0.15 },
    { dir: [0.6, 0.7, 0.35], flux: 1.9, temp: 0.75 },
    { dir: [-0.2, -0.45, 0.85], flux: 2.2, temp: 0.5 },
    { dir: [0.9, 0.25, 0.3], flux: 1.7, temp: 0.95 },
    { dir: [-0.7, -0.6, -0.35], flux: 2.6, temp: 0.4 },
    { dir: [0.35, -0.15, 0.92], flux: 1.6, temp: 0.6 },
    { dir: [-0.95, -0.05, 0.3], flux: 1.8, temp: 0.25 },
    { dir: [0.45, 0.85, -0.25], flux: 3.0, temp: 0.7 },
  ] satisfies HeroStar[]
).map((s) => ({ ...s, dir: normalize(s.dir) }))

/**
 * Andromeda-like hero spiral: ~3° across, ~33° lower-left of the default view
 * axis (clear of the progenitor star's ~14.5° silhouette) and ~39° off the
 * Milky Way band.
 */
const HERO_GALAXY = {
  dir: normalize([-0.42, -0.52, -0.74]),
  /** Apparent radius in radians (~1.5°). */
  size: 0.026,
  /** Minor-axis squash; ~2.9 reads as ~70° inclination. */
  squash: 2.9,
  /** Position angle of the major axis. */
  angle: 0.7,
  gain: 0.65,
}

const COMPANION_DIR = normalize([
  HERO_GALAXY.dir[0] + 0.03,
  HERO_GALAXY.dir[1] - 0.028,
  HERO_GALAXY.dir[2] + 0.012,
])

const MAGELLANIC_DIR = normalize([0.55, -0.65, 0.52])

export const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position; // sky sphere is centered on the cube camera: position IS the direction
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export function buildSkyFragment(): string {
  const heroCalls = HERO_STARS.map(
    (s) => `  col += heroStar(dir, ${v3(s.dir)}, ${f(s.flux)}, ${f(s.temp)});`,
  ).join('\n')

  return /* glsl */ `
precision highp float;

varying vec3 vDir;

#define SEED ${f(SKY_SEED)}
#define GAL_U ${v3(GALACTIC_BASIS.u)}
#define GAL_POLE ${v3(GALACTIC_BASIS.pole)}
#define GAL_V ${v3(GALACTIC_BASIS.v)}
#define BULGE_LON 2.4
#define HG_DIR ${v3(HERO_GALAXY.dir)}
#define HG_SIZE ${f(HERO_GALAXY.size)}
#define HG_SQUASH ${f(HERO_GALAXY.squash)}
#define HG_ANG ${f(HERO_GALAXY.angle)}
#define HG_GAIN ${f(HERO_GALAXY.gain)}

${GLSL_NOISE}
${GLSL_BLACKBODY}

// Gaussian in sin(galactic latitude); width is in sin-units.
float bandGauss(vec3 d, float width) {
  float s = dot(GAL_POLE, d);
  return exp(-(s * s) / (width * width));
}

// Star density rises toward the galactic plane.
float bandStarBoost(vec3 d) {
  return mix(1.0, 2.6, bandGauss(d, 0.30));
}

// Milky Way: latitude-gaussian glow x fbm clouds, a bulge at one longitude,
// and multiplicative dust extinction that darkens AND reddens the mid-plane.
vec3 milkyWay(vec3 d) {
  vec3 g = vec3(dot(GAL_U, d), dot(GAL_POLE, d), dot(GAL_V, d));
  float band = exp(-pow(g.y / 0.20, 2.0));
  if (band < 0.003) return vec3(0.0);
  // noise over rotated direction-space (no longitude in the noise: no atan seam)
  float clouds = 0.30 + 1.1 * fbm(vec3(g.x, g.y * 3.5, g.z) * 3.6 + vec3(SEED));
  float lon = atan(g.z, g.x);
  float bulge = exp((cos(lon - BULGE_LON) - 1.0) * 2.5) * exp(-pow(g.y / 0.30, 2.0));
  float glow = band * clouds * (0.45 + 1.5 * bulge);
  float dustF = fbm(vec3(g.x, g.y * 6.0, g.z) * 6.5 + vec3(SEED * 1.7));
  float tau = 3.4 * pow(dustF, 2.4) * exp(-pow(g.y / 0.085, 2.0)) * (0.55 + bulge);
  vec3 transmission = exp(-tau * vec3(0.85, 1.25, 1.80)); // blue extinguished most
  vec3 tint = mix(vec3(0.72, 0.80, 1.00), vec3(1.00, 0.90, 0.72), clamp(bulge * 1.4, 0.0, 1.0));
  return tint * glow * transmission * 0.30;
}

// One octave of cell-hashed stars: each cell hosts at most one star at a
// hashed sub-cell direction; 27-neighbor search (bake-once, cost acceptable).
vec3 starLayer(vec3 dir, float freq, float prob, float baseFlux, float sigma, float seed) {
  vec3 base = floor(dir * freq);
  vec3 acc = vec3(0.0);
  for (int x = -1; x <= 1; x++)
  for (int y = -1; y <= 1; y++)
  for (int z = -1; z <= 1; z++) {
    vec3 cell = base + vec3(float(x), float(y), float(z));
    vec3 sp = cell + vec3(
      hash13(cell + seed + 11.0),
      hash13(cell + seed + 23.0),
      hash13(cell + seed + 37.0));
    if (dot(sp, sp) < 1e-6) continue;
    vec3 sd = normalize(sp);
    if (hash13(cell + seed) > prob * bandStarBoost(sd)) continue;
    float d = length(dir - sd); // chord ~ angle for small separations
    float psf = exp(-(d * d) / (sigma * sigma));
    if (psf < 0.002) continue;
    float h2 = hash13(cell + seed + 53.0);
    float flux = baseFlux * mix(0.12, 1.0, h2 * h2 * h2); // power-law-ish magnitudes
    vec3 tint = mix(vec3(1.0), blackbody(hash13(cell + seed + 71.0)), 0.35);
    acc += tint * flux * psf;
  }
  return acc;
}

// Four octaves: frequency doubles, flux roughly quarters -> deep star field.
vec3 starField(vec3 d) {
  vec3 c = vec3(0.0);
  c += starLayer(d, 24.0, 0.20, 0.55, 0.0042, SEED + 1.0);
  c += starLayer(d, 48.0, 0.14, 0.22, 0.0036, SEED + 2.0);
  c += starLayer(d, 96.0, 0.08, 0.09, 0.0030, SEED + 3.0);
  c += starLayer(d, 192.0, 0.035, 0.04, 0.0026, SEED + 4.0);
  return c;
}

// Sparse field of faint galaxies: Sersic-ish blobs, random inclination,
// arm hints when face-on, a dark mid-line when edge-on. Suppressed in the
// band (zone of avoidance). All well below the bloom threshold.
vec3 galaxyField(vec3 dir) {
  float freq = 6.5;
  vec3 base = floor(dir * freq);
  vec3 acc = vec3(0.0);
  for (int x = -1; x <= 1; x++)
  for (int y = -1; y <= 1; y++)
  for (int z = -1; z <= 1; z++) {
    vec3 cell = base + vec3(float(x), float(y), float(z));
    vec3 gp = cell + vec3(
      hash13(cell + SEED + 113.0),
      hash13(cell + SEED + 127.0),
      hash13(cell + SEED + 139.0));
    if (dot(gp, gp) < 1e-6) continue;
    vec3 gd = normalize(gp);
    float avoidance = 1.0 - 0.75 * bandGauss(gd, 0.22);
    if (hash13(cell + SEED + 101.0) > 0.16 * avoidance) continue;
    float d = length(dir - gd);
    if (d > 0.06) continue;
    vec3 ref = abs(gd.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 U = normalize(cross(gd, ref));
    vec3 V = cross(gd, U);
    vec3 o = dir - gd;
    float ang = 6.2831853 * hash13(cell + SEED + 149.0);
    float ca = cos(ang);
    float sa = sin(ang);
    vec2 q = vec2(ca * dot(o, U) - sa * dot(o, V), sa * dot(o, U) + ca * dot(o, V));
    float h3 = hash13(cell + SEED + 151.0);
    float squash = mix(1.0, 4.5, h3 * h3); // 1 = face-on, 4.5 = near edge-on
    q.y *= squash;
    float s = mix(0.0028, 0.0085, hash13(cell + SEED + 163.0));
    float r = length(q);
    float I = exp(-pow(r / s + 1e-5, 0.65));
    float phi = atan(q.y, q.x);
    float faceOn = 1.0 - smoothstep(1.8, 3.0, squash);
    I *= 1.0 + 0.35 * faceOn * cos(2.0 * phi - 4.5 * log(r / s + 0.25));
    float edgeOn = smoothstep(2.6, 4.0, squash);
    I *= 1.0 - 0.5 * edgeOn * exp(-pow(q.y / (0.18 * s), 2.0));
    float h5 = hash13(cell + SEED + 167.0);
    vec3 tint = mix(vec3(1.0, 0.93, 0.82), vec3(0.85, 0.88, 1.00), h5);
    acc += tint * I * mix(0.05, 0.16, h5);
  }
  return acc;
}

// The art-directed hero spiral: Sersic bulge + log-spiral arms x fbm clumps,
// near-side dust lane, warm bulge -> blue arms, faint halo.
vec3 heroGalaxy(vec3 dir) {
  float d = length(dir - HG_DIR);
  if (d > HG_SIZE * 4.0) return vec3(0.0);
  vec3 U = normalize(cross(HG_DIR, vec3(0.0, 1.0, 0.0)));
  vec3 V = cross(HG_DIR, U);
  vec3 o = dir - HG_DIR;
  float ca = cos(HG_ANG);
  float sa = sin(HG_ANG);
  vec2 q = vec2(ca * dot(o, U) - sa * dot(o, V), sa * dot(o, U) + ca * dot(o, V));
  vec2 qe = vec2(q.x, q.y * HG_SQUASH);
  float re = length(qe);
  float bulge = 1.15 * exp(-pow(re / (0.16 * HG_SIZE) + 1e-5, 0.55));
  float disk = 0.38 * exp(-re / (0.42 * HG_SIZE));
  float phi = atan(qe.y, qe.x);
  float arm = 0.55 + 0.45 * cos(2.0 * phi - 5.5 * log(re / HG_SIZE + 0.12));
  disk *= mix(1.0, arm, smoothstep(0.10 * HG_SIZE, 0.35 * HG_SIZE, re));
  disk *= 0.75 + 0.6 * fbm(vec3(q * (5.0 / HG_SIZE), SEED));
  float dust = 1.0 - 0.55
    * exp(-pow((q.y - 0.05 * HG_SIZE) / (0.06 * HG_SIZE), 2.0))
    * smoothstep(0.12 * HG_SIZE, 0.30 * HG_SIZE, re);
  float bulgeFrac = bulge / max(bulge + disk, 1e-4);
  vec3 col = mix(vec3(0.78, 0.84, 1.00), vec3(1.00, 0.88, 0.70), bulgeFrac) * (bulge + disk) * dust;
  col += vec3(0.95, 0.92, 0.88) * 0.05 * exp(-re / (0.9 * HG_SIZE));
  return col * HG_GAIN;
}

// Soft Sersic-ish blob; fuzz > 0 roughens it into an irregular (LMC-style).
vec3 blob(vec3 dir, vec3 bd, float size, float flux, vec3 tint, float fuzz) {
  float d = length(dir - bd);
  if (d > size * 5.0) return vec3(0.0);
  float I = exp(-pow(d / size + 1e-5, 0.7));
  if (fuzz > 0.0) I *= 0.55 + fuzz * fbm(dir * 60.0 + vec3(SEED));
  return tint * I * flux;
}

// Gaussian core (HDR: feeds bloom) + wide halo + 4-point diffraction spikes.
vec3 heroStar(vec3 dir, vec3 sd, float flux, float temp) {
  float d = length(dir - sd);
  if (d > 0.12) return vec3(0.0);
  float sigma = 0.0045 + 0.0011 * flux;
  float core = exp(-(d * d) / (sigma * sigma));
  float halo = 0.035 * flux * exp(-d / 0.018);
  vec3 ref = abs(sd.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 U = normalize(cross(sd, ref));
  vec3 V = cross(sd, U);
  vec3 o = dir - sd;
  float ox = dot(o, U);
  float oy = dot(o, V);
  float spikeLen = 0.012 * flux;
  float spikeW = 0.0016;
  float spikes = exp(-abs(ox) / spikeLen) * exp(-(oy * oy) / (spikeW * spikeW))
               + exp(-abs(oy) / spikeLen) * exp(-(ox * ox) / (spikeW * spikeW));
  vec3 tint = mix(vec3(1.0), blackbody(temp), 0.40);
  return tint * (flux * core + halo + 0.06 * flux * spikes);
}

// Barely-there nebulosity + dither so the dark sky doesn't band at 8 bits.
vec3 floorGlow(vec3 dir) {
  vec3 c = vec3(0.0035, 0.0040, 0.0055) * (0.5 + fbm(dir * 2.4 + vec3(SEED * 3.1)));
  c += (hash13(dir * 911.7) - 0.5) * 0.003;
  return c;
}

void main() {
  vec3 dir = normalize(vDir);
  vec3 col = vec3(0.0);
  col += milkyWay(dir);
  col += starField(dir);
  col += galaxyField(dir);
  col += heroGalaxy(dir);
  col += blob(dir, ${v3(COMPANION_DIR)}, 0.004, 0.18, vec3(1.00, 0.92, 0.78), 0.0);
  col += blob(dir, ${v3(MAGELLANIC_DIR)}, 0.022, 0.10, vec3(0.95, 0.93, 0.88), 0.9);
${heroCalls}
  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
}
`
}
