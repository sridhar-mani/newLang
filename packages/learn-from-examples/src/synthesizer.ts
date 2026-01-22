import type {
  StyleAnalysis,
  SynthesizedLayers,
  SynthesizedLayer,
  DetectedEffect,
} from './types';

export class ShaderSynthesizer {
  synthesize(analysis: StyleAnalysis): SynthesizedLayers {
    const layers: SynthesizedLayer[] = [];
    const suggestions: string[] = [];
    
    const colorLayers = this.synthesizeColorLayers(analysis);
    layers.push(...colorLayers);
    
    for (const effect of analysis.dominantEffects) {
      const layer = this.effectToLayer(effect);
      if (layer) {
        layers.push(layer);
      }
    }
    
    this.addMarkerBasedLayers(analysis, layers);
    
    layers.sort((a, b) => this.getLayerOrder(a.type) - this.getLayerOrder(b.type));
    
    const matchScore = this.calculateMatchScore(analysis, layers);
    
    if (matchScore < 0.5) {
      suggestions.push('Consider adjusting the effect intensities for a closer match');
    }
    
    if (analysis.styleMarkers.some(m => m.type === 'vintage')) {
      suggestions.push('Try the "Golden Hour" or "VHS" preset for a similar vintage look');
    }
    
    if (analysis.styleMarkers.some(m => m.type === 'cinematic')) {
      suggestions.push('The "Teal & Orange" preset may give you a similar cinematic feel');
    }
    
    return {
      layers,
      matchScore,
      analysisUsed: analysis,
      suggestions,
    };
  }
  
  private synthesizeColorLayers(analysis: StyleAnalysis): SynthesizedLayer[] {
    const layers: SynthesizedLayer[] = [];
    const { colorProfile, toneProfile } = analysis;
    
    if (Math.abs(toneProfile.brightness - 0.5) > 0.1 || Math.abs(toneProfile.contrast - 0.5) > 0.15) {
      layers.push({
        type: 'color',
        effect: 'brightnessContrast',
        params: {
          brightness: (toneProfile.brightness - 0.5) * 0.5,
          contrast: (toneProfile.contrast - 0.5) * 0.8,
        },
        opacity: 1,
        blendMode: 'normal',
        enabled: true,
        confidence: 0.8,
        reason: `Adjusted for ${toneProfile.brightness > 0.5 ? 'brighter' : 'darker'} tones`,
      });
    }
    
    if (Math.abs(colorProfile.saturationLevel - 0.4) > 0.1) {
      layers.push({
        type: 'color',
        effect: 'hueSaturation',
        params: {
          hue: 0,
          saturation: (colorProfile.saturationLevel - 0.4) * 1.5,
          lightness: 0,
        },
        opacity: 1,
        blendMode: 'normal',
        enabled: true,
        confidence: 0.75,
        reason: `Match ${colorProfile.saturationLevel > 0.4 ? 'vivid' : 'muted'} colors`,
      });
    }
    
    if (Math.abs(colorProfile.colorTemperature) > 0.2) {
      const isWarm = colorProfile.colorTemperature > 0;
      layers.push({
        type: 'color',
        effect: 'colorBalance',
        params: {
          shadows: isWarm ? [0.1, 0.05, -0.1] : [-0.05, 0, 0.1],
          midtones: isWarm ? [0.08, 0.04, -0.05] : [-0.03, 0, 0.08],
          highlights: isWarm ? [0.12, 0.06, 0] : [0, 0.02, 0.1],
        },
        opacity: Math.min(1, Math.abs(colorProfile.colorTemperature)),
        blendMode: 'normal',
        enabled: true,
        confidence: 0.7,
        reason: `Apply ${isWarm ? 'warm' : 'cool'} color temperature`,
      });
    }
    
    return layers;
  }
  
  private effectToLayer(effect: DetectedEffect): SynthesizedLayer | null {
    const params: Record<string, number | boolean | string | number[]> = {};
    
    for (const [key, value] of Object.entries(effect.estimatedParams)) {
      params[key] = value;
    }
    
    return {
      type: effect.effectType,
      effect: effect.effectName,
      params,
      opacity: Math.min(1, effect.confidence * 1.2),
      blendMode: this.selectBlendMode(effect.effectType),
      enabled: true,
      confidence: effect.confidence,
      reason: `Detected ${effect.effectName} effect`,
    };
  }
  
  private addMarkerBasedLayers(analysis: StyleAnalysis, layers: SynthesizedLayer[]): void {
    const hasVignette = layers.some(l => l.effect === 'vignette');
    const vignetteMarker = analysis.styleMarkers.find(m => m.type === 'vignette');
    
    if (vignetteMarker && !hasVignette) {
      layers.push({
        type: 'stylize',
        effect: 'vignette',
        params: {
          intensity: (vignetteMarker.value ?? 0.3) * 1.2,
          softness: 0.5,
          size: 0.6,
        },
        opacity: 1,
        blendMode: 'normal',
        enabled: true,
        confidence: vignetteMarker.confidence,
        reason: 'Detected vignette darkening at edges',
      });
    }
    
    if (analysis.textureProfile.grainAmount > 0.05) {
      const hasGrain = layers.some(l => l.effect === 'grain');
      if (!hasGrain) {
        layers.push({
          type: 'noise',
          effect: 'grain',
          params: {
            amount: analysis.textureProfile.grainAmount,
            scale: 1,
            speed: 0,
            monochrome: true,
          },
          opacity: 1,
          blendMode: 'overlay',
          enabled: true,
          confidence: 0.6,
          reason: 'Matched film grain texture',
        });
      }
    }
    
    if (analysis.textureProfile.patternType === 'scanlines') {
      layers.push({
        type: 'noise',
        effect: 'scanlines',
        params: {
          amount: 0.15,
          frequency: 400,
        },
        opacity: 0.8,
        blendMode: 'multiply',
        enabled: true,
        confidence: 0.5,
        reason: 'Detected scanline pattern',
      });
    }
  }
  
