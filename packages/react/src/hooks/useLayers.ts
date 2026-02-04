import { useState, useCallback } from 'react';
import type { LayerOptions } from '../types';

export interface UseLayersReturn {
  layers: LayerOptions[];
  add: (layer: LayerOptions) => void;
  remove: (index: number) => void;
  update: (index: number, layer: Partial<LayerOptions>) => void;
  move: (from: number, to: number) => void;
  clear: () => void;
}

export function useLayers(): UseLayersReturn {
  const [layers, setLayers] = useState<LayerOptions[]>([]);

  const add = useCallback((layer: LayerOptions) => {
    setLayers((prev) => [...prev, { ...layer, visible: true, opacity: 1 }]);
  }, []);

  const remove = useCallback((index: number) => {
    setLayers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const update = useCallback((index: number, updates: Partial<LayerOptions>) => {
    setLayers((prev) =>
      prev.map((layer, i) => (i === index ? { ...layer, ...updates } : layer))
    );
  }, []);

  const move = useCallback((from: number, to: number) => {
    setLayers((prev) => {
      const result = [...prev];
      const [removed] = result.splice(from, 1);
      result.splice(to, 0, removed);
      return result;
    });
  }, []);

  const clear = useCallback(() => {
    setLayers([]);
  }, []);

  return { layers, add, remove, update, move, clear };
}
