// @shader3d/react - React components and hooks for Shader3D

export { EffectCanvas } from './components/EffectCanvas';
export { EffectProvider, useEffectContext } from './components/EffectProvider';

export { useShaderEffect } from './hooks/useShaderEffect';
export { usePreset } from './hooks/usePreset';
export { useLayers } from './hooks/useLayers';

export type {
  EffectCanvasProps,
  ShaderEffectOptions,
  PresetOptions,
  LayerOptions,
} from './types';
