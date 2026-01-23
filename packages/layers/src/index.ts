export * from './layer-types';
export * from './layer-composition';
export * from './blend-modes';
export * from './effects';
export * from './compiler';
export * from './mask-system';

// Export factory functions using the existing createLayer
export { createLayer as createEffectLayer } from './layer-types';

// Type aliases for backward compatibility - these aren't actually different layer types
export type { EffectLayer as AdjustmentLayer, EffectLayer as SolidLayer } from './layer-types';

// Alias functions for backward compatibility
export { createLayer as createAdjustmentLayer, createLayer as createSolidLayer } from './layer-types';
