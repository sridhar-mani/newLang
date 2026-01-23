import type { EffectLayer } from '@shader3d/layers';

export type PresetCategory =
  | 'photography'
  | 'video'
  | 'gaming'
  | 'motion'
  | 'artistic'
  | 'color'
  | 'vintage'
  | 'modern';

export type PresetSubcategory =
  | 'portrait'
  | 'landscape'
  | 'street'
  | 'retro'
  | 'cinematic'
  | 'genre'
  | 'transition'
  | 'stylize';

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  subcategory?: PresetSubcategory;
  tags: string[];
  icon: string;
  thumbnail?: string;
  author?: string;
  version: string;
  layers: PresetLayer[];
  adaptiveParams?: AdaptiveParam[];
  variants?: PresetVariant[];
}

export interface PresetLayer {
  type: EffectLayer['type'];
  effect: string;
  params: Record<string, number | boolean | number[] | string>;
  opacity: number;
  blendMode: string;
  enabled: boolean;
}

export interface AdaptiveParam {
  layerIndex: number;
  paramName: string;
  adaptTo: 'brightness' | 'contrast' | 'saturation' | 'dominantColor' | 'subject';
  mapping: AdaptiveMapping;
}

export interface AdaptiveMapping {
  inputMin: number;
  inputMax: number;
  outputMin: number;
  outputMax: number;
  curve?: 'linear' | 'ease' | 'easeIn' | 'easeOut';
}

export interface PresetVariant {
  name: string;
  intensity: number;
  paramOverrides: Record<string, Record<string, number>>;
}

export interface PresetLibrary {
  presets: Preset[];
  categories: CategoryInfo[];
}

export interface CategoryInfo {
  id: PresetCategory;
  name: string;
  icon: string;
  subcategories: { id: PresetSubcategory; name: string }[];
}

export const PRESET_CATEGORIES: CategoryInfo[] = [
  {
    id: 'photography',
    name: 'Photography',
    icon: '📷',
    subcategories: [
      { id: 'portrait', name: 'Portrait' },
      { id: 'landscape', name: 'Landscape' },
      { id: 'street', name: 'Street' },
    ],
  },
  {
    id: 'video',
    name: 'Video',
    icon: '🎬',
    subcategories: [
      { id: 'cinematic', name: 'Cinematic' },
      { id: 'retro', name: 'Retro' },
      { id: 'genre', name: 'Genre' },
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: '🎮',
    subcategories: [
      { id: 'retro', name: 'Retro' },
      { id: 'stylize', name: 'Stylize' },
    ],
  },
  {
    id: 'motion',
    name: 'Motion',
    icon: '🎥',
    subcategories: [
      { id: 'transition', name: 'Transitions' },
      { id: 'stylize', name: 'Effects' },
    ],
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: '📼',
    subcategories: [{ id: 'retro', name: 'Classic' }],
  },
  {
    id: 'artistic',
    name: 'Artistic',
    icon: '🎨',
    subcategories: [{ id: 'stylize', name: 'Styles' }],
  },
  {
    id: 'color',
    name: 'Color',
    icon: '🌈',
    subcategories: [],
  },
  {
    id: 'modern',
    name: 'Modern',
    icon: '✨',
    subcategories: [{ id: 'cinematic', name: 'Cinema' }],
  },
];
