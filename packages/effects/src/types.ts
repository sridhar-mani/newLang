export interface Shader3DOptions {
  autoCompile?: boolean;
  target?: 'webgpu' | 'webgl';
}

export interface EffectResult {
  wgsl: string;
  layers: LayerConfig[];
  metadata: {
    preset?: string;
    source: 'preset' | 'text' | 'gesture' | 'example' | 'manual';
  };
}

export interface LayerConfig {
  type: string;
  effect: string;
  params: Record<string, unknown>;
  opacity: number;
  blendMode: string;
  visible: boolean;
}

export interface GestureData {
  points: Array<{ x: number; y: number }>;
  startTime: number;
  endTime: number;
}
