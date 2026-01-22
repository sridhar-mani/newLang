import type { BlendMode } from './layer-types';

export interface BlendFunction {
  name: BlendMode;
  label: string;
  description: string;
  glsl: string;
  category: 'basic' | 'darken' | 'lighten' | 'contrast' | 'color';
}

const blendFunctions: Record<BlendMode, BlendFunction> = {
  normal: {
    name: 'normal',
    label: 'Normal',
    description: 'Standard alpha blending',
    category: 'basic',
    glsl: `
fn blendNormal(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  return mix(base, blend, opacity);
}`,
  },

  add: {
    name: 'add',
    label: 'Add',
    description: 'Linear dodge, brightens image',
    category: 'lighten',
    glsl: `
fn blendAdd(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  return mix(base, min(base + blend, vec3f(1.0)), opacity);
}`,
  },

  multiply: {
    name: 'multiply',
    label: 'Multiply',
    description: 'Darkens by multiplying colors',
    category: 'darken',
    glsl: `
fn blendMultiply(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  return mix(base, base * blend, opacity);
}`,
  },

  screen: {
    name: 'screen',
    label: 'Screen',
    description: 'Lightens by inverting and multiplying',
    category: 'lighten',
    glsl: `
fn blendScreen(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  return mix(base, 1.0 - (1.0 - base) * (1.0 - blend), opacity);
}`,
  },

  overlay: {
    name: 'overlay',
    label: 'Overlay',
    description: 'Combines multiply and screen',
    category: 'contrast',
    glsl: `
fn blendOverlay(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  let result = select(
    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
    2.0 * base * blend,
    base < vec3f(0.5)
  );
  return mix(base, result, opacity);
}`,
  },

  softLight: {
    name: 'softLight',
    label: 'Soft Light',
    description: 'Softer version of overlay',
    category: 'contrast',
    glsl: `
fn blendSoftLight(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  let result = select(
    base - (1.0 - 2.0 * blend) * base * (1.0 - base),
    base + (2.0 * blend - 1.0) * (sqrt(base) - base),
    blend > vec3f(0.5)
  );
  return mix(base, result, opacity);
}`,
  },

  hardLight: {
    name: 'hardLight',
    label: 'Hard Light',
    description: 'Strong contrast like harsh spotlight',
    category: 'contrast',
    glsl: `
fn blendHardLight(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  let result = select(
    1.0 - 2.0 * (1.0 - blend) * (1.0 - base),
    2.0 * blend * base,
    blend < vec3f(0.5)
  );
  return mix(base, result, opacity);
}`,
  },

  colorDodge: {
    name: 'colorDodge',
    label: 'Color Dodge',
    description: 'Brightens base by decreasing contrast',
    category: 'lighten',
    glsl: `
fn blendColorDodge(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  let result = select(
    min(base / (1.0 - blend), vec3f(1.0)),
    vec3f(1.0),
    blend >= vec3f(1.0)
  );
  return mix(base, result, opacity);
}`,
  },

  colorBurn: {
    name: 'colorBurn',
    label: 'Color Burn',
    description: 'Darkens base by increasing contrast',
    category: 'darken',
    glsl: `
fn blendColorBurn(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  let result = select(
    1.0 - min((1.0 - base) / blend, vec3f(1.0)),
    vec3f(0.0),
    blend <= vec3f(0.0)
  );
  return mix(base, result, opacity);
}`,
  },

  darken: {
    name: 'darken',
    label: 'Darken',
    description: 'Keeps darker of base and blend',
    category: 'darken',
    glsl: `
fn blendDarken(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  return mix(base, min(base, blend), opacity);
}`,
  },

  lighten: {
    name: 'lighten',
    label: 'Lighten',
    description: 'Keeps lighter of base and blend',
    category: 'lighten',
    glsl: `
fn blendLighten(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  return mix(base, max(base, blend), opacity);
}`,
  },

  difference: {
    name: 'difference',
    label: 'Difference',
    description: 'Absolute difference between colors',
    category: 'contrast',
    glsl: `
fn blendDifference(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  return mix(base, abs(base - blend), opacity);
}`,
  },

  exclusion: {
    name: 'exclusion',
    label: 'Exclusion',
    description: 'Softer difference blend',
    category: 'contrast',
    glsl: `
fn blendExclusion(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  return mix(base, base + blend - 2.0 * base * blend, opacity);
}`,
  },

  hue: {
    name: 'hue',
    label: 'Hue',
    description: 'Applies hue of blend to base',
    category: 'color',
    glsl: `
fn rgb2hsl(c: vec3f) -> vec3f {
  let cMax = max(max(c.r, c.g), c.b);
  let cMin = min(min(c.r, c.g), c.b);
  let delta = cMax - cMin;
  let l = (cMax + cMin) * 0.5;
  var h = 0.0;
  var s = 0.0;
  if (delta > 0.0) {
    s = delta / (1.0 - abs(2.0 * l - 1.0));
    if (cMax == c.r) { h = ((c.g - c.b) / delta) % 6.0; }
    else if (cMax == c.g) { h = (c.b - c.r) / delta + 2.0; }
    else { h = (c.r - c.g) / delta + 4.0; }
    h = h / 6.0;
    if (h < 0.0) { h = h + 1.0; }
  }
  return vec3f(h, s, l);
}

fn hsl2rgb(hsl: vec3f) -> vec3f {
  let c = (1.0 - abs(2.0 * hsl.z - 1.0)) * hsl.y;
  let x = c * (1.0 - abs((hsl.x * 6.0) % 2.0 - 1.0));
  let m = hsl.z - c * 0.5;
  var rgb = vec3f(0.0);
  let h = hsl.x * 6.0;
  if (h < 1.0) { rgb = vec3f(c, x, 0.0); }
  else if (h < 2.0) { rgb = vec3f(x, c, 0.0); }
  else if (h < 3.0) { rgb = vec3f(0.0, c, x); }
  else if (h < 4.0) { rgb = vec3f(0.0, x, c); }
  else if (h < 5.0) { rgb = vec3f(x, 0.0, c); }
  else { rgb = vec3f(c, 0.0, x); }
  return rgb + m;
}

fn blendHue(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  let baseHSL = rgb2hsl(base);
  let blendHSL = rgb2hsl(blend);
  let result = hsl2rgb(vec3f(blendHSL.x, baseHSL.y, baseHSL.z));
  return mix(base, result, opacity);
}`,
  },

  saturation: {
    name: 'saturation',
    label: 'Saturation',
    description: 'Applies saturation of blend to base',
    category: 'color',
    glsl: `
fn blendSaturation(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  let baseHSL = rgb2hsl(base);
  let blendHSL = rgb2hsl(blend);
  let result = hsl2rgb(vec3f(baseHSL.x, blendHSL.y, baseHSL.z));
  return mix(base, result, opacity);
}`,
  },

  color: {
    name: 'color',
    label: 'Color',
    description: 'Applies hue and saturation of blend',
    category: 'color',
    glsl: `
fn blendColor(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  let baseHSL = rgb2hsl(base);
  let blendHSL = rgb2hsl(blend);
  let result = hsl2rgb(vec3f(blendHSL.x, blendHSL.y, baseHSL.z));
  return mix(base, result, opacity);
}`,
  },

  luminosity: {
    name: 'luminosity',
    label: 'Luminosity',
    description: 'Applies luminosity of blend to base colors',
    category: 'color',
    glsl: `
fn blendLuminosity(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  let baseHSL = rgb2hsl(base);
  let blendHSL = rgb2hsl(blend);
  let result = hsl2rgb(vec3f(baseHSL.x, baseHSL.y, blendHSL.z));
  return mix(base, result, opacity);
}`,
  },
};

