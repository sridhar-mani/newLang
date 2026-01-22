import type { ParsedIntent, ParsedEffect, GeneratedLayer, Slider, ModifierWord } from './types';

export class LayerGenerator {
  generate(intent: ParsedIntent): GeneratedLayer[] {
    const layers: GeneratedLayer[] = [];

    for (const parsedEffect of intent.effects) {
      const layer = this.generateLayer(parsedEffect, intent.globalModifiers);
      layers.push(layer);
    }

    return layers;
  }

  private generateLayer(effect: ParsedEffect, globalModifiers: ModifierWord[]): GeneratedLayer {
    const { effectWord, modifiers, colors, intensity } = effect;

    const params = { ...effectWord.defaultParams };

    if (effectWord.intensityParam && params[effectWord.intensityParam] !== undefined) {
      const baseValue = params[effectWord.intensityParam] as number;
      params[effectWord.intensityParam] = baseValue * intensity;
    }

    this.applyDirectionModifiers(params, modifiers);
    this.applySpeedModifiers(params, modifiers);
    this.applyColorModifiers(params, colors);
    this.applyGlobalModifiers(params, globalModifiers);

    const blendMode = this.selectBlendMode(effectWord.effectType);
    const opacity = this.calculateOpacity(effectWord.effectType, intensity);

    return {
      type: effectWord.effectType,
      effect: effectWord.effectName,
      params,
      opacity,
      blendMode,
      enabled: true,
    };
  }

  private applyDirectionModifiers(
    params: Record<string, unknown>,
    modifiers: ModifierWord[]
  ): void {
    for (const mod of modifiers) {
      if (mod.type === 'direction' && typeof mod.value === 'number') {
        if ('angle' in params) {
          params.angle = mod.value;
        }
        if ('direction' in params) {
          params.direction = mod.value;
        }
      }
    }
  }

  private applySpeedModifiers(params: Record<string, unknown>, modifiers: ModifierWord[]): void {
    for (const mod of modifiers) {
      if (mod.type === 'speed' && typeof mod.value === 'number') {
        if ('speed' in params && typeof params.speed === 'number') {
          params.speed = (params.speed as number) * mod.value;
        }
        if ('animationSpeed' in params && typeof params.animationSpeed === 'number') {
          params.animationSpeed = (params.animationSpeed as number) * mod.value;
        }
      }
    }
  }

  private applyColorModifiers(
    params: Record<string, unknown>,
    colors: { rgb: [number, number, number] }[]
  ): void {
    if (colors.length === 0) return;

    const primaryColor = colors[0].rgb;

    if ('tintColor' in params) {
      params.tintColor = primaryColor;
    }

    if ('colorA' in params) {
      params.colorA = primaryColor;
    }

    if (colors.length > 1 && 'colorB' in params) {
      params.colorB = colors[1].rgb;
    }
  }

  private applyGlobalModifiers(
    params: Record<string, unknown>,
    globalModifiers: ModifierWord[]
  ): void {
    for (const mod of globalModifiers) {
      if (mod.type === 'intensity' && typeof mod.value === 'number') {
        for (const key in params) {
          if (typeof params[key] === 'number') {
            params[key] = (params[key] as number) * Math.sqrt(mod.value);
          }
        }
      }
    }
  }

  private selectBlendMode(effectType: string): string {
    switch (effectType) {
      case 'glow':
        return 'screen';
      case 'color':
        return 'normal';
      case 'noise':
        return 'overlay';
      case 'stylize':
        return 'normal';
      default:
        return 'normal';
    }
  }

  private calculateOpacity(effectType: string, intensity: number): number {
    const baseOpacity = effectType === 'glow' ? 0.7 : 1.0;
    return Math.min(1, baseOpacity * Math.min(1.2, intensity));
  }

  generateSliders(layers: GeneratedLayer[]): Slider[] {
    const sliders: Slider[] = [];

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const layerSliders = this.generateLayerSliders(layer, i);
      sliders.push(...layerSliders);
    }

    return sliders;
  }

  private generateLayerSliders(layer: GeneratedLayer, layerIndex: number): Slider[] {
    const sliders: Slider[] = [];

    for (const [paramName, value] of Object.entries(layer.params)) {
      if (typeof value !== 'number') continue;

      const sliderConfig = this.getSliderConfig(layer.effect, paramName, value);

      sliders.push({
        id: `layer-${layerIndex}-${paramName}`,
        label: sliderConfig.label,
        layerIndex,
        paramName,
        min: sliderConfig.min,
        max: sliderConfig.max,
        step: sliderConfig.step,
        value,
        unit: sliderConfig.unit,
      });
    }

    sliders.push({
      id: `layer-${layerIndex}-opacity`,
      label: 'Opacity',
      layerIndex,
      paramName: 'opacity',
      min: 0,
      max: 1,
      step: 0.01,
      value: layer.opacity,
      unit: '%',
    });

    return sliders;
  }

  private getSliderConfig(
    effect: string,
    paramName: string,
    currentValue: number
  ): { label: string; min: number; max: number; step: number; unit?: string } {
    const configs: Record<
      string,
      { label: string; min: number; max: number; step: number; unit?: string }
    > = {
      radius: { label: 'Radius', min: 0, max: 100, step: 1, unit: 'px' },
      intensity: { label: 'Intensity', min: 0, max: 2, step: 0.01 },
      amount: { label: 'Amount', min: 0, max: 1, step: 0.01 },
      threshold: { label: 'Threshold', min: 0, max: 1, step: 0.01 },
      softness: { label: 'Softness', min: 0, max: 1, step: 0.01 },
      size: { label: 'Size', min: 0, max: 1, step: 0.01 },
      angle: { label: 'Angle', min: 0, max: 360, step: 1, unit: '°' },
      frequency: { label: 'Frequency', min: 1, max: 100, step: 1 },
      phase: { label: 'Phase', min: 0, max: 360, step: 1, unit: '°' },
      scale: { label: 'Scale', min: 0.1, max: 5, step: 0.1 },
      speed: { label: 'Speed', min: 0, max: 10, step: 0.1 },
      animationSpeed: { label: 'Animation Speed', min: 0, max: 10, step: 0.1 },
      hue: { label: 'Hue Shift', min: -180, max: 180, step: 1, unit: '°' },
      saturation: { label: 'Saturation', min: -1, max: 1, step: 0.01 },
      lightness: { label: 'Lightness', min: -1, max: 1, step: 0.01 },
      brightness: { label: 'Brightness', min: -1, max: 1, step: 0.01 },
      contrast: { label: 'Contrast', min: -1, max: 1, step: 0.01 },
    };

    if (configs[paramName]) {
      return configs[paramName];
    }

    const estimatedMax = currentValue > 1 ? currentValue * 3 : 1;
    return {
      label: this.formatParamName(paramName),
      min: 0,
      max: estimatedMax,
      step: estimatedMax > 10 ? 1 : 0.01,
    };
  }

  private formatParamName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
