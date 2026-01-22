export type BlendMode =
  | 'normal'
  | 'add'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'softLight'
  | 'hardLight'
  | 'colorDodge'
  | 'colorBurn'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export type EffectCategory =
  | 'blur'
  | 'glow'
  | 'distortion'
  | 'color'
  | 'noise'
  | 'stylize'
  | 'lighting'
  | 'transition';

export interface LayerBase {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  mask?: LayerMask;
}

export interface LayerMask {
  type: 'painted' | 'gradient' | 'radial' | 'luminosity';
  data: Float32Array | MaskGradient | MaskRadial;
  inverted: boolean;
  feather: number;
}

export interface MaskGradient {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: 'linear' | 'reflected';
}

export interface MaskRadial {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  falloff: number;
}

export interface EffectParameter {
  name: string;
  type: 'float' | 'int' | 'bool' | 'color' | 'vec2' | 'vec3' | 'vec4' | 'angle' | 'enum';
  value: number | boolean | number[] | string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  label: string;
  group?: string;
}

export interface BlurLayer extends LayerBase {
  type: 'blur';
  effect: 'gaussian' | 'box' | 'motion' | 'radial' | 'zoom' | 'lens';
  params: {
    radius: number;
    angle?: number;
    centerX?: number;
    centerY?: number;
    quality?: 'low' | 'medium' | 'high';
  };
}

export interface GlowLayer extends LayerBase {
  type: 'glow';
  effect: 'bloom' | 'innerGlow' | 'outerGlow' | 'neon' | 'aura';
  params: {
    intensity: number;
    radius: number;
    threshold?: number;
    color?: [number, number, number];
    colorize?: boolean;
  };
}

export interface DistortionLayer extends LayerBase {
  type: 'distortion';
  effect: 'wave' | 'ripple' | 'twirl' | 'pinch' | 'spherize' | 'displace' | 'pixelate';
  params: {
    amount: number;
    frequency?: number;
    phase?: number;
    centerX?: number;
    centerY?: number;
    animationSpeed?: number;
  };
}

export interface ColorLayer extends LayerBase {
  type: 'color';
  effect:
    | 'brightnessContrast'
    | 'hueSaturation'
    | 'levels'
    | 'curves'
    | 'colorBalance'
    | 'vibrance'
    | 'gradient'
    | 'tint'
    | 'invert'
    | 'posterize'
    | 'threshold';
  params: {
    brightness?: number;
    contrast?: number;
    hue?: number;
    saturation?: number;
    lightness?: number;
    vibrance?: number;
    temperature?: number;
    tintColor?: [number, number, number];
    shadows?: [number, number, number];
    midtones?: [number, number, number];
    highlights?: [number, number, number];
    levels?: number;
  };
}

export interface NoiseLayer extends LayerBase {
  type: 'noise';
  effect: 'grain' | 'static' | 'perlin' | 'simplex' | 'voronoi' | 'scanlines';
  params: {
    amount: number;
    scale?: number;
    speed?: number;
    monochrome?: boolean;
    blendAmount?: number;
  };
}

export interface StylizeLayer extends LayerBase {
  type: 'stylize';
  effect:
    | 'vignette'
    | 'chromaticAberration'
    | 'halftone'
    | 'sketch'
    | 'oilPaint'
    | 'mosaic'
    | 'edges'
    | 'emboss'
    | 'sharpen';
  params: {
    intensity: number;
    size?: number;
    angle?: number;
    threshold?: number;
    softness?: number;
    color?: [number, number, number];
  };
}

export interface LightingLayer extends LayerBase {
  type: 'lighting';
  effect: 'pointLight' | 'spotlight' | 'directional' | 'ambient' | 'godRays' | 'caustics';
  params: {
    intensity: number;
    color?: [number, number, number];
    positionX?: number;
    positionY?: number;
    positionZ?: number;
    direction?: [number, number, number];
    falloff?: number;
    angle?: number;
    softness?: number;
    rayLength?: number;
    rayDensity?: number;
  };
}

export interface TransitionLayer extends LayerBase {
  type: 'transition';
  effect: 'fade' | 'wipe' | 'dissolve' | 'zoom' | 'slide' | 'glitch';
  params: {
    progress: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    softness?: number;
    pattern?: 'linear' | 'radial' | 'random';
  };
}

export type EffectLayer =
  | BlurLayer
  | GlowLayer
  | DistortionLayer
  | ColorLayer
  | NoiseLayer
  | StylizeLayer
  | LightingLayer
  | TransitionLayer;

