import { useState, useCallback } from 'react';
import {
  LayerComposition,
  createLayer,
  BlendMode,
  type EffectLayer,
} from '@shader3d/layers';

type AnyLayer = EffectLayer;

interface LayerState {
  layer: AnyLayer;
  visible: boolean;
  expanded: boolean;
}

const blendModes: BlendMode[] = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'colorDodge',
  'colorBurn',
  'hardLight',
  'softLight',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
];

const effectTypes = [
  { id: 'blur', name: 'Blur', icon: '🌫️' },
  { id: 'glow', name: 'Glow', icon: '✨' },
  { id: 'vignette', name: 'Vignette', icon: '🔲' },
  { id: 'noise', name: 'Noise', icon: '📺' },
  { id: 'chromatic-aberration', name: 'Chromatic Aberration', icon: '🌈' },
  { id: 'pixelate', name: 'Pixelate', icon: '🎮' },
];

const adjustmentTypes = [
  { id: 'brightness-contrast', name: 'Brightness/Contrast', icon: '☀️' },
  { id: 'hue-saturation', name: 'Hue/Saturation', icon: '🎨' },
  { id: 'levels', name: 'Levels', icon: '📊' },
  { id: 'curves', name: 'Curves', icon: '📈' },
  { id: 'color-balance', name: 'Color Balance', icon: '⚖️' },
  { id: 'invert', name: 'Invert', icon: '🔄' },
];

