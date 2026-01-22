import type {
  ExampleImage,
  StyleAnalysis,
  SynthesizedLayers,
  LearningSession,
  ComparisonResult,
} from './types';
import { ImageAnalyzer } from './analyzer';
import { ShaderSynthesizer } from './synthesizer';

export interface LearnFromExamplesOptions {
  autoSynthesize?: boolean;
  maxExamples?: number;
}

export class LearnFromExamples {
  private sessions: Map<string, LearningSession> = new Map();
  private analyzer: ImageAnalyzer;
  private synthesizer: ShaderSynthesizer;
  private options: Required<LearnFromExamplesOptions>;

  constructor(options: LearnFromExamplesOptions = {}) {
    this.options = {
      autoSynthesize: options.autoSynthesize ?? true,
      maxExamples: options.maxExamples ?? 10,
    };

    this.analyzer = new ImageAnalyzer();
    this.synthesizer = new ShaderSynthesizer();
  }

  createSession(): LearningSession {
    const session: LearningSession = {
      id: `learn-session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      exampleImages: [],
      analyses: new Map(),
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): LearningSession | undefined {
    return this.sessions.get(sessionId);
  }

  async addExample(
    sessionId: string,
    imageData: ImageData,
    options?: { name?: string; tags?: string[]; source?: 'upload' | 'url' | 'sample' }
  ): Promise<{ image: ExampleImage; analysis: StyleAnalysis }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.exampleImages.length >= this.options.maxExamples) {
      throw new Error(`Maximum ${this.options.maxExamples} examples allowed per session`);
    }

    const image: ExampleImage = {
      id: `example-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      imageData,
      source: options?.source ?? 'upload',
      name: options?.name,
      tags: options?.tags,
    };

    const analysis = await this.analyzer.analyze(imageData);

    session.exampleImages.push(image);
    session.analyses.set(image.id, analysis);
    session.modifiedAt = Date.now();

    if (this.options.autoSynthesize) {
      session.synthesizedResult = this.synthesizeFromSession(session);
    }

    return { image, analysis };
  }

  removeExample(sessionId: string, imageId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const index = session.exampleImages.findIndex((img) => img.id === imageId);
    if (index < 0) return false;

    session.exampleImages.splice(index, 1);
    session.analyses.delete(imageId);
    session.modifiedAt = Date.now();

    if (this.options.autoSynthesize && session.exampleImages.length > 0) {
      session.synthesizedResult = this.synthesizeFromSession(session);
    } else {
      session.synthesizedResult = undefined;
    }

    return true;
  }

  async learnFromImage(imageData: ImageData): Promise<SynthesizedLayers> {
    const analysis = await this.analyzer.analyze(imageData);
    return this.synthesizer.synthesize(analysis);
  }

  synthesize(sessionId: string): SynthesizedLayers {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.exampleImages.length === 0) {
      throw new Error('No example images in session');
    }

    const result = this.synthesizeFromSession(session);
    session.synthesizedResult = result;
    session.modifiedAt = Date.now();

