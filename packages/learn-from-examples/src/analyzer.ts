import type {
  StyleAnalysis,
  ColorProfile,
  ToneProfile,
  TextureProfile,
  StyleMarker,
  DetectedEffect,
  StyleMarkerType,
} from './types';

export class ImageAnalyzer {
  async analyze(imageData: ImageData): Promise<StyleAnalysis> {
    const colorProfile = this.analyzeColors(imageData);
    const toneProfile = this.analyzeTones(imageData);
    const textureProfile = await this.analyzeTexture(imageData);
    const styleMarkers = this.detectStyleMarkers(
      imageData,
      colorProfile,
      toneProfile,
      textureProfile
    );
    const dominantEffects = this.detectEffects(
      styleMarkers,
      colorProfile,
      toneProfile,
      textureProfile
    );

    const confidence = this.calculateOverallConfidence(styleMarkers, dominantEffects);

    return {
      colorProfile,
      toneProfile,
      textureProfile,
      styleMarkers,
      dominantEffects,
      confidence,
    };
  }

  private analyzeColors(imageData: ImageData): ColorProfile {
    const { data, width, height } = imageData;
    const pixelCount = width * height;

    const colorBuckets = new Map<string, { count: number; r: number; g: number; b: number }>();
    let totalR = 0,
      totalG = 0,
      totalB = 0;
    let saturationSum = 0;
    const hueHistogram = new Array(360).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      totalR += r;
      totalG += g;
      totalB += b;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        saturationSum += s;

        let h = 0;
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;

        hueHistogram[Math.floor(h * 359)]++;
      }

      const bucketR = Math.floor(r * 4);
      const bucketG = Math.floor(g * 4);
      const bucketB = Math.floor(b * 4);
      const key = `${bucketR},${bucketG},${bucketB}`;