export interface LayerStack {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: EffectLayer[];
  globalBlendMode: BlendMode;
  backgroundColor?: [number, number, number, number];
}

export interface EffectDefinition {
  type: string;
  effect: string;
  category: EffectCategory;
  name: string;
  description: string;
  icon: string;
  defaultParams: Record<string, unknown>;
  parameters: EffectParameter[];
  shaderTemplate: string;
  requiresMultiPass?: boolean;
  gpuIntensive?: boolean;
}

export const EFFECT_REGISTRY: Map<string, EffectDefinition> = new Map();

function registerEffect(def: EffectDefinition): void {
  EFFECT_REGISTRY.set(`${def.type}:${def.effect}`, def);
}

registerEffect({
  type: 'blur',
  effect: 'gaussian',
  category: 'blur',
  name: 'Gaussian Blur',
  description: 'Smooth blur with Gaussian distribution',
  icon: '🌫️',
  defaultParams: { radius: 10, quality: 'medium' },
  parameters: [
    { name: 'radius', type: 'float', value: 10, min: 0, max: 100, label: 'Radius' },
    {
      name: 'quality',
      type: 'enum',
      value: 'medium',
      options: ['low', 'medium', 'high'],
      label: 'Quality',
    },
  ],
  shaderTemplate: 'blur_gaussian',
  requiresMultiPass: true,
});

registerEffect({
  type: 'blur',
  effect: 'motion',
  category: 'blur',
  name: 'Motion Blur',
  description: 'Directional blur simulating motion',
  icon: '💨',
  defaultParams: { radius: 20, angle: 0 },
  parameters: [
    { name: 'radius', type: 'float', value: 20, min: 0, max: 100, label: 'Amount' },
    { name: 'angle', type: 'angle', value: 0, min: -180, max: 180, label: 'Angle' },
  ],
  shaderTemplate: 'blur_motion',
});

registerEffect({
  type: 'glow',
  effect: 'bloom',
  category: 'glow',
  name: 'Bloom',
  description: 'Bright areas glow and bleed into surroundings',
  icon: '✨',
  defaultParams: { intensity: 1, radius: 20, threshold: 0.8 },
  parameters: [
    { name: 'intensity', type: 'float', value: 1, min: 0, max: 3, label: 'Intensity' },
    { name: 'radius', type: 'float', value: 20, min: 0, max: 100, label: 'Radius' },
    { name: 'threshold', type: 'float', value: 0.8, min: 0, max: 1, label: 'Threshold' },
  ],
  shaderTemplate: 'glow_bloom',
  requiresMultiPass: true,
  gpuIntensive: true,
});

registerEffect({
  type: 'glow',
  effect: 'neon',
  category: 'glow',
  name: 'Neon Glow',
  description: 'Colorized edge glow effect',
  icon: '🌈',
  defaultParams: { intensity: 1, radius: 10, color: [1, 0, 1] },
  parameters: [
    { name: 'intensity', type: 'float', value: 1, min: 0, max: 2, label: 'Intensity' },
    { name: 'radius', type: 'float', value: 10, min: 0, max: 50, label: 'Radius' },
    { name: 'color', type: 'color', value: [1, 0, 1], label: 'Color' },
  ],
  shaderTemplate: 'glow_neon',
});

registerEffect({
  type: 'distortion',
  effect: 'wave',
  category: 'distortion',
  name: 'Wave',
  description: 'Animated wave distortion',
  icon: '🌊',
  defaultParams: { amount: 20, frequency: 5, phase: 0, animationSpeed: 1 },
  parameters: [
    { name: 'amount', type: 'float', value: 20, min: 0, max: 100, label: 'Amount' },
    { name: 'frequency', type: 'float', value: 5, min: 0.1, max: 20, label: 'Frequency' },
    { name: 'phase', type: 'float', value: 0, min: 0, max: 6.28, label: 'Phase' },
    { name: 'animationSpeed', type: 'float', value: 1, min: 0, max: 5, label: 'Speed' },
  ],
  shaderTemplate: 'distort_wave',
});

