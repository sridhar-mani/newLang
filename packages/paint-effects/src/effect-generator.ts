import type { RecognizedGesture, GeneratedEffect, EffectMapping, ParameterMapping } from './types';
import { GESTURE_EFFECT_MAPPINGS } from './types';

export class EffectGenerator {
  private mappings: EffectMapping[];

  constructor(customMappings?: EffectMapping[]) {
    this.mappings = customMappings ?? GESTURE_EFFECT_MAPPINGS;
  }

  generate(gesture: RecognizedGesture): GeneratedEffect | null {
    const mapping = this.findBestMapping(gesture);
    if (!mapping) {
      return null;
    }

    const params = this.mapParameters(mapping.parameterMappings, gesture);

    return {
      layerType: mapping.effectType,
      effect: mapping.effectName,
      params,
      opacity: Math.min(1, gesture.confidence * 1.2),
      blendMode: this.selectBlendMode(mapping.intent),
    };
  }

  generateWithMask(
    gesture: RecognizedGesture,
    canvasWidth: number,
    canvasHeight: number
  ): GeneratedEffect | null {
    const effect = this.generate(gesture);
    if (!effect) return null;

    const { mask, width, height } = this.createGestureMask(gesture, canvasWidth, canvasHeight);

    effect.mask = mask;
    effect.maskWidth = width;
    effect.maskHeight = height;

    return effect;
  }

  private findBestMapping(gesture: RecognizedGesture): EffectMapping | null {
    const candidates = this.mappings.filter((m) => m.gesture === gesture.type);

    if (candidates.length === 0) {
      return null;
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    return this.selectMappingByContext(candidates, gesture);
  }

  private selectMappingByContext(
    candidates: EffectMapping[],
    gesture: RecognizedGesture
  ): EffectMapping {
    const scale = gesture.scale ?? 100;

    if (scale > 200) {
      const glowMapping = candidates.find((m) => m.intent === 'glow');
      if (glowMapping) return glowMapping;
    }

    if (scale < 50) {
      const focusMapping = candidates.find((m) => m.intent === 'focus');
      if (focusMapping) return focusMapping;
    }

    return candidates[0];
  }

  private mapParameters(
    mappings: ParameterMapping[],
    gesture: RecognizedGesture
  ): Record<string, number | boolean | string | number[]> {
    const params: Record<string, number | boolean | string | number[]> = {};

    for (const mapping of mappings) {
      let value: number;

      switch (mapping.source) {
        case 'size':
          value = gesture.scale ?? 100;
          break;
        case 'speed':
          value = 1;
          break;
        case 'pressure':
          value = 0.5;
          break;
        case 'direction':
          value = gesture.direction ?? 0;
          break;
        case 'rotation':
          value = gesture.rotation ?? 0;
          break;
        case 'intensity':
          value = gesture.confidence;
          break;
        case 'constant':
          value = mapping.constantValue ?? 0;
          params[mapping.param] = value === 0 || value === 1 ? Boolean(value) : value;
          continue;
        default:
          value = 0;
      }

      let scaled = value * (mapping.scale ?? 1) + (mapping.offset ?? 0);

      if (mapping.min !== undefined) {
        scaled = Math.max(mapping.min, scaled);
      }
      if (mapping.max !== undefined) {
        scaled = Math.min(mapping.max, scaled);
      }

      params[mapping.param] = scaled;
    }

    return params;
  }

  private selectBlendMode(intent: string): string {
    switch (intent) {
      case 'glow':
      case 'highlight':
        return 'screen';
      case 'shadow':
        return 'multiply';
      case 'color':
        return 'color';
      case 'energy':
        return 'add';
      default:
        return 'normal';
    }
  }

  private createGestureMask(
    gesture: RecognizedGesture,
    canvasWidth: number,
    canvasHeight: number
  ): { mask: Float32Array; width: number; height: number } {
    const maskWidth = Math.min(512, canvasWidth);
    const maskHeight = Math.min(512, canvasHeight);
    const mask = new Float32Array(maskWidth * maskHeight);

    const scaleX = maskWidth / canvasWidth;
    const scaleY = maskHeight / canvasHeight;

    const cx = gesture.center.x * scaleX;
    const cy = gesture.center.y * scaleY;
    const radius = ((gesture.scale ?? 100) / 2) * Math.min(scaleX, scaleY);

    for (let y = 0; y < maskHeight; y++) {
      for (let x = 0; x < maskWidth; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let value: number;

        switch (gesture.type) {
          case 'circle':
          case 'spiral':
            value = 1 - Math.min(1, dist / radius);
            value = value * value;
            break;

          case 'line':
          case 'arrow':
            const angle = ((gesture.direction ?? 0) * Math.PI) / 180;
            const perpDist = Math.abs(dx * Math.sin(angle) - dy * Math.cos(angle));
            value = 1 - Math.min(1, perpDist / (radius * 0.3));
            value = Math.max(0, value);
            break;

          case 'rectangle':
            const rx = (gesture.bounds.width * scaleX) / 2;
            const ry = (gesture.bounds.height * scaleY) / 2;
            const edgeDistX = Math.max(0, Math.abs(dx) - rx);
            const edgeDistY = Math.max(0, Math.abs(dy) - ry);
            const edgeDist = Math.sqrt(edgeDistX ** 2 + edgeDistY ** 2);
            value = 1 - Math.min(1, edgeDist / 20);
            break;

          case 'dot':
            value = dist < radius ? 1 : 0;
            break;

          case 'scribble':
            value = dist < radius * 1.5 ? 0.5 + Math.random() * 0.5 : 0;
            break;

          default:
            value = 1 - Math.min(1, dist / (radius * 2));
        }

        mask[y * maskWidth + x] = Math.max(0, Math.min(1, value));
      }
    }

    return { mask, width: maskWidth, height: maskHeight };
  }

  addCustomMapping(mapping: EffectMapping): void {
    this.mappings.push(mapping);
  }

  removeMapping(gesture: string, effectName: string): boolean {
    const index = this.mappings.findIndex(
      (m) => m.gesture === gesture && m.effectName === effectName
    );
    if (index >= 0) {
      this.mappings.splice(index, 1);
      return true;
    }
    return false;
  }

  getMappings(): EffectMapping[] {
    return [...this.mappings];
  }
}
