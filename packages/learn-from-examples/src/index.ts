export * from './types';
export * from './analyzer';
export * from './synthesizer';
export * from './learn-from-examples';

// Export renamed classes for backward compatibility
export { ShaderSynthesizer as StyleSynthesizer } from './synthesizer';

// Export renamed types
export type {
  StyleAnalysis as AnalysisResult,
  SynthesizedLayers as SynthesizedStyle,
} from './types';