registerEffect({
  type: 'distortion',
  effect: 'ripple',
  category: 'distortion',
  name: 'Ripple',
  description: 'Circular ripple effect from center',
  icon: '💧',
  defaultParams: { amount: 30, frequency: 8, centerX: 0.5, centerY: 0.5 },
  parameters: [
    { name: 'amount', type: 'float', value: 30, min: 0, max: 100, label: 'Amount' },
    { name: 'frequency', type: 'float', value: 8, min: 1, max: 30, label: 'Waves' },
    { name: 'centerX', type: 'float', value: 0.5, min: 0, max: 1, label: 'Center X' },
    { name: 'centerY', type: 'float', value: 0.5, min: 0, max: 1, label: 'Center Y' },
  ],
  shaderTemplate: 'distort_ripple',
});

registerEffect({
  type: 'distortion',
  effect: 'pixelate',
  category: 'distortion',
  name: 'Pixelate',
  description: 'Reduce resolution to create pixel art look',
  icon: '🎮',
  defaultParams: { amount: 8 },
  parameters: [
    { name: 'amount', type: 'float', value: 8, min: 1, max: 64, step: 1, label: 'Pixel Size' },
  ],
  shaderTemplate: 'distort_pixelate',
});

registerEffect({
  type: 'color',
  effect: 'brightnessContrast',
  category: 'color',
  name: 'Brightness/Contrast',
  description: 'Adjust brightness and contrast',
  icon: '☀️',
  defaultParams: { brightness: 0, contrast: 0 },
  parameters: [
    { name: 'brightness', type: 'float', value: 0, min: -1, max: 1, label: 'Brightness' },
    { name: 'contrast', type: 'float', value: 0, min: -1, max: 1, label: 'Contrast' },
  ],
  shaderTemplate: 'color_brightness_contrast',
});

registerEffect({
  type: 'color',
  effect: 'hueSaturation',
  category: 'color',
  name: 'Hue/Saturation',
  description: 'Adjust hue, saturation, and lightness',
  icon: '🎨',
  defaultParams: { hue: 0, saturation: 0, lightness: 0 },
  parameters: [
    { name: 'hue', type: 'float', value: 0, min: -180, max: 180, label: 'Hue' },
    { name: 'saturation', type: 'float', value: 0, min: -1, max: 1, label: 'Saturation' },
    { name: 'lightness', type: 'float', value: 0, min: -1, max: 1, label: 'Lightness' },
  ],
  shaderTemplate: 'color_hue_saturation',
});

registerEffect({
  type: 'color',
  effect: 'vibrance',
  category: 'color',
  name: 'Vibrance',
  description: 'Boost color intensity without clipping',
  icon: '💎',
  defaultParams: { vibrance: 0.5 },
  parameters: [{ name: 'vibrance', type: 'float', value: 0.5, min: -1, max: 1, label: 'Vibrance' }],
  shaderTemplate: 'color_vibrance',
});

registerEffect({
  type: 'color',
  effect: 'tint',
  category: 'color',
  name: 'Color Tint',
  description: 'Apply color overlay',
  icon: '🔵',
  defaultParams: { tintColor: [0.2, 0.4, 0.8], amount: 0.3 },
  parameters: [
    { name: 'tintColor', type: 'color', value: [0.2, 0.4, 0.8], label: 'Tint Color' },
    { name: 'amount', type: 'float', value: 0.3, min: 0, max: 1, label: 'Amount' },
  ],
  shaderTemplate: 'color_tint',
});

registerEffect({
  type: 'noise',
  effect: 'grain',
  category: 'noise',
  name: 'Film Grain',
  description: 'Add realistic film grain texture',
  icon: '📽️',
  defaultParams: { amount: 0.1, scale: 1, speed: 24, monochrome: true },
  parameters: [
    { name: 'amount', type: 'float', value: 0.1, min: 0, max: 0.5, label: 'Amount' },
    { name: 'scale', type: 'float', value: 1, min: 0.5, max: 4, label: 'Scale' },
    { name: 'speed', type: 'float', value: 24, min: 0, max: 60, label: 'Speed' },
    { name: 'monochrome', type: 'bool', value: true, label: 'Monochrome' },
  ],
  shaderTemplate: 'noise_grain',
});

registerEffect({
  type: 'noise',
  effect: 'scanlines',
  category: 'noise',
  name: 'Scanlines',
  description: 'CRT-style horizontal scanlines',
  icon: '📺',
  defaultParams: { amount: 0.3, frequency: 400 },
  parameters: [
    { name: 'amount', type: 'float', value: 0.3, min: 0, max: 1, label: 'Intensity' },
    { name: 'frequency', type: 'float', value: 400, min: 50, max: 1000, label: 'Line Count' },
  ],
  shaderTemplate: 'noise_scanlines',
});

