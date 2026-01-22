export type GestureType =
  | 'circle'
  | 'spiral'
  | 'arrow'
  | 'scribble'
  | 'line'
  | 'zigzag'
  | 'wave'
  | 'cross'
  | 'star'
  | 'heart'
  | 'rectangle'
  | 'triangle'
  | 'dot'
  | 'unknown';

export type EffectIntent =
  | 'blur'
  | 'glow'
  | 'focus'
  | 'movement'
  | 'energy'
  | 'chaos'
  | 'calm'
  | 'distortion'
  | 'radial'
  | 'directional'
  | 'highlight'
  | 'shadow'
  | 'color'
  | 'texture';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface Stroke {
  points: Point[];
  color?: string;
  width?: number;
  startTime: number;
  endTime: number;
}

export interface RecognizedGesture {
  type: GestureType;
  confidence: number;
  bounds: { x: number; y: number; width: number; height: number };
  center: Point;
  direction?: number;
  scale?: number;
  rotation?: number;
}

export interface EffectMapping {
  gesture: GestureType;
  intent: EffectIntent;
  effectType: string;
  effectName: string;
  parameterMappings: ParameterMapping[];
}

export interface ParameterMapping {
  param: string;
  source: 'size' | 'speed' | 'pressure' | 'direction' | 'rotation' | 'intensity' | 'constant';
  scale?: number;
  offset?: number;
  min?: number;
  max?: number;
  constantValue?: number;
}

export interface GeneratedEffect {
  layerType: string;
  effect: string;
  params: Record<string, number | boolean | string | number[]>;
  opacity: number;
  blendMode: string;
  mask?: Float32Array;
  maskWidth?: number;
  maskHeight?: number;
}

export interface PaintSession {
  id: string;
  strokes: Stroke[];
  recognizedGestures: RecognizedGesture[];
  generatedEffects: GeneratedEffect[];
  canvasWidth: number;
  canvasHeight: number;
  createdAt: number;
  modifiedAt: number;
}

export interface PaintEffectsConfig {
  gestureThreshold: number;
  minStrokeLength: number;
  recognitionSensitivity: number;
  pressureSensitivity: number;
  enableRealTimePreview: boolean;
}

export const DEFAULT_CONFIG: PaintEffectsConfig = {
  gestureThreshold: 0.7,
  minStrokeLength: 20,
  recognitionSensitivity: 0.8,
  pressureSensitivity: 1.0,
  enableRealTimePreview: true,
};

export const GESTURE_EFFECT_MAPPINGS: EffectMapping[] = [
  {
    gesture: 'circle',
    intent: 'radial',
    effectType: 'blur',
    effectName: 'radialBlur',
    parameterMappings: [
      { param: 'radius', source: 'size', scale: 0.5, min: 5, max: 50 },
      { param: 'centerX', source: 'constant', constantValue: 0.5 },
      { param: 'centerY', source: 'constant', constantValue: 0.5 },
    ],
  },
  {
    gesture: 'circle',
    intent: 'glow',
    effectType: 'glow',
    effectName: 'bloom',
    parameterMappings: [
      { param: 'intensity', source: 'size', scale: 0.02, min: 0.1, max: 1.0 },
      { param: 'radius', source: 'size', scale: 1, min: 10, max: 60 },
      { param: 'threshold', source: 'constant', constantValue: 0.5 },
    ],
  },
  {
    gesture: 'spiral',
    intent: 'distortion',
    effectType: 'distortion',
    effectName: 'swirl',
    parameterMappings: [
      { param: 'amount', source: 'rotation', scale: 2, min: -3.14, max: 3.14 },
      { param: 'radius', source: 'size', scale: 0.5, min: 50, max: 300 },
    ],
  },
  {
    gesture: 'arrow',
    intent: 'movement',
    effectType: 'blur',
    effectName: 'motion',
    parameterMappings: [
      { param: 'radius', source: 'size', scale: 0.3, min: 5, max: 40 },
      { param: 'angle', source: 'direction', scale: 1, min: 0, max: 360 },
    ],
  },
  {
    gesture: 'line',
    intent: 'directional',
    effectType: 'blur',
    effectName: 'motion',
    parameterMappings: [
      { param: 'radius', source: 'size', scale: 0.2, min: 3, max: 30 },
      { param: 'angle', source: 'direction', scale: 1, min: 0, max: 360 },
    ],
  },
  {
    gesture: 'scribble',
    intent: 'chaos',
    effectType: 'noise',
    effectName: 'grain',
    parameterMappings: [
      { param: 'amount', source: 'intensity', scale: 0.3, min: 0.05, max: 0.4 },
      { param: 'scale', source: 'size', scale: 0.02, min: 0.5, max: 3 },
      { param: 'monochrome', source: 'constant', constantValue: 1 },
    ],
  },
  {
    gesture: 'wave',
    intent: 'distortion',
    effectType: 'distortion',
    effectName: 'wave',
    parameterMappings: [
      { param: 'amount', source: 'size', scale: 0.2, min: 5, max: 30 },
      { param: 'frequency', source: 'speed', scale: 0.1, min: 5, max: 30 },
      { param: 'phase', source: 'constant', constantValue: 0 },
    ],
  },
  {
    gesture: 'zigzag',
    intent: 'energy',
    effectType: 'stylize',
    effectName: 'chromaticAberration',
    parameterMappings: [
      { param: 'intensity', source: 'size', scale: 0.0005, min: 0.005, max: 0.03 },
      { param: 'angle', source: 'direction', scale: 1, min: 0, max: 360 },
    ],
  },
  {
    gesture: 'cross',
    intent: 'highlight',
    effectType: 'glow',
    effectName: 'lensFlare',
    parameterMappings: [
      { param: 'intensity', source: 'size', scale: 0.02, min: 0.3, max: 1.5 },
      { param: 'rays', source: 'constant', constantValue: 4 },
    ],
  },
  {
    gesture: 'star',
    intent: 'highlight',
    effectType: 'glow',
    effectName: 'starGlow',
    parameterMappings: [
      { param: 'intensity', source: 'size', scale: 0.03, min: 0.5, max: 2.0 },
      { param: 'rays', source: 'constant', constantValue: 6 },
      { param: 'spread', source: 'constant', constantValue: 0.5 },
    ],
  },
  {
    gesture: 'dot',
    intent: 'focus',
    effectType: 'blur',
    effectName: 'tiltShift',
    parameterMappings: [
      { param: 'focusY', source: 'constant', constantValue: 0.5 },
      { param: 'blur', source: 'pressure', scale: 20, min: 5, max: 30 },
      { param: 'spread', source: 'constant', constantValue: 0.3 },
    ],
  },
  {
    gesture: 'rectangle',
    intent: 'shadow',
    effectType: 'stylize',
    effectName: 'vignette',
    parameterMappings: [
      { param: 'intensity', source: 'size', scale: 0.01, min: 0.2, max: 0.8 },
      { param: 'softness', source: 'constant', constantValue: 0.5 },
      { param: 'size', source: 'constant', constantValue: 0.6 },
    ],
  },
];