export function getBlendFunction(mode: BlendMode): BlendFunction {
  return blendFunctions[mode];
}

export function getAllBlendModes(): BlendFunction[] {
  return Object.values(blendFunctions);
}

export function getBlendModesByCategory(category: BlendFunction['category']): BlendFunction[] {
  return Object.values(blendFunctions).filter((b) => b.category === category);
}

export function generateBlendShaderCode(modes: BlendMode[]): string {
  const uniqueModes = [...new Set(modes)];
  const needsHSL = uniqueModes.some((m) =>
    ['hue', 'saturation', 'color', 'luminosity'].includes(m)
  );

  let code = '';

  if (needsHSL) {
    code += blendFunctions.hue.glsl.split('fn blendHue')[0];
  }

  for (const mode of uniqueModes) {
    const fn = blendFunctions[mode];
    if (mode === 'hue' && needsHSL) {
      code += `
fn blendHue(base: vec3f, blend: vec3f, opacity: f32) -> vec3f {
  let baseHSL = rgb2hsl(base);
  let blendHSL = rgb2hsl(blend);
  let result = hsl2rgb(vec3f(blendHSL.x, baseHSL.y, baseHSL.z));
  return mix(base, result, opacity);
}`;
    } else if (['saturation', 'color', 'luminosity'].includes(mode)) {
      const shortGlsl = fn.glsl.split('fn blend')[1];
      code += `\nfn blend${shortGlsl}`;
    } else {
      code += fn.glsl;
    }
  }

  return code;
}
