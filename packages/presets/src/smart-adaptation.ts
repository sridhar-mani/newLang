import type { Preset, AdaptiveMapping, PresetLayer } from './types';

export interface ImageAnalysis {
  brightness: number;
  contrast: number;
  saturation: number;
  dominantColor: [number, number, number];
  colorTemperature: number;
  hasSubject: boolean;
  subjectPosition?: { x: number; y: number; width: number; height: number };
  histogram: {
    r: number[];
    g: number[];
    b: number[];
    luminance: number[];
  };
}

export interface AdaptedPreset {
  original: Preset;
  adaptedLayers: PresetLayer[];
  adaptationReport: AdaptationChange[];
}

export interface AdaptationChange {
  layerIndex: number;
  paramName: string;
  originalValue: unknown;
  adaptedValue: unknown;
  reason: string;
}

export async function analyzeImage(imageData: ImageData): Promise<ImageAnalysis> {
  const { data, width, height } = imageData;
  const pixelCount = width * height;

  let totalR = 0,
    totalG = 0,
    totalB = 0;
  let minLum = 1,
    maxLum = 0;

  const histogramR = new Array(256).fill(0);
  const histogramG = new Array(256).fill(0);
  const histogramB = new Array(256).fill(0);
  const histogramLum = new Array(256).fill(0);

  const colorBuckets = new Map<string, number>();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    totalR += r;
    totalG += g;
    totalB += b;

    histogramR[r]++;
    histogramG[g]++;
    histogramB[b]++;

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const lumIndex = Math.floor(lum);
    histogramLum[Math.min(255, lumIndex)]++;

    const lumNorm = lum / 255;
    minLum = Math.min(minLum, lumNorm);
    maxLum = Math.max(maxLum, lumNorm);

    const bucketR = Math.floor(r / 32);
    const bucketG = Math.floor(g / 32);
    const bucketB = Math.floor(b / 32);
    const key = `${bucketR},${bucketG},${bucketB}`;
    colorBuckets.set(key, (colorBuckets.get(key) || 0) + 1);
  }

  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;
  const avgLum = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114) / 255;

  const contrast = maxLum - minLum;

  let saturationSum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      saturationSum += s;
    }
  }
  const avgSaturation = saturationSum / pixelCount;

  let dominantColor: [number, number, number] = [avgR / 255, avgG / 255, avgB / 255];
  let maxCount = 0;
  for (const [key, count] of colorBuckets) {
    if (count > maxCount) {
      maxCount = count;
      const [r, g, b] = key.split(',').map(Number);
      dominantColor = [(r * 32 + 16) / 255, (g * 32 + 16) / 255, (b * 32 + 16) / 255];
    }
  }

  const rg = avgR - avgG;
  const colorTemp = rg > 20 ? Math.min(1, rg / 100) : rg < -20 ? Math.max(-1, rg / 100) : 0;

  const hasSubject = detectSubject(histogramLum, width, height);

  return {
    brightness: avgLum,
    contrast,
    saturation: avgSaturation,
    dominantColor,
    colorTemperature: colorTemp,
    hasSubject,
    histogram: {
      r: histogramR.map((v) => v / pixelCount),
      g: histogramG.map((v) => v / pixelCount),
      b: histogramB.map((v) => v / pixelCount),
      luminance: histogramLum.map((v) => v / pixelCount),
    },
  };
}

function detectSubject(histogram: number[], width: number, height: number): boolean {
  const centerWeight = 0.6;
  const edgeWeight = 0.4;

  let centerVariance = 0;
  let edgeVariance = 0;

  const mean = histogram.reduce((a, b) => a + b, 0) / 256;
  for (let i = 0; i < 256; i++) {
    const diff = histogram[i] - mean;
    if (i > 64 && i < 192) {
      centerVariance += diff * diff * centerWeight;
    } else {
      edgeVariance += diff * diff * edgeWeight;
    }
  }

  return centerVariance > edgeVariance * 1.5;
}

