import { useState, useMemo } from 'react';
import { LayerComposition, createLayer } from '@shader3d/layers';
import type { BlendMode, EffectLayer } from '@shader3d/layers';

// Available blend modes
const BLEND_MODES: BlendMode[] = [
  'normal',
  'add',
  'multiply',
  'screen',
  'overlay',
  'softLight',
  'hardLight',
  'colorDodge',
  'colorBurn',
  'darken',
  'lighten',
  'difference',
  'exclusion',
];

// Effect definitions that match actual layer-types
const AVAILABLE_EFFECTS: {
  layerType: EffectLayer['type'];
  effect: string;
  name: string;
  icon: string;
}[] = [
  { layerType: 'blur', effect: 'gaussian', name: 'Gaussian Blur', icon: '🌫️' },
  { layerType: 'blur', effect: 'motion', name: 'Motion Blur', icon: '💨' },
  { layerType: 'glow', effect: 'bloom', name: 'Bloom', icon: '✨' },
  { layerType: 'glow', effect: 'neon', name: 'Neon Glow', icon: '🌈' },
  { layerType: 'color', effect: 'brightnessContrast', name: 'Brightness/Contrast', icon: '☀️' },
  { layerType: 'color', effect: 'hueSaturation', name: 'Hue/Saturation', icon: '🎨' },
  { layerType: 'stylize', effect: 'vignette', name: 'Vignette', icon: '⭕' },
  { layerType: 'stylize', effect: 'sharpen', name: 'Sharpen', icon: '🔪' },
  { layerType: 'noise', effect: 'grain', name: 'Film Grain', icon: '📷' },
  { layerType: 'distortion', effect: 'wave', name: 'Wave', icon: '🌊' },
];

interface LayerState {
  id: string;
  name: string;
  layerType: EffectLayer['type'];
  effect: string;
  opacity: number;
  blendMode: BlendMode;
  visible: boolean;
}

export function LayerEditor() {
  const [layers, setLayers] = useState<LayerState[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [compiledOutput, setCompiledOutput] = useState<string | null>(null);

  // Create a LayerComposition instance
  const composition = useMemo(() => {
    const comp = new LayerComposition(800, 600, 'My Effect Stack');
    layers.forEach((layer) => {
      try {
        const effectLayer = createLayer(layer.layerType, layer.effect);
        effectLayer.opacity = layer.opacity;
        effectLayer.blendMode = layer.blendMode;
        effectLayer.visible = layer.visible;
        comp.addLayer(effectLayer);
      } catch (err) {
        console.warn('Failed to create layer:', err);
      }
    });
    return comp;
  }, [layers]);

  const addLayer = (layerType: EffectLayer['type'], effect: string) => {
    const effectInfo = AVAILABLE_EFFECTS.find(
      (e) => e.layerType === layerType && e.effect === effect
    );
    const newLayer: LayerState = {
      id: crypto.randomUUID(),
      name: effectInfo?.name ?? effect,
      layerType,
      effect,
      opacity: 1,
      blendMode: 'normal',
      visible: true,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const removeLayer = (layerId: string) => {
    setLayers(layers.filter((l) => l.id !== layerId));
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  };

  const updateLayer = (layerId: string, updates: Partial<LayerState>) => {
    setLayers(layers.map((l) => (l.id === layerId ? { ...l, ...updates } : l)));
  };

  const moveLayer = (layerId: string, direction: 'up' | 'down') => {
    const index = layers.findIndex((l) => l.id === layerId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= layers.length) return;

    const newLayers = [...layers];
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    setLayers(newLayers);
  };

  const compileStack = () => {
    try {
      const compiled = composition.compile();
      setCompiledOutput(compiled.wgsl);
    } catch (err) {
      setCompiledOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 300px', gap: '1.5rem' }}>
      {/* Left Panel - Effect Palette */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>Add Effects</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {AVAILABLE_EFFECTS.map((effect) => (
            <button
              key={`${effect.layerType}-${effect.effect}`}
              onClick={() => addLayer(effect.layerType, effect.effect)}
              style={{
                padding: '0.75rem',
                background: '#2a2a3e',
                color: '#ccc',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>{effect.icon}</span>
              <span>{effect.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Center Panel - Layer Stack */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontWeight: 500 }}>Layer Stack</h3>
          <button
            onClick={compileStack}
            disabled={layers.length === 0}
            style={{
              padding: '0.5rem 1rem',
              background: layers.length > 0 ? '#4a9eff' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: layers.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            🔧 Compile Stack
          </button>
        </div>

        {layers.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              background: '#1a1a2e',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            No layers yet. Add effects from the left panel.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {layers.map((layer, index) => (
              <div
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                style={{
                  padding: '0.75rem',
                  background: selectedLayerId === layer.id ? '#2a3a5e' : '#1a1a2e',
                  border: selectedLayerId === layer.id ? '1px solid #4a9eff' : '1px solid #333',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  opacity: layer.visible ? 1 : 0.5,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateLayer(layer.id, { visible: !layer.visible });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  {layer.visible ? '👁️' : '👁️‍🗨️'}
                </button>

                <span style={{ flex: 1 }}>{layer.name}</span>

                <span style={{ color: '#888', fontSize: '0.8rem' }}>
                  {Math.round(layer.opacity * 100)}%
                </span>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(layer.id, 'up');
                    }}
                    disabled={index === 0}
                    style={{
                      background: '#333',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      opacity: index === 0 ? 0.5 : 1,
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(layer.id, 'down');
                    }}
                    disabled={index === layers.length - 1}
                    style={{
                      background: '#333',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: index === layers.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: index === layers.length - 1 ? 0.5 : 1,
                    }}
                  >
                    ↓
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(layer.id);
                    }}
                    style={{
                      background: '#4a2a2a',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      color: '#f88',
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {compiledOutput && (
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Compiled Shader:</h4>
            <pre
              style={{
                padding: '1rem',
                background: '#1a1a2e',
                borderRadius: '8px',
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: '200px',
                margin: 0,
              }}
            >
              {compiledOutput}
            </pre>
          </div>
        )}
      </div>

      {/* Right Panel - Layer Properties */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>Properties</h3>

        {!selectedLayer ? (
          <div
            style={{
              padding: '2rem',
              background: '#1a1a2e',
              borderRadius: '8px',
              color: '#666',
              textAlign: 'center',
            }}
          >
            Select a layer to edit its properties
          </div>
        ) : (
          <div
            style={{
              padding: '1rem',
              background: '#1a1a2e',
              borderRadius: '8px',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>
                Layer Name
              </label>
              <input
                type="text"
                value={selectedLayer.name}
                onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#2a2a3e',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>
                Opacity: {Math.round(selectedLayer.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedLayer.opacity * 100}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { opacity: parseInt(e.target.value) / 100 })
                }
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>
                Blend Mode
              </label>
              <select
                value={selectedLayer.blendMode}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { blendMode: e.target.value as BlendMode })
                }
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#2a2a3e',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              >
                {BLEND_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1).replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