      const existing = colorBuckets.get(key);
      if (existing) {
        existing.count++;
        existing.r += r;
        existing.g += g;
        existing.b += b;
      } else {
        colorBuckets.set(key, { count: 1, r, g, b });
      }
    }

    const sortedBuckets = [...colorBuckets.values()].sort((a, b) => b.count - a.count);
    const dominantColors: [number, number, number][] = sortedBuckets
      .slice(0, 5)
      .map((bucket) => [bucket.r / bucket.count, bucket.g / bucket.count, bucket.b / bucket.count]);

    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;

    const colorTemperature = (avgR - avgB) * 2;
    const saturationLevel = saturationSum / pixelCount;

    const colorHarmony = this.detectColorHarmony(hueHistogram);

    return {
      dominantColors,
      colorTemperature,
      saturationLevel,
      hueDistribution: hueHistogram.map((v) => v / pixelCount),
      colorHarmony,
    };
  }

  private detectColorHarmony(hueHistogram: number[]): ColorProfile['colorHarmony'] {
    const peaks: number[] = [];
    const threshold = Math.max(...hueHistogram) * 0.3;

    for (let i = 0; i < 360; i++) {
      if (hueHistogram[i] > threshold) {
        const prev = hueHistogram[(i - 10 + 360) % 360];
        const next = hueHistogram[(i + 10) % 360];
        if (hueHistogram[i] > prev && hueHistogram[i] > next) {
          peaks.push(i);
        }
      }
    }

    if (peaks.length <= 1) return 'monochromatic';
    if (peaks.length === 2) {
      const diff = Math.abs(peaks[1] - peaks[0]);
      if (diff > 150 && diff < 210) return 'complementary';
      if (diff < 60) return 'analogous';
    }
    if (peaks.length === 3) {
      return 'triadic';
    }

    return 'neutral';
  }

  private analyzeTones(imageData: ImageData): ToneProfile {
    const { data } = imageData;
    const histogram = new Array(256).fill(0);
    const pixelCount = data.length / 4;

    let minLum = 255,
      maxLum = 0;
    let lumSum = 0;

    for (let i = 0; i < data.length; i += 4) {
      const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      histogram[lum]++;
      lumSum += lum;
      minLum = Math.min(minLum, lum);
      maxLum = Math.max(maxLum, lum);
    }

    const brightness = lumSum / pixelCount / 255;
    const dynamicRange = (maxLum - minLum) / 255;

    let shadowSum = 0,
      shadowCount = 0;
    let highlightSum = 0,
      highlightCount = 0;
    let midtoneSum = 0,
      midtoneCount = 0;

    for (let i = 0; i < 256; i++) {
      if (i < 64) {
        shadowSum += histogram[i] * i;
        shadowCount += histogram[i];
      } else if (i > 192) {
        highlightSum += histogram[i] * i;
        highlightCount += histogram[i];
      } else {
        midtoneSum += histogram[i] * i;
        midtoneCount += histogram[i];
      }
    }

    const shadowLevel = shadowCount > 0 ? shadowSum / shadowCount / 64 : 0;
    const highlightLevel = highlightCount > 0 ? (highlightSum / highlightCount - 192) / 64 : 0;
    const midtoneBalance = midtoneCount > 0 ? (midtoneSum / midtoneCount - 128) / 64 : 0;

    const mean = lumSum / pixelCount;
    let variance = 0;
    for (let i = 0; i < 256; i++) {
      variance += histogram[i] * Math.pow(i - mean, 2);
    }
    const contrast = Math.sqrt(variance / pixelCount) / 128;

    return {
      brightness,
      contrast,
      shadowLevel,
      highlightLevel,
      midtoneBalance,
      dynamicRange,
      histogram: histogram.map((v) => v / pixelCount),
    };
  }

  private async analyzeTexture(imageData: ImageData): Promise<TextureProfile> {
    const { data, width, height } = imageData;

    let edgeSum = 0;
    let noiseSum = 0;
    let linePatternScore = 0;

    const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 100));
    let sampleCount = 0;

    for (let y = 1; y < height - 1; y += sampleStep) {
      for (let x = 1; x < width - 1; x += sampleStep) {
        const idx = (y * width + x) * 4;
        const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

        const left = (data[idx - 4] + data[idx - 3] + data[idx - 2]) / 3;
        const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
        const up =
          (data[idx - width * 4] + data[idx - width * 4 + 1] + data[idx - width * 4 + 2]) / 3;
        const down =
          (data[idx + width * 4] + data[idx + width * 4 + 1] + data[idx + width * 4 + 2]) / 3;

        const gx = Math.abs(right - left);
        const gy = Math.abs(down - up);
        edgeSum += Math.sqrt(gx * gx + gy * gy);

        const avg = (left + right + up + down) / 4;
        noiseSum += Math.abs(current - avg);

        if (y % 2 === 0 && Math.abs(current - up) > 10) {
          linePatternScore++;
        }

        sampleCount++;
      }
    }

    const edgeDefinition = Math.min(1, edgeSum / sampleCount / 50);
    const grainAmount = Math.min(1, noiseSum / sampleCount / 30);
    const sharpness = edgeDefinition;

    let noiseType: TextureProfile['noiseType'] = 'none';
    if (grainAmount > 0.3) noiseType = 'coarse';
    else if (grainAmount > 0.15) noiseType = 'film';
    else if (grainAmount > 0.05) noiseType = 'fine';

    let patternType: TextureProfile['patternType'] = 'none';
    const lineRatio = linePatternScore / sampleCount;
    if (lineRatio > 0.3) patternType = 'scanlines';

    return {
      grainAmount,
      sharpness,
      noiseType,
      patternType,
      edgeDefinition,
    };
  }

  private detectStyleMarkers(
    imageData: ImageData,
    colorProfile: ColorProfile,
    toneProfile: ToneProfile,
    textureProfile: TextureProfile
  ): StyleMarker[] {
    const markers: StyleMarker[] = [];
    const { data, width, height } = imageData;

    const vignetteStrength = this.detectVignette(data, width, height);
    if (vignetteStrength > 0.15) {
      markers.push({
        type: 'vignette',
        confidence: Math.min(1, vignetteStrength * 2),
        value: vignetteStrength,
      });
    }

    const bloomIndicators = this.detectBloom(data, width, height, toneProfile);
    if (bloomIndicators > 0.2) {
      markers.push({
        type: 'bloom',
        confidence: Math.min(1, bloomIndicators * 1.5),
        value: bloomIndicators,
      });
    }

    const chromaticScore = this.detectChromaticAberration(data, width, height);
    if (chromaticScore > 0.1) {
      markers.push({
        type: 'chromatic-aberration',
        confidence: Math.min(1, chromaticScore * 3),
        value: chromaticScore,
      });
    }

    if (textureProfile.grainAmount > 0.08) {
      markers.push({
        type: 'film-grain',
        confidence: Math.min(1, textureProfile.grainAmount * 3),
        value: textureProfile.grainAmount,
      });
    }

    if (toneProfile.contrast > 0.6) {
      markers.push({
        type: 'high-contrast',
        confidence: toneProfile.contrast,
        value: toneProfile.contrast,
      });
    } else if (toneProfile.contrast < 0.3) {
      markers.push({
        type: 'low-contrast',
        confidence: 1 - toneProfile.contrast,
        value: toneProfile.contrast,
      });
    }

    if (colorProfile.saturationLevel < 0.15) {
      markers.push({
        type: 'desaturated',
        confidence: 1 - colorProfile.saturationLevel * 3,
        value: colorProfile.saturationLevel,
      });
    }

    if (colorProfile.colorTemperature > 0.3 && colorProfile.colorTemperature < 0.8) {
      if (colorProfile.colorHarmony === 'complementary') {
        markers.push({
          type: 'teal-orange',
          confidence: 0.7,
          value: colorProfile.colorTemperature,
        });
      }
    }

    if (
      colorProfile.colorTemperature > 0.4 &&
      toneProfile.contrast < 0.4 &&
      textureProfile.grainAmount > 0.05
    ) {
      markers.push({ type: 'vintage', confidence: 0.6 });
    }

    if (toneProfile.contrast > 0.5 && colorProfile.saturationLevel > 0.3) {
      markers.push({ type: 'cinematic', confidence: 0.5 });
    }

    if (toneProfile.contrast < 0.4 && textureProfile.sharpness < 0.3) {
      markers.push({ type: 'dreamy', confidence: 0.5 });
    }

    return markers;
  }

  private detectVignette(data: Uint8ClampedArray, width: number, height: number): number {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    let edgeLum = 0,
      edgeCount = 0;
    let centerLum = 0,
      centerCount = 0;

    const sampleRadius = 0.1;
    const edgeRadius = 0.9;

    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

        const idx = (y * width + x) * 4;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

        if (dist < sampleRadius) {
          centerLum += lum;
          centerCount++;
        } else if (dist > edgeRadius) {
          edgeLum += lum;
          edgeCount++;
        }
      }
    }

    if (centerCount === 0 || edgeCount === 0) return 0;

    const avgCenter = centerLum / centerCount;
    const avgEdge = edgeLum / edgeCount;

    return Math.max(0, (avgCenter - avgEdge) / 255);
  }

  private detectBloom(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    toneProfile: ToneProfile
  ): number {
    let brightPixels = 0;
    let bloomLikePixels = 0;
    const threshold = 220;

    for (let y = 1; y < height - 1; y += 3) {
      for (let x = 1; x < width - 1; x += 3) {
        const idx = (y * width + x) * 4;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

        if (lum > threshold) {
          brightPixels++;

          let neighborBright = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nIdx = ((y + dy) * width + (x + dx)) * 4;
              const nLum = 0.299 * data[nIdx] + 0.587 * data[nIdx + 1] + 0.114 * data[nIdx + 2];
              if (nLum > threshold * 0.7) neighborBright++;
            }
          }

          if (neighborBright >= 4) bloomLikePixels++;
        }
      }
    }

    if (brightPixels === 0) return 0;
    return bloomLikePixels / brightPixels;
  }

  private detectChromaticAberration(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): number {
    let aberrationScore = 0;
    let sampleCount = 0;

    for (let y = 1; y < height - 1; y += 10) {
      for (let x = 1; x < width - 1; x += 10) {
        const idx = (y * width + x) * 4;

        const rDiff = Math.abs(data[idx] - data[idx + 4]);
        const gDiff = Math.abs(data[idx + 1] - data[idx + 5]);
        const bDiff = Math.abs(data[idx + 2] - data[idx + 6]);

        if (rDiff > 20 && gDiff < 10 && bDiff > 20) {
          aberrationScore++;
        }

        sampleCount++;
      }
    }

    return aberrationScore / sampleCount;
  }

  private detectEffects(
    markers: StyleMarker[],
    colorProfile: ColorProfile,
    toneProfile: ToneProfile,
    textureProfile: TextureProfile
  ): DetectedEffect[] {
    const effects: DetectedEffect[] = [];

    for (const marker of markers) {
      const effect = this.markerToEffect(marker, colorProfile, toneProfile, textureProfile);
      if (effect) {
        effects.push(effect);
      }
    }

    effects.sort((a, b) => b.importance - a.importance);

    return effects;
  }

  private markerToEffect(
    marker: StyleMarker,
    colorProfile: ColorProfile,
    toneProfile: ToneProfile,
    textureProfile: TextureProfile
  ): DetectedEffect | null {
    switch (marker.type) {
      case 'vignette':
        return {
          effectType: 'stylize',
          effectName: 'vignette',
          confidence: marker.confidence,
          estimatedParams: {
            intensity: (marker.value ?? 0.3) * 1.5,
            softness: 0.5,
            size: 0.6,
          },
          importance: 0.7,
        };

      case 'bloom':
        return {
          effectType: 'glow',
          effectName: 'bloom',
          confidence: marker.confidence,
          estimatedParams: {
            intensity: (marker.value ?? 0.3) * 2,
            radius: 25,
            threshold: 0.6,
          },
          importance: 0.8,
        };

      case 'chromatic-aberration':
        return {
          effectType: 'stylize',
          effectName: 'chromaticAberration',
          confidence: marker.confidence,
          estimatedParams: {
            intensity: (marker.value ?? 0.01) * 0.5,
            angle: 0,
          },
          importance: 0.5,
        };

      case 'film-grain':
        return {
          effectType: 'noise',
          effectName: 'grain',
          confidence: marker.confidence,
          estimatedParams: {
            amount: textureProfile.grainAmount,
            scale: 1,
            monochrome: 1,
          },
          importance: 0.6,
        };

      case 'high-contrast':
        return {
          effectType: 'color',
          effectName: 'brightnessContrast',
          confidence: marker.confidence,
          estimatedParams: {
            brightness: 0,
            contrast: (toneProfile.contrast - 0.5) * 0.8,
          },
          importance: 0.9,
        };

      case 'desaturated':
        return {
          effectType: 'color',
          effectName: 'hueSaturation',
          confidence: marker.confidence,
          estimatedParams: {
            hue: 0,
            saturation: colorProfile.saturationLevel - 0.5,
            lightness: 0,
          },
          importance: 0.85,
        };

      default:
        return null;
    }
  }

  private calculateOverallConfidence(markers: StyleMarker[], effects: DetectedEffect[]): number {
    if (markers.length === 0) return 0.3;

    const avgMarkerConfidence = markers.reduce((sum, m) => sum + m.confidence, 0) / markers.length;
    const effectBonus = Math.min(0.2, effects.length * 0.05);

    return Math.min(1, avgMarkerConfidence + effectBonus);
  }
}