export function applyMapping(value: number, mapping: AdaptiveMapping): number {
  const { inputMin, inputMax, outputMin, outputMax, curve } = mapping;

  const normalizedInput = Math.max(0, Math.min(1, (value - inputMin) / (inputMax - inputMin)));

  let curvedValue: number;
  switch (curve) {
    case 'ease':
      curvedValue = normalizedInput * normalizedInput * (3 - 2 * normalizedInput);
      break;
    case 'easeIn':
      curvedValue = normalizedInput * normalizedInput;
      break;
    case 'easeOut':
      curvedValue = 1 - (1 - normalizedInput) * (1 - normalizedInput);
      break;
    case 'linear':
    default:
      curvedValue = normalizedInput;
  }

  return outputMin + curvedValue * (outputMax - outputMin);
}

export function adaptPreset(preset: Preset, analysis: ImageAnalysis): AdaptedPreset {
  const adaptedLayers = JSON.parse(JSON.stringify(preset.layers)) as PresetLayer[];
  const adaptationReport: AdaptationChange[] = [];

  if (preset.adaptiveParams) {
    for (const adaptive of preset.adaptiveParams) {
      const { layerIndex, paramName, adaptTo, mapping } = adaptive;

      if (layerIndex >= adaptedLayers.length) continue;

      let inputValue: number;
      switch (adaptTo) {
        case 'brightness':
          inputValue = analysis.brightness;
          break;
        case 'contrast':
          inputValue = analysis.contrast;
          break;
        case 'saturation':
          inputValue = analysis.saturation;
          break;
        case 'dominantColor':
          inputValue =
            (analysis.dominantColor[0] + analysis.dominantColor[1] + analysis.dominantColor[2]) / 3;
          break;
        case 'subject':
          inputValue = analysis.hasSubject ? 1 : 0;
          break;
        default:
          continue;
      }

      const adaptedValue = applyMapping(inputValue, mapping);
      const layer = adaptedLayers[layerIndex];
      const originalValue = layer.params[paramName];

      layer.params[paramName] = adaptedValue;

      adaptationReport.push({
        layerIndex,
        paramName,
        originalValue,
        adaptedValue,
        reason: `Adapted to image ${adaptTo}: ${inputValue.toFixed(2)} → param: ${adaptedValue.toFixed(2)}`,
      });
    }
  }

  if (analysis.brightness < 0.3) {
    for (let i = 0; i < adaptedLayers.length; i++) {
      const layer = adaptedLayers[i];
      if (layer.effect === 'brightnessContrast' && layer.params.brightness !== undefined) {
        const original = layer.params.brightness as number;
        layer.params.brightness = Math.min(0.3, original + 0.15);
        adaptationReport.push({
          layerIndex: i,
          paramName: 'brightness',
          originalValue: original,
          adaptedValue: layer.params.brightness,
          reason: 'Auto-boost brightness for dark image',
        });
      }
    }
  }

  if (analysis.brightness > 0.8) {
    for (let i = 0; i < adaptedLayers.length; i++) {
      const layer = adaptedLayers[i];
      if (layer.effect === 'brightnessContrast' && layer.params.brightness !== undefined) {
        const original = layer.params.brightness as number;
        layer.params.brightness = Math.max(-0.2, original - 0.1);
        adaptationReport.push({
          layerIndex: i,
          paramName: 'brightness',
          originalValue: original,
          adaptedValue: layer.params.brightness,
          reason: 'Auto-reduce brightness for bright image',
        });
      }
    }
  }

  if (analysis.saturation < 0.2) {
    for (let i = 0; i < adaptedLayers.length; i++) {
      const layer = adaptedLayers[i];
      if (layer.effect === 'vibrance' && layer.params.vibrance !== undefined) {
        const original = layer.params.vibrance as number;
        layer.params.vibrance = Math.min(0.6, original + 0.2);
        adaptationReport.push({
          layerIndex: i,
          paramName: 'vibrance',
          originalValue: original,
          adaptedValue: layer.params.vibrance,
          reason: 'Auto-boost vibrance for low-saturation image',
        });
      }
    }
  }

  if (analysis.hasSubject) {
    for (let i = 0; i < adaptedLayers.length; i++) {
      const layer = adaptedLayers[i];
      if (layer.effect === 'vignette') {
        if (layer.params.size !== undefined) {
          const original = layer.params.size as number;
          layer.params.size = Math.max(0.5, original - 0.1);
          adaptationReport.push({
            layerIndex: i,
            paramName: 'size',
            originalValue: original,
            adaptedValue: layer.params.size,
            reason: 'Tighten vignette to focus on detected subject',
          });
        }
      }
    }
  }

  return {
    original: preset,
    adaptedLayers,
    adaptationReport,
  };
}