export function LayerEditor() {
  const [layers, setLayers] = useState<LayerState[]>([
    {
      layer: createLayer('blur', 'gaussian', {
        name: 'Background Blur',
      }),
      visible: true,
      expanded: false,
    },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const addEffectLayer = useCallback((effectType: string) => {
    // Map effect IDs to actual layer types
    const typeMap: Record<string, { type: EffectLayer['type']; effect: string }> = {
      blur: { type: 'blur', effect: 'gaussian' },
      glow: { type: 'glow', effect: 'bloom' },
      vignette: { type: 'stylize', effect: 'vignette' },
      chromatic: { type: 'stylize', effect: 'chromaticAberration' },
      grain: { type: 'noise', effect: 'grain' },
      distortion: { type: 'distortion', effect: 'wave' },
    };
    const mapping = typeMap[effectType] || { type: 'blur', effect: 'gaussian' };
    const newLayer = createLayer(mapping.type, mapping.effect, {
      name: `${effectType.charAt(0).toUpperCase() + effectType.slice(1)} Effect`,
    });
    setLayers((prev) => [...prev, { layer: newLayer, visible: true, expanded: true }]);
    setSelectedLayerId(newLayer.id);
  }, []);

  const addAdjustmentLayer = useCallback((adjustmentType: string) => {
    // Map adjustment IDs to color layer effects
    const effectMap: Record<string, string> = {
      'brightness-contrast': 'brightnessContrast',
      'hue-saturation': 'hueSaturation',
      vibrance: 'vibrance',
      tint: 'tint',
      invert: 'invert',
    };
    const effect = effectMap[adjustmentType] || 'brightnessContrast';
    const newLayer = createLayer('color', effect, {
      name: `${adjustmentType
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')}`,
    });
    setLayers((prev) => [...prev, { layer: newLayer, visible: true, expanded: true }]);
    setSelectedLayerId(newLayer.id);
  }, []);

  const addSolidLayer = useCallback(() => {
    // Use a color layer with tint as a "solid" layer
    const newLayer = createLayer('color', 'tint', {
      name: 'Color Fill',
      blendMode: 'overlay',
      opacity: 0.7,
    });
    setLayers((prev) => [...prev, { layer: newLayer, visible: true, expanded: true }]);
    setSelectedLayerId(newLayer.id);
  }, []);

  const updateLayer = useCallback((id: string, updates: Partial<AnyLayer>) => {
    setLayers((prev) =>
      prev.map((ls) =>
        ls.layer.id === id ? { ...ls, layer: { ...ls.layer, ...updates } as AnyLayer } : ls
      )
    );
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((ls) => (ls.layer.id === id ? { ...ls, visible: !ls.visible } : ls))
    );
  }, []);

  const deleteLayer = useCallback(
    (id: string) => {
      setLayers((prev) => prev.filter((ls) => ls.layer.id !== id));
      if (selectedLayerId === id) {
        setSelectedLayerId(null);
      }
    },
    [selectedLayerId]
  );

  const moveLayer = useCallback((id: string, direction: 'up' | 'down') => {
    setLayers((prev) => {
      const index = prev.findIndex((ls) => ls.layer.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index + 1 : index - 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newLayers = [...prev];
      [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
      return newLayers;
    });
  }, []);

  const generateShaderCode = useCallback(() => {
    const composition = new LayerComposition(800, 600);
    layers
      .filter((ls) => ls.visible)
      .forEach((ls) => {
        composition.addLayer(ls.layer);
      });
    const result = composition.compile();
    setGeneratedCode(result.wgsl);
  }, [layers]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: '1.5rem' }}>
      {/* Layer Stack */}
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          padding: '1rem',
          maxHeight: '600px',
          overflow: 'auto',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#888' }}>Layer Stack</h3>

        {[...layers].reverse().map((ls, index) => (
          <div
            key={ls.layer.id}
            onClick={() => setSelectedLayerId(ls.layer.id)}
            style={{
              background: selectedLayerId === ls.layer.id ? '#2a2a4e' : '#222238',
              border:
                selectedLayerId === ls.layer.id ? '1px solid #4a9eff' : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              opacity: ls.visible ? 1 : 0.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(ls.layer.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                {ls.visible ? '👁️' : '👁️‍🗨️'}
              </button>
              <span style={{ flex: 1, fontSize: '0.85rem' }}>{ls.layer.name}</span>
              <span style={{ fontSize: '0.7rem', color: '#666' }}>{ls.layer.type}</span>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayer(ls.layer.id, 'up');
                }}
                disabled={index === 0}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                }}
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayer(ls.layer.id, 'down');
                }}
                disabled={index === layers.length - 1}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                }}
              >
                ↓
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLayer(ls.layer.id);
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#443',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#f88',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  marginLeft: 'auto',
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview & Add Layers */}
      <div>
        <div
          style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Layer preview visualization */}
          {layers
            .filter((ls) => ls.visible)
            .map((ls, index) => (
              <div
                key={ls.layer.id}
                style={{
                  position: 'absolute',
                  inset: `${10 + index * 5}px`,
                  borderRadius: '8px',
                  background:
                    ls.layer.type === 'color'
                      ? 'linear-gradient(135deg, rgba(255, 200, 100, 0.3), rgba(100, 150, 255, 0.3))'
                      : 'linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(255, 107, 107, 0.3))',
                  border: '1px solid rgba(255,255,255,0.1)',
                  mixBlendMode:
                    ls.layer.blendMode === 'normal' ? 'normal' : (ls.layer.blendMode as any),
                  opacity: ls.layer.opacity,
                }}
              />
            ))}
          <span
            style={{
              position: 'relative',
              color: '#666',
              fontSize: '0.9rem',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            Layer Composition Preview
            <br />
            <span style={{ fontSize: '0.75rem' }}>
              {layers.length} layers • {layers.filter((ls) => ls.visible).length} visible
            </span>
          </span>
        </div>

        {/* Add Layer Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#888' }}>Effects</h4>
            {effectTypes.map((effect) => (
              <button
                key={effect.id}
                onClick={() => addEffectLayer(effect.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.25rem',
                  background: '#2a2a3e',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ccc',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                }}
              >
                {effect.icon} {effect.name}
              </button>
            ))}
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#888' }}>
              Adjustments
            </h4>
            {adjustmentTypes.map((adj) => (
              <button
                key={adj.id}
                onClick={() => addAdjustmentLayer(adj.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.25rem',
                  background: '#2a2a3e',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ccc',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                }}
              >
                {adj.icon} {adj.name}
              </button>
            ))}
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#888' }}>Fills</h4>
            <button
              onClick={addSolidLayer}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.25rem',
                background: '#2a2a3e',
                border: 'none',
                borderRadius: '6px',
                color: '#ccc',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textAlign: 'left',
              }}
            >
              🎨 Solid Color
            </button>
          </div>
        </div>

        <button
          onClick={generateShaderCode}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#4a9eff',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            width: '100%',
            fontWeight: 600,
          }}
        >
          Generate Shader Code
        </button>
      </div>

      {/* Properties Panel */}
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          padding: '1rem',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#888' }}>
          Layer Properties
        </h3>

        {selectedLayerId ? (
          (() => {
            const selectedLayer = layers.find((ls) => ls.layer.id === selectedLayerId)?.layer;
            if (!selectedLayer) return null;

            return (
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#888',
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={selectedLayer.name}
                  onChange={(e) => updateLayer(selectedLayerId, { name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#222238',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    marginBottom: '1rem',
                  }}
                />

                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#888',
                  }}
                >
                  Opacity: {Math.round(selectedLayer.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedLayer.opacity}
                  onChange={(e) =>
                    updateLayer(selectedLayerId, { opacity: parseFloat(e.target.value) })
                  }
                  style={{ width: '100%', marginBottom: '1rem' }}
                />

                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#888',
                  }}
                >
                  Blend Mode
                </label>
                <select
                  value={selectedLayer.blendMode}
                  onChange={(e) =>
                    updateLayer(selectedLayerId, { blendMode: e.target.value as BlendMode })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#222238',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    marginBottom: '1rem',
                  }}
                >
                  {blendModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
            );
          })()
        ) : (
          <p style={{ color: '#666', fontSize: '0.85rem' }}>
            Select a layer to edit its properties
          </p>
        )}

        {generatedCode && (
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#888' }}>
              Generated WGSL
            </h4>
            <pre
              style={{
                padding: '0.75rem',
                background: '#222238',
                borderRadius: '6px',
                fontSize: '0.65rem',
                overflow: 'auto',
                maxHeight: '200px',
              }}
            >
              {generatedCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
