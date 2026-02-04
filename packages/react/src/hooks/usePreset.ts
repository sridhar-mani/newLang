import { useState, useCallback, useMemo } from 'react';
import type { PresetInfo, PresetOptions } from '../types';

const ALL_PRESETS: PresetInfo[] = [
  { name: 'Golden Hour', category: 'Photography' },
  { name: 'Vintage Film', category: 'Photography' },
  { name: 'HDR Pro', category: 'Photography' },
  { name: 'Black & White', category: 'Photography' },
  { name: 'Cinematic', category: 'Photography' },
  { name: 'Motion Blur', category: 'Video' },
  { name: 'VHS', category: 'Video' },
  { name: 'Film Grain', category: 'Video' },
  { name: 'Sci-Fi Neon', category: 'Gaming' },
  { name: 'Cyberpunk', category: 'Gaming' },
  { name: 'Glitch', category: 'Gaming' },
  { name: 'Watercolor', category: 'Artistic' },
  { name: 'Oil Paint', category: 'Artistic' },
  { name: 'Sketch', category: 'Artistic' },
  { name: 'Instagram', category: 'Social' },
  { name: 'Warm Glow', category: 'Social' },
  { name: 'Dreamy', category: 'Social' },
];

export interface UsePresetReturn {
  presets: PresetInfo[];
  current: string | null;
  apply: (presetName: string) => void;
  categories: string[];
  filter: (options: PresetOptions) => void;
}

export function usePreset(): UsePresetReturn {
  const [current, setCurrent] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<PresetOptions>({});

  const categories = useMemo(() => {
    return [...new Set(ALL_PRESETS.map((p) => p.category))];
  }, []);

  const presets = useMemo(() => {
    let result = ALL_PRESETS;
    if (filterOptions.category) {
      result = result.filter((p) => p.category === filterOptions.category);
    }
    if (filterOptions.search) {
      const search = filterOptions.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(search));
    }
    return result;
  }, [filterOptions]);

  const apply = useCallback((presetName: string) => {
    setCurrent(presetName);
  }, []);

  const filter = useCallback((options: PresetOptions) => {
    setFilterOptions(options);
  }, []);

  return { presets, current, apply, categories, filter };
}
