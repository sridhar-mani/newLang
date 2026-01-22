import type { Preset, PresetCategory, PresetSubcategory, PresetLayer } from './types';
import { PRESET_CATEGORIES } from './types';
import {
  ALL_PRESETS,
  PHOTOGRAPHY_PRESETS,
  VIDEO_PRESETS,
  GAMING_PRESETS,
  MOTION_PRESETS,
  ARTISTIC_PRESETS,
} from './library';
import { SmartAdaptationEngine, type ImageAnalysis, type AdaptedPreset } from './smart-adaptation';

export interface PresetManagerOptions {
  enableSmartAdaptation?: boolean;
  customPresets?: Preset[];
}

export class PresetManager {
  private presets: Map<string, Preset> = new Map();
  private customPresets: Map<string, Preset> = new Map();
  private adaptationEngine: SmartAdaptationEngine;
  private enableSmartAdaptation: boolean;

  constructor(options: PresetManagerOptions = {}) {
    this.enableSmartAdaptation = options.enableSmartAdaptation ?? true;
    this.adaptationEngine = new SmartAdaptationEngine();

    for (const preset of ALL_PRESETS) {
      this.presets.set(preset.id, preset);
    }

    if (options.customPresets) {
      for (const preset of options.customPresets) {
        this.customPresets.set(preset.id, preset);
      }
    }
  }

  getPreset(id: string): Preset | undefined {
    return this.customPresets.get(id) ?? this.presets.get(id);
  }

  getAllPresets(): Preset[] {
    return [...this.presets.values(), ...this.customPresets.values()];
  }

  getPresetsByCategory(category: PresetCategory): Preset[] {
    return this.getAllPresets().filter((p) => p.category === category);
  }

  getPresetsBySubcategory(category: PresetCategory, subcategory: PresetSubcategory): Preset[] {
    return this.getAllPresets().filter(
      (p) => p.category === category && p.subcategory === subcategory
    );
  }

  searchPresets(query: string): Preset[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllPresets().filter((preset) => {
      if (preset.name.toLowerCase().includes(lowerQuery)) return true;
      if (preset.description?.toLowerCase().includes(lowerQuery)) return true;
      if (preset.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))) return true;
      return false;
    });
  }

  getCategories(): typeof PRESET_CATEGORIES {
    return PRESET_CATEGORIES;
  }

  addCustomPreset(preset: Preset): void {
    if (!preset.id.startsWith('custom-')) {
      preset = { ...preset, id: `custom-${preset.id}` };
    }
    this.customPresets.set(preset.id, preset);
  }

  removeCustomPreset(id: string): boolean {
    return this.customPresets.delete(id);
  }

  getCustomPresets(): Preset[] {
    return [...this.customPresets.values()];
  }

  async applyPreset(
    presetId: string,
    imageData?: ImageData,
    options?: { variant?: string; adapt?: boolean }
  ): Promise<PresetLayer[]> {
    const preset = this.getPreset(presetId);
    if (!preset) {
      throw new Error(`Preset not found: ${presetId}`);
    }

    let layers = [...preset.layers];

    if (options?.variant) {
      const variantLayers = this.adaptationEngine.getVariant(preset, options.variant);
      if (variantLayers) {
        layers = variantLayers;
      }
    }

    if (this.enableSmartAdaptation && imageData && (options?.adapt ?? true)) {
      const analysis = await this.adaptationEngine.analyze(imageData);
      const adapted = this.adaptationEngine.adapt({ ...preset, layers }, analysis);
      layers = adapted.adaptedLayers;
    }

    return layers;
  }

  async suggestPresets(imageData: ImageData, maxSuggestions = 5): Promise<Preset[]> {
    const analysis = await this.adaptationEngine.analyze(imageData);
    return this.adaptationEngine.suggestPresets(analysis, this.getAllPresets(), maxSuggestions);
  }

  async adaptPreset(preset: Preset, imageData: ImageData): Promise<AdaptedPreset> {
    const analysis = await this.adaptationEngine.analyze(imageData);
    return this.adaptationEngine.adapt(preset, analysis);
  }

  exportCustomPresets(): string {
    const presets = this.getCustomPresets();
    return JSON.stringify(presets, null, 2);
  }

  importCustomPresets(json: string): number {
    const presets = JSON.parse(json) as Preset[];
    let count = 0;
    for (const preset of presets) {
      if (preset.id && preset.layers) {
        this.addCustomPreset(preset);
        count++;
      }
    }
    return count;
  }

  createPresetFromLayers(
    name: string,
    layers: PresetLayer[],
    options?: Partial<Omit<Preset, 'id' | 'name' | 'layers'>>
  ): Preset {
    const id = `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const preset: Preset = {
      id,
      name,
      layers,
      category: options?.category ?? 'artistic',
      version: '1.0.0',
      ...options,
    };
    this.addCustomPreset(preset);
    return preset;
  }
}

export const defaultPresetManager = new PresetManager();
