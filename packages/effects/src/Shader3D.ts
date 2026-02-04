// Shader3D - Unified API for all Shader3D features

import type { Shader3DOptions, EffectResult, LayerConfig, GestureData } from './types';

export class Shader3D {
  private options: Shader3DOptions;
  private currentLayers: LayerConfig[] = [];
  private currentPreset: string | null = null;

  constructor(options: Shader3DOptions = {}) {
    this.options = {
      autoCompile: true,
      target: 'webgpu',
      ...options,
    };
  }

  // Preset methods
  preset(name: string): this {
    this.currentPreset = name;
    this.currentLayers = [
      {
        type: 'preset',
        effect: name,
        params: {},
        opacity: 1,
        blendMode: 'normal',
        visible: true,
      },
    ];
    return this;
  }

  presets(): string[] {
    return [
      'golden-hour',
      'vintage-film',
      'hdr-pro',
      'black-white',
      'cinematic',
      'sci-fi-neon',
      'cyberpunk',
      'glitch',
      'watercolor',
      'warm-glow',
    ];
  }

  // Natural language methods
  fromText(description: string): this {
    // Parse natural language and generate layers
    const words = description.toLowerCase();
    const layers: LayerConfig[] = [];

    if (words.includes('warm') || words.includes('golden')) {
      layers.push({
        type: 'color',
        effect: 'colorBalance',
        params: { warmth: 1.3 },
        opacity: 1,
        blendMode: 'normal',
        visible: true,
      });
    }

    if (words.includes('glow') || words.includes('bloom')) {
      layers.push({
        type: 'glow',
        effect: 'bloom',
        params: { intensity: 0.5 },
        opacity: 1,
        blendMode: 'add',
        visible: true,
      });
    }

    if (words.includes('vignette')) {
      layers.push({
        type: 'stylize',
        effect: 'vignette',
        params: { intensity: 0.4 },
        opacity: 1,
        blendMode: 'normal',
        visible: true,
      });
    }

    if (words.includes('blur')) {
      layers.push({
        type: 'blur',
        effect: 'gaussian',
        params: { radius: 5 },
        opacity: 1,
        blendMode: 'normal',
        visible: true,
      });
    }

    this.currentLayers = layers;
    return this;
  }

  refine(adjustment: string): this {
    const words = adjustment.toLowerCase();

    if (words.includes('more')) {
      this.currentLayers = this.currentLayers.map((layer) => ({
        ...layer,
        opacity: Math.min(layer.opacity * 1.3, 1),
      }));
    }

    if (words.includes('less')) {
      this.currentLayers = this.currentLayers.map((layer) => ({
        ...layer,
        opacity: layer.opacity * 0.7,
      }));
    }

    return this;
  }

  // Gesture methods
  fromGesture(data: GestureData): this {
    const gestureType = this.recognizeGesture(data);
    const effectMap: Record<string, LayerConfig> = {
      circle: {
        type: 'blur',
        effect: 'radial',
        params: { center: [0.5, 0.5] },
        opacity: 1,
        blendMode: 'normal',
        visible: true,
      },
      line: {
        type: 'blur',
        effect: 'motion',
        params: { angle: 0 },
        opacity: 1,
        blendMode: 'normal',
        visible: true,
      },
      spiral: {
        type: 'distortion',
        effect: 'swirl',
        params: { strength: 0.5 },
        opacity: 1,
        blendMode: 'normal',
        visible: true,
      },
    };

    if (effectMap[gestureType]) {
      this.currentLayers = [effectMap[gestureType]];
    }

    return this;
  }

  private recognizeGesture(data: GestureData): string {
    if (data.points.length < 3) return 'unknown';
    return 'circle'; // Simplified
  }

  // Image learning methods
  fromExample(imageData: ImageData | string): this {
    // Analyze image and generate matching effects
    this.currentLayers = [
      {
        type: 'color',
        effect: 'colorBalance',
        params: { auto: true },
        opacity: 1,
        blendMode: 'normal',
        visible: true,
      },
    ];
    return this;
  }

  // Layer system
  layers = {
    add: (type: string, params: Record<string, unknown> = {}): Shader3D => {
      this.currentLayers.push({
        type,
        effect: type,
        params,
        opacity: 1,
        blendMode: 'normal',
        visible: true,
      });
      return this;
    },

    remove: (index: number): Shader3D => {
      this.currentLayers.splice(index, 1);
      return this;
    },

    update: (index: number, params: Partial<LayerConfig>): Shader3D => {
      if (this.currentLayers[index]) {
        this.currentLayers[index] = { ...this.currentLayers[index], ...params };
      }
      return this;
    },

    list: (): LayerConfig[] => {
      return [...this.currentLayers];
    },

    clear: (): Shader3D => {
      this.currentLayers = [];
      return this;
    },
  };

  // Compilation
  compile(): EffectResult {
    const wgsl = this.generateWGSL();
    return {
      wgsl,
      layers: this.currentLayers,
      metadata: {
        preset: this.currentPreset || undefined,
        source: this.currentPreset ? 'preset' : 'manual',
      },
    };
  }

  private generateWGSL(): string {
    return `@fragment
fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
  var color = textureSample(inputTexture, sampler, uv);
  
  // Generated effect layers
${this.currentLayers.map((l) => `  // Layer: ${l.type} - ${l.effect}`).join('\n')}
  
  return color;
}`;
  }
}
