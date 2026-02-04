import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { LayerOptions, PresetInfo } from '../types';

interface EffectContextValue {
  preset: string | null;
  setPreset: (preset: string | null) => void;
  layers: LayerOptions[];
  setLayers: React.Dispatch<React.SetStateAction<LayerOptions[]>>;
  loading: boolean;
  error: Error | null;
}

const EffectContext = createContext<EffectContextValue | null>(null);

export function EffectProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerOptions[]>([]);
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  return (
    <EffectContext.Provider
      value={{ preset, setPreset, layers, setLayers, loading, error }}
    >
      {children}
    </EffectContext.Provider>
  );
}

export function useEffectContext(): EffectContextValue {
  const context = useContext(EffectContext);
  if (!context) {
    throw new Error('useEffectContext must be used within an EffectProvider');
  }
  return context;
}