  private selectBlendMode(effectType: string): string {
    switch (effectType) {
      case 'glow':
        return 'screen';
      case 'noise':
        return 'overlay';
      default:
        return 'normal';
    }
  }
  
  private getLayerOrder(type: string): number {
    const order: Record<string, number> = {
      color: 1,
      blur: 2,
      distortion: 3,
      glow: 4,
      stylize: 5,
      noise: 6,
    };
    return order[type] ?? 10;
  }
  
  private calculateMatchScore(analysis: StyleAnalysis, layers: SynthesizedLayer[]): number {
    let score = 0;
    let total = 0;
    
    for (const layer of layers) {
      score += layer.confidence;
      total += 1;
    }
    
    const baseScore = total > 0 ? score / total : 0;
    
    const coverageBonus = Math.min(0.2, analysis.dominantEffects.length * 0.05);
    
    return Math.min(1, baseScore + coverageBonus);
  }
  
  refine(
    synthesis: SynthesizedLayers,
    feedback: 'more' | 'less' | 'warmer' | 'cooler' | 'sharper' | 'softer'
  ): SynthesizedLayers {
    const layers = synthesis.layers.map(l => ({ ...l, params: { ...l.params } }));
    
    switch (feedback) {
      case 'more':
        for (const layer of layers) {
          for (const key in layer.params) {
            if (typeof layer.params[key] === 'number') {
              layer.params[key] = (layer.params[key] as number) * 1.3;
            }
          }
        }
        break;
      
      case 'less':
        for (const layer of layers) {
          for (const key in layer.params) {
            if (typeof layer.params[key] === 'number') {
              layer.params[key] = (layer.params[key] as number) * 0.7;
            }
          }
        }
        break;
      
      case 'warmer':
        const warmLayer = layers.find(l => l.effect === 'colorBalance');
        if (warmLayer) {
          const shadows = warmLayer.params.shadows as number[];
          const midtones = warmLayer.params.midtones as number[];
          shadows[0] += 0.05;
          shadows[2] -= 0.05;
          midtones[0] += 0.03;
        } else {
          layers.unshift({
            type: 'color',
            effect: 'colorBalance',
            params: {
              shadows: [0.08, 0.04, -0.08],
              midtones: [0.05, 0.02, -0.03],
              highlights: [0.1, 0.05, 0],
            },
            opacity: 0.6,
            blendMode: 'normal',
            enabled: true,
            confidence: 0.8,
            reason: 'Added warmth based on feedback',
          });
        }
        break;
      
      case 'cooler':
        const coolLayer = layers.find(l => l.effect === 'colorBalance');
        if (coolLayer) {
          const shadows = coolLayer.params.shadows as number[];
          const midtones = coolLayer.params.midtones as number[];
          shadows[0] -= 0.05;
          shadows[2] += 0.05;
          midtones[2] += 0.03;
        } else {
          layers.unshift({
            type: 'color',
            effect: 'colorBalance',
            params: {
              shadows: [-0.05, 0, 0.08],
              midtones: [-0.03, 0, 0.05],
              highlights: [0, 0.02, 0.08],
            },
            opacity: 0.6,
            blendMode: 'normal',
            enabled: true,
            confidence: 0.8,
            reason: 'Added coolness based on feedback',
          });
        }
        break;
      
      case 'sharper':
        const existingSharp = layers.find(l => l.effect === 'sharpen');
        if (existingSharp) {
          (existingSharp.params.intensity as number) += 0.2;
        } else {
          layers.push({
            type: 'stylize',
            effect: 'sharpen',
            params: { intensity: 0.4 },
            opacity: 1,
            blendMode: 'normal',
            enabled: true,
            confidence: 0.9,
            reason: 'Added sharpening based on feedback',
          });
        }
        break;
      
      case 'softer':
        const sharpLayer = layers.find(l => l.effect === 'sharpen');
        if (sharpLayer) {
          (sharpLayer.params.intensity as number) *= 0.5;
        }
        const blurLayer = layers.find(l => l.effect === 'gaussian');
        if (blurLayer) {
          (blurLayer.params.radius as number) += 2;
        } else {
          layers.push({
            type: 'blur',
            effect: 'gaussian',
            params: { radius: 2, quality: 'medium' },
            opacity: 0.3,
            blendMode: 'normal',
            enabled: true,
            confidence: 0.8,
            reason: 'Added softness based on feedback',
          });
        }
        break;
    }
    
    return {
      ...synthesis,
      layers,
    };
  }
}
