export interface EffectWord {
  word: string;
  aliases: string[];
  effectType: string;
  effectName: string;
  defaultParams: Record<string, number | boolean | string | number[]>;
  intensityParam?: string;
}

export interface ModifierWord {
  word: string;
  aliases: string[];
  type: 'intensity' | 'direction' | 'color' | 'speed' | 'area';
  value: number | string | number[];
}

export interface ColorWord {
  word: string;
  aliases: string[];
  rgb: [number, number, number];
}

export interface ParsedIntent {
  effects: ParsedEffect[];
  globalModifiers: ModifierWord[];
  confidence: number;
  originalText: string;
  suggestions?: string[];
}

export interface ParsedEffect {
  effectWord: EffectWord;
  modifiers: ModifierWord[];
  colors: ColorWord[];
  intensity: number;
  area?: 'center' | 'edges' | 'top' | 'bottom' | 'left' | 'right' | 'all';
}

export interface GeneratedLayer {
  type: string;
  effect: string;
  params: Record<string, number | boolean | string | number[]>;
  opacity: number;
  blendMode: string;
  enabled: boolean;
}

export interface NLSession {
  id: string;
  history: ConversationTurn[];
  currentLayers: GeneratedLayer[];
  createdAt: number;
  modifiedAt: number;
}

export interface ConversationTurn {
  id: string;
  userInput: string;
  parsedIntent: ParsedIntent;
  generatedLayers: GeneratedLayer[];
  refinements: RefinementAction[];
  timestamp: number;
}

export interface RefinementAction {
  type: 'adjust' | 'remove' | 'add' | 'replace';
  layerIndex?: number;
  paramName?: string;
  oldValue?: unknown;
  newValue?: unknown;
  description: string;
}

export interface Slider {
  id: string;
  label: string;
  layerIndex: number;
  paramName: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
}

export const EFFECT_DICTIONARY: EffectWord[] = [
  {
    word: 'blur',
    aliases: ['blurry', 'soft', 'fuzzy', 'hazy', 'unfocused', 'dreamy'],
    effectType: 'blur',
    effectName: 'gaussian',
    defaultParams: { radius: 10, quality: 'medium' },
    intensityParam: 'radius',
  },
  {
    word: 'glow',
    aliases: ['glowing', 'radiant', 'luminous', 'shining', 'bright'],
    effectType: 'glow',
    effectName: 'bloom',
    defaultParams: { intensity: 0.5, radius: 20, threshold: 0.6 },
    intensityParam: 'intensity',
  },
  {
    word: 'bloom',
    aliases: ['bloomy', 'blooming', 'light bloom'],
    effectType: 'glow',
    effectName: 'bloom',
    defaultParams: { intensity: 0.6, radius: 25, threshold: 0.5 },
    intensityParam: 'intensity',
  },
  {
    word: 'vignette',
    aliases: ['darkened edges', 'dark corners', 'edge shadow'],
    effectType: 'stylize',
    effectName: 'vignette',
    defaultParams: { intensity: 0.4, softness: 0.5, size: 0.6 },
    intensityParam: 'intensity',
  },
  {
    word: 'grain',
    aliases: ['grainy', 'noise', 'noisy', 'film grain', 'texture'],
    effectType: 'noise',
    effectName: 'grain',
    defaultParams: { amount: 0.1, scale: 1, speed: 0, monochrome: true },
    intensityParam: 'amount',
  },
  {
    word: 'chromatic',
    aliases: ['chromatic aberration', 'rgb split', 'color fringe', 'color split'],
    effectType: 'stylize',
    effectName: 'chromaticAberration',
    defaultParams: { intensity: 0.01, angle: 0 },
    intensityParam: 'intensity',
  },
  {
    word: 'pixelate',
    aliases: ['pixelated', 'pixel', 'mosaic', 'blocky', '8bit', '8-bit'],
    effectType: 'distortion',
    effectName: 'pixelate',
    defaultParams: { amount: 8 },
    intensityParam: 'amount',
  },
  {
    word: 'sharpen',
    aliases: ['sharp', 'crisp', 'detailed', 'enhance'],
    effectType: 'stylize',
    effectName: 'sharpen',
    defaultParams: { intensity: 0.5 },
    intensityParam: 'intensity',
  },
  {
    word: 'motion blur',
    aliases: ['motion', 'speed blur', 'movement blur', 'directional blur'],
    effectType: 'blur',
    effectName: 'motion',
    defaultParams: { radius: 20, angle: 0 },
    intensityParam: 'radius',
  },
  {
    word: 'wave',
    aliases: ['wavy', 'ripple', 'undulating', 'wave distortion'],
    effectType: 'distortion',
    effectName: 'wave',
    defaultParams: { amount: 10, frequency: 10, phase: 0, animationSpeed: 1 },
    intensityParam: 'amount',
  },
  {
    word: 'scanlines',
    aliases: ['scanline', 'crt', 'tv lines', 'retro lines'],
    effectType: 'noise',
    effectName: 'scanlines',
    defaultParams: { amount: 0.2, frequency: 400 },
    intensityParam: 'amount',
  },
  {
    word: 'saturate',
    aliases: ['saturation', 'saturated', 'vivid', 'colorful', 'vibrant'],
    effectType: 'color',
    effectName: 'hueSaturation',
    defaultParams: { hue: 0, saturation: 0.3, lightness: 0 },
    intensityParam: 'saturation',
  },
  {
    word: 'desaturate',
    aliases: ['desaturated', 'muted', 'gray', 'grey', 'black and white', 'monochrome'],
    effectType: 'color',
    effectName: 'hueSaturation',
    defaultParams: { hue: 0, saturation: -0.8, lightness: 0 },
    intensityParam: 'saturation',
  },
  {
    word: 'contrast',
    aliases: ['contrasty', 'high contrast', 'punchy', 'dramatic'],
    effectType: 'color',
    effectName: 'brightnessContrast',
    defaultParams: { brightness: 0, contrast: 0.3 },
    intensityParam: 'contrast',
  },
  {
    word: 'brighten',
    aliases: ['bright', 'brighter', 'lighten', 'lighter', 'expose'],
    effectType: 'color',
    effectName: 'brightnessContrast',
    defaultParams: { brightness: 0.2, contrast: 0 },
    intensityParam: 'brightness',
  },
  {
    word: 'darken',
    aliases: ['dark', 'darker', 'dim', 'shadow', 'underexpose'],
    effectType: 'color',
    effectName: 'brightnessContrast',
    defaultParams: { brightness: -0.2, contrast: 0 },
    intensityParam: 'brightness',
  },
  {
    word: 'warm',
    aliases: ['warmer', 'orange', 'sunset', 'golden', 'cozy'],
    effectType: 'color',
    effectName: 'colorBalance',
    defaultParams: {
      shadows: [0.1, 0.05, -0.1],
      midtones: [0.1, 0.05, -0.05],
      highlights: [0.15, 0.08, 0],
    },
  },
  {
    word: 'cool',
    aliases: ['cooler', 'cold', 'blue', 'icy', 'winter'],
    effectType: 'color',
    effectName: 'colorBalance',
    defaultParams: {
      shadows: [-0.05, 0, 0.1],
      midtones: [-0.05, 0, 0.1],
      highlights: [0, 0.02, 0.15],
    },
  },
  {
    word: 'tint',
    aliases: ['tinted', 'color overlay', 'wash'],
    effectType: 'color',
    effectName: 'tint',
    defaultParams: { tintColor: [1, 0.5, 0.3], amount: 0.2 },
    intensityParam: 'amount',
  },
  {
    word: 'vintage',
    aliases: ['retro', 'old', 'aged', 'nostalgic', 'film'],
    effectType: 'color',
    effectName: 'vintage',
    defaultParams: { fadeAmount: 0.2, warmth: 0.15, vignette: 0.3 },
    intensityParam: 'fadeAmount',
  },
];

