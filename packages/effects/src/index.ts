// @shader3d/effects - Unified API for all Shader3D features

export { Shader3D } from './Shader3D';
export type { Shader3DOptions, EffectResult, LayerConfig } from './types';

// Re-export from sub-packages for convenience
export { compile, parse, transform } from '@shader3d/core';
export { PresetManager } from '@shader3d/presets';
export { LayerComposition, createLayer } from '@shader3d/layers';
export { SessionManager, NLParser } from '@shader3d/natural-language';
export { GestureRecognizer } from '@shader3d/paint-effects';
