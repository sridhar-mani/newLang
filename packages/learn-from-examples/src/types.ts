export interface ExampleImage {
  id: string;
  imageData: ImageData;
  thumbnail?: ImageData;
  source: 'upload' | 'url' | 'sample';
  name?: string;
  tags?: string[];
}

export interface StyleAnalysis {
  colorProfile: ColorProfile;
  toneProfile: ToneProfile;
  textureProfile: TextureProfile;
  styleMarkers: StyleMarker[];
  dominantEffects: DetectedEffect[];
  confidence: number;
}

export interface ColorProfile {
  dominantColors: [number, number, number][];
  colorTemperature: number;
  saturationLevel: number;
  hueDistribution: number[];
  colorHarmony: 'monochromatic' | 'complementary' | 'analogous' | 'triadic' | 'split' | 'neutral';
}

export interface ToneProfile {
  brightness: number;
  contrast: number;
  shadowLevel: number;
  highlightLevel: number;
  midtoneBalance: number;
  dynamicRange: number;
  histogram: number[];
}

export interface TextureProfile {
  grainAmount: number;
  sharpness: number;
  noiseType: 'none' | 'fine' | 'coarse' | 'film';
  patternType: 'none' | 'scanlines' | 'halftone' | 'crosshatch' | 'organic';
  edgeDefinition: number;
}

export interface StyleMarker {
  type: StyleMarkerType;
  confidence: number;
  location?: { x: number; y: number; radius: number };
  value?: number;
}

export type StyleMarkerType =
  | 'vignette'
  | 'bloom'
  | 'chromatic-aberration'
  | 'lens-flare'
  | 'light-leak'
  | 'film-grain'
  | 'color-grading'
  | 'high-contrast'
  | 'low-contrast'
  | 'desaturated'
  | 'cross-process'
  | 'split-tone'
  | 'duotone'
  | 'teal-orange'
  | 'vintage'
  | 'modern'
  | 'cinematic'
  | 'dreamy'
  | 'gritty'
  | 'clean';

export interface DetectedEffect {
  effectType: string;
  effectName: string;
  confidence: number;
  estimatedParams: Record<string, number>;
  importance: number;
}

export interface SynthesizedLayers {
  layers: SynthesizedLayer[];
  matchScore: number;
  analysisUsed: StyleAnalysis;
  suggestions: string[];
}

export interface SynthesizedLayer {
  type: string;
  effect: string;
  params: Record<string, number | boolean | string | number[]>;
  opacity: number;
  blendMode: string;
  enabled: boolean;
  confidence: number;
  reason: string;
}

export interface LearningSession {
  id: string;
  exampleImages: ExampleImage[];
  analyses: Map<string, StyleAnalysis>;
  synthesizedResult?: SynthesizedLayers;
  createdAt: number;
  modifiedAt: number;
}

export interface StyleMatcher {
  matchScore: number;
  matchedFeatures: string[];
  suggestedPreset?: string;
  customLayers: SynthesizedLayer[];
}

export interface ComparisonResult {
  similarity: number;
  colorSimilarity: number;
  toneSimilarity: number;
  textureSimilarity: number;
  effectSimilarity: number;
  differences: string[];
}