export const MODIFIER_DICTIONARY: ModifierWord[] = [
  {
    word: 'very',
    aliases: ['really', 'super', 'extremely', 'extra', 'highly'],
    type: 'intensity',
    value: 1.5,
  },
  {
    word: 'slightly',
    aliases: ['a little', 'a bit', 'subtle', 'light', 'mild'],
    type: 'intensity',
    value: 0.5,
  },
  {
    word: 'strong',
    aliases: ['heavy', 'intense', 'powerful', 'bold'],
    type: 'intensity',
    value: 1.3,
  },
  { word: 'weak', aliases: ['gentle', 'soft', 'delicate', 'faint'], type: 'intensity', value: 0.6 },
  { word: 'fast', aliases: ['quick', 'rapid', 'speedy'], type: 'speed', value: 2 },
  { word: 'slow', aliases: ['gradual', 'gentle'], type: 'speed', value: 0.5 },
  { word: 'horizontal', aliases: ['sideways', 'left-right'], type: 'direction', value: 0 },
  { word: 'vertical', aliases: ['up-down', 'upward', 'downward'], type: 'direction', value: 90 },
  { word: 'diagonal', aliases: ['angled', 'tilted'], type: 'direction', value: 45 },
  { word: 'center', aliases: ['middle', 'centered'], type: 'area', value: 'center' },
  { word: 'edges', aliases: ['border', 'around'], type: 'area', value: 'edges' },
];

export const COLOR_DICTIONARY: ColorWord[] = [
  { word: 'red', aliases: ['crimson', 'scarlet', 'ruby'], rgb: [1, 0.2, 0.2] },
  { word: 'orange', aliases: ['amber', 'tangerine'], rgb: [1, 0.5, 0.1] },
  { word: 'yellow', aliases: ['gold', 'golden', 'lemon'], rgb: [1, 0.9, 0.2] },
  { word: 'green', aliases: ['emerald', 'lime', 'forest'], rgb: [0.2, 0.8, 0.3] },
  { word: 'blue', aliases: ['azure', 'navy', 'sky blue', 'cyan'], rgb: [0.2, 0.4, 1] },
  { word: 'purple', aliases: ['violet', 'lavender', 'magenta'], rgb: [0.6, 0.2, 0.8] },
  { word: 'pink', aliases: ['rose', 'coral', 'salmon'], rgb: [1, 0.4, 0.6] },
  { word: 'teal', aliases: ['turquoise', 'aqua'], rgb: [0.2, 0.7, 0.7] },
  { word: 'brown', aliases: ['sepia', 'tan', 'chocolate'], rgb: [0.6, 0.4, 0.2] },
  { word: 'white', aliases: ['bright', 'light'], rgb: [1, 1, 1] },
  { word: 'black', aliases: ['dark'], rgb: [0, 0, 0] },
];