registerEffect({
  type: 'stylize',
  effect: 'vignette',
  category: 'stylize',
  name: 'Vignette',
  description: 'Darken edges for cinematic look',
  icon: '🎬',
  defaultParams: { intensity: 0.5, softness: 0.5, size: 0.5 },
  parameters: [
    { name: 'intensity', type: 'float', value: 0.5, min: 0, max: 1, label: 'Intensity' },
    { name: 'softness', type: 'float', value: 0.5, min: 0, max: 1, label: 'Softness' },
    { name: 'size', type: 'float', value: 0.5, min: 0, max: 1, label: 'Size' },
  ],
  shaderTemplate: 'stylize_vignette',
});

registerEffect({
  type: 'stylize',
  effect: 'chromaticAberration',
  category: 'stylize',
  name: 'Chromatic Aberration',
  description: 'RGB channel separation for lens effect',
  icon: '🌈',
  defaultParams: { intensity: 0.01, angle: 0 },
  parameters: [
    { name: 'intensity', type: 'float', value: 0.01, min: 0, max: 0.1, label: 'Amount' },
    { name: 'angle', type: 'angle', value: 0, min: -180, max: 180, label: 'Angle' },
  ],
  shaderTemplate: 'stylize_chromatic',
});

registerEffect({
  type: 'stylize',
  effect: 'sharpen',
  category: 'stylize',
  name: 'Sharpen',
  description: 'Enhance edge detail',
  icon: '🔪',
  defaultParams: { intensity: 0.5 },
  parameters: [{ name: 'intensity', type: 'float', value: 0.5, min: 0, max: 2, label: 'Amount' }],
  shaderTemplate: 'stylize_sharpen',
});

registerEffect({
  type: 'lighting',
  effect: 'godRays',
  category: 'lighting',
  name: 'God Rays',
  description: 'Volumetric light rays from bright source',
  icon: '☀️',
  defaultParams: { intensity: 1, positionX: 0.5, positionY: 0.3, rayLength: 0.5, rayDensity: 50 },
  parameters: [
    { name: 'intensity', type: 'float', value: 1, min: 0, max: 2, label: 'Intensity' },
    { name: 'positionX', type: 'float', value: 0.5, min: 0, max: 1, label: 'Source X' },
    { name: 'positionY', type: 'float', value: 0.3, min: 0, max: 1, label: 'Source Y' },
    { name: 'rayLength', type: 'float', value: 0.5, min: 0, max: 1, label: 'Length' },
    { name: 'rayDensity', type: 'float', value: 50, min: 10, max: 100, label: 'Samples' },
  ],
  shaderTemplate: 'lighting_godrays',
  gpuIntensive: true,
});

registerEffect({
  type: 'lighting',
  effect: 'caustics',
  category: 'lighting',
  name: 'Caustics',
  description: 'Underwater light refraction patterns',
  icon: '🌊',
  defaultParams: { intensity: 0.5, scale: 3, speed: 1, color: [0.5, 0.8, 1.0] },
  parameters: [
    { name: 'intensity', type: 'float', value: 0.5, min: 0, max: 1, label: 'Intensity' },
    { name: 'scale', type: 'float', value: 3, min: 0.5, max: 10, label: 'Scale' },
    { name: 'speed', type: 'float', value: 1, min: 0, max: 5, label: 'Speed' },
    { name: 'color', type: 'color', value: [0.5, 0.8, 1.0], label: 'Color' },
  ],
  shaderTemplate: 'lighting_caustics',
});

export function createLayer(
  type: EffectLayer['type'],
  effect: string,
  overrides: Partial<LayerBase> = {}
): EffectLayer {
  const def = EFFECT_REGISTRY.get(`${type}:${effect}`);
  if (!def) throw new Error(`Unknown effect: ${type}:${effect}`);

  const base: LayerBase = {
    id: crypto.randomUUID(),
    name: def.name,
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: 'normal',
    ...overrides,
  };

  return {
    ...base,
    type,
    effect,
    params: { ...def.defaultParams },
  } as EffectLayer;
}

export function getEffectsByCategory(category: EffectCategory): EffectDefinition[] {
  return Array.from(EFFECT_REGISTRY.values()).filter((e) => e.category === category);
}

export function getAllEffects(): EffectDefinition[] {
  return Array.from(EFFECT_REGISTRY.values());
}
