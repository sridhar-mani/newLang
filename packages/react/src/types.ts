import React from 'react';

export interface EffectCanvasProps {
  src?: string;
  preset?: string;
  layers?: Array<{ type: string; effect: string; params?: Record<string, unknown> }>;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface ShaderEffectOptions {
  preset?: string;
  intensity?: number;
  layers?: Array<{ type: string; effect: string; params?: Record<string, unknown> }>;
}

export interface PresetOptions {
  category?: string;
  search?: string;
}

export interface LayerOptions {
  type: string;
  effect: string;
  params?: Record<string, unknown>;
  opacity?: number;
  blendMode?: string;
  visible?: boolean;
}

export interface PresetInfo {
  name: string;
  category: string;
  description?: string;
}