export function applyVariant(preset: Preset, variantName: string): PresetLayer[] | null {
  const variant = preset.variants?.find((v) => v.name === variantName);
  if (!variant) return null;

  const layers = JSON.parse(JSON.stringify(preset.layers)) as PresetLayer[];

  for (const layer of layers) {
    if (typeof layer.opacity === 'number') {
      layer.opacity = Math.min(1, layer.opacity * variant.intensity);
    }

    for (const key in layer.params) {
      const value = layer.params[key];
      if (typeof value === 'number') {
        layer.params[key] = value * variant.intensity;
      }
    }
  }

  if (variant.paramOverrides) {
    for (const [layerIdx, overrides] of Object.entries(variant.paramOverrides)) {
      const idx = parseInt(layerIdx, 10);
      if (idx < layers.length) {
        Object.assign(layers[idx].params, overrides);
      }
    }
  }

  return layers;
}

export class SmartAdaptationEngine {
  private analysisCache = new Map<string, ImageAnalysis>();

  async analyze(imageData: ImageData, cacheKey?: string): Promise<ImageAnalysis> {
    if (cacheKey && this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    const analysis = await analyzeImage(imageData);

    if (cacheKey) {
      this.analysisCache.set(cacheKey, analysis);
    }

    return analysis;
  }

  adapt(preset: Preset, analysis: ImageAnalysis): AdaptedPreset {
    return adaptPreset(preset, analysis);
  }

  getVariant(preset: Preset, variantName: string): PresetLayer[] | null {
    return applyVariant(preset, variantName);
  }

  suggestPresets(analysis: ImageAnalysis, presets: Preset[], maxSuggestions = 5): Preset[] {
    const scored = presets.map((preset) => ({
      preset,
      score: this.scorePresetForImage(preset, analysis),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, maxSuggestions).map((s) => s.preset);
  }

  private scorePresetForImage(preset: Preset, analysis: ImageAnalysis): number {
    let score = 0;

    if (preset.category === 'photography') {
      if (analysis.hasSubject && preset.subcategory === 'portrait') {
        score += 20;
      }
      if (!analysis.hasSubject && preset.subcategory === 'landscape') {
        score += 15;
      }
    }

    if (analysis.saturation < 0.3) {
      if (preset.tags?.includes('vibrant') || preset.tags?.includes('saturated')) {
        score += 10;
      }
    }

    if (analysis.brightness < 0.3) {
      if (preset.tags?.includes('bright') || preset.tags?.includes('light')) {
        score += 10;
      }
      if (preset.tags?.includes('dark') || preset.tags?.includes('moody')) {
        score -= 5;
      }
    }

    if (analysis.brightness > 0.7) {
      if (preset.tags?.includes('dark') || preset.tags?.includes('contrast')) {
        score += 10;
      }
    }

    if (analysis.colorTemperature > 0.3) {
      if (preset.tags?.includes('warm') || preset.tags?.includes('sunset')) {
        score += 15;
      }
    } else if (analysis.colorTemperature < -0.3) {
      if (preset.tags?.includes('cool') || preset.tags?.includes('blue')) {
        score += 15;
      }
    }

    return score;
  }

  clearCache(): void {
    this.analysisCache.clear();
  }
}