    return result;
  }

  private synthesizeFromSession(session: LearningSession): SynthesizedLayers {
    if (session.exampleImages.length === 1) {
      const analysis = session.analyses.get(session.exampleImages[0].id)!;
      return this.synthesizer.synthesize(analysis);
    }

    const mergedAnalysis = this.mergeAnalyses([...session.analyses.values()]);
    return this.synthesizer.synthesize(mergedAnalysis);
  }

  private mergeAnalyses(analyses: StyleAnalysis[]): StyleAnalysis {
    if (analyses.length === 1) return analyses[0];

    const colorProfile = {
      dominantColors: analyses[0].colorProfile.dominantColors,
      colorTemperature: this.average(analyses.map((a) => a.colorProfile.colorTemperature)),
      saturationLevel: this.average(analyses.map((a) => a.colorProfile.saturationLevel)),
      hueDistribution: this.averageArrays(analyses.map((a) => a.colorProfile.hueDistribution)),
      colorHarmony: analyses[0].colorProfile.colorHarmony,
    };

    const toneProfile = {
      brightness: this.average(analyses.map((a) => a.toneProfile.brightness)),
      contrast: this.average(analyses.map((a) => a.toneProfile.contrast)),
      shadowLevel: this.average(analyses.map((a) => a.toneProfile.shadowLevel)),
      highlightLevel: this.average(analyses.map((a) => a.toneProfile.highlightLevel)),
      midtoneBalance: this.average(analyses.map((a) => a.toneProfile.midtoneBalance)),
      dynamicRange: this.average(analyses.map((a) => a.toneProfile.dynamicRange)),
      histogram: this.averageArrays(analyses.map((a) => a.toneProfile.histogram)),
    };

    const textureProfile = {
      grainAmount: this.average(analyses.map((a) => a.textureProfile.grainAmount)),
      sharpness: this.average(analyses.map((a) => a.textureProfile.sharpness)),
      noiseType: analyses[0].textureProfile.noiseType,
      patternType: analyses[0].textureProfile.patternType,
      edgeDefinition: this.average(analyses.map((a) => a.textureProfile.edgeDefinition)),
    };

    const allMarkers = analyses.flatMap((a) => a.styleMarkers);
    const markerCounts = new Map<
      string,
      { marker: (typeof allMarkers)[0]; count: number; totalConfidence: number }
    >();

    for (const marker of allMarkers) {
      const existing = markerCounts.get(marker.type);
      if (existing) {
        existing.count++;
        existing.totalConfidence += marker.confidence;
      } else {
        markerCounts.set(marker.type, { marker, count: 1, totalConfidence: marker.confidence });
      }
    }

    const styleMarkers = [...markerCounts.values()]
      .filter((m) => m.count >= analyses.length / 2)
      .map((m) => ({
        ...m.marker,
        confidence: m.totalConfidence / m.count,
      }));

    const allEffects = analyses.flatMap((a) => a.dominantEffects);
    const effectCounts = new Map<string, { effect: (typeof allEffects)[0]; count: number }>();

    for (const effect of allEffects) {
      const key = `${effect.effectType}-${effect.effectName}`;
      const existing = effectCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        effectCounts.set(key, { effect, count: 1 });
      }
    }

    const dominantEffects = [...effectCounts.values()]
      .filter((e) => e.count >= analyses.length / 2)
      .map((e) => e.effect);

    return {
      colorProfile,
      toneProfile,
      textureProfile,
      styleMarkers,
      dominantEffects,
      confidence: this.average(analyses.map((a) => a.confidence)),
    };
  }

  private average(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private averageArrays(arrays: number[][]): number[] {
    if (arrays.length === 0) return [];
    const length = arrays[0].length;
    const result = new Array(length).fill(0);

    for (const arr of arrays) {
      for (let i = 0; i < length; i++) {
        result[i] += arr[i] / arrays.length;
      }
    }

    return result;
  }

  refine(
    sessionId: string,
    feedback: 'more' | 'less' | 'warmer' | 'cooler' | 'sharper' | 'softer'
  ): SynthesizedLayers {
    const session = this.sessions.get(sessionId);
    if (!session || !session.synthesizedResult) {
      throw new Error('No synthesis result to refine');
    }

    const refined = this.synthesizer.refine(session.synthesizedResult, feedback);
    session.synthesizedResult = refined;
    session.modifiedAt = Date.now();

    return refined;
  }

  async compare(imageDataA: ImageData, imageDataB: ImageData): Promise<ComparisonResult> {
    const analysisA = await this.analyzer.analyze(imageDataA);
    const analysisB = await this.analyzer.analyze(imageDataB);

    const colorSimilarity = this.compareColorProfiles(
      analysisA.colorProfile,
      analysisB.colorProfile
    );

    const toneSimilarity = this.compareToneProfiles(analysisA.toneProfile, analysisB.toneProfile);

    const textureSimilarity = this.compareTextureProfiles(
      analysisA.textureProfile,
      analysisB.textureProfile
    );

    const effectSimilarity = this.compareEffects(
      analysisA.dominantEffects,
      analysisB.dominantEffects
    );

    const similarity =
      colorSimilarity * 0.3 +
      toneSimilarity * 0.3 +
      textureSimilarity * 0.2 +
      effectSimilarity * 0.2;

    const differences: string[] = [];

    if (colorSimilarity < 0.7) {
      differences.push('Color profiles differ significantly');
    }
    if (toneSimilarity < 0.7) {
      differences.push('Tone/contrast profiles differ');
    }
    if (textureSimilarity < 0.7) {
      differences.push('Texture characteristics differ');
    }

    return {
      similarity,
      colorSimilarity,
      toneSimilarity,
      textureSimilarity,
      effectSimilarity,
      differences,
    };
  }

  private compareColorProfiles(
    a: StyleAnalysis['colorProfile'],
    b: StyleAnalysis['colorProfile']
  ): number {
    const tempDiff = Math.abs(a.colorTemperature - b.colorTemperature);
    const satDiff = Math.abs(a.saturationLevel - b.saturationLevel);

    return 1 - (tempDiff + satDiff) / 2;
  }

  private compareToneProfiles(
    a: StyleAnalysis['toneProfile'],
    b: StyleAnalysis['toneProfile']
  ): number {
    const brightDiff = Math.abs(a.brightness - b.brightness);
    const contrastDiff = Math.abs(a.contrast - b.contrast);

    return 1 - (brightDiff + contrastDiff) / 2;
  }

  private compareTextureProfiles(
    a: StyleAnalysis['textureProfile'],
    b: StyleAnalysis['textureProfile']
  ): number {
    const grainDiff = Math.abs(a.grainAmount - b.grainAmount);
    const sharpDiff = Math.abs(a.sharpness - b.sharpness);
    const typeMatch = a.noiseType === b.noiseType ? 1 : 0.5;

    return (1 - (grainDiff + sharpDiff) / 2) * typeMatch;
  }

  private compareEffects(
    a: StyleAnalysis['dominantEffects'],
    b: StyleAnalysis['dominantEffects']
  ): number {
    if (a.length === 0 && b.length === 0) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const aSet = new Set(a.map((e) => e.effectName));
    const bSet = new Set(b.map((e) => e.effectName));

    let matches = 0;
    for (const name of aSet) {
      if (bSet.has(name)) matches++;
    }

    return matches / Math.max(aSet.size, bSet.size);
  }

  clearSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.exampleImages = [];
    session.analyses.clear();
    session.synthesizedResult = undefined;
    session.modifiedAt = Date.now();
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }
}

export const defaultLearnFromExamples = new LearnFromExamples();
