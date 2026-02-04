import { useState } from 'react';

interface Layer {
  id: string;
  name: string;
  effect: string;
  opacity: number;
  visible: boolean;
}

const EFFECTS = [
  { name: 'Blur', icon: '🌫️' },
  { name: 'Glow', icon: '✨' },
  { name: 'Color', icon: '🎨' },
  { name: 'Noise', icon: '📺' },
  { name: 'Distortion', icon: '〰️' },
  { name: 'Vignette', icon: '⚫' },
];

export function LayerEditor() {
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Base Effect', effect: 'Blur', opacity: 100, visible: true },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('1');

  const addLayer = () => {
    const newLayer: Layer = {
      id: String(Date.now()),
      name: `Layer ${layers.length + 1}`,
      effect: EFFECTS[layers.length % EFFECTS.length].name,
      opacity: 100,
      visible: true,
    };
    setLayers([...layers, newLayer]);
    setSelectedId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(layers[0]?.id ?? null);
  };

  const toggleVisibility = (id: string) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  const updateOpacity = (id: string, opacity: number) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, opacity } : l)));
  };

  const selectedLayer = layers.find((l) => l.id === selectedId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
      <div
        style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)',
          borderRadius: '8px',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</div>
          <div>Preview Area</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            {layers.filter((l) => l.visible).length} active layers
          </div>
        </div>
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Layers ({layers.length})</h3>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '1rem',
            maxHeight: '250px',
            overflowY: 'auto',
          }}
        >
          {layers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => setSelectedId(layer.id)}
              style={{
                padding: '0.75rem',
                background: selectedId === layer.id ? '#2a3a5e' : '#2a2a3e',
                border: selectedId === layer.id ? '1px solid #4a9eff' : '1px solid #333',
                borderRadius: '6px',
                cursor: 'pointer',
                opacity: layer.visible ? 1 : 0.5,
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{EFFECTS.find((e) => e.name === layer.effect)?.icon}</span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{layer.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(layer.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '0.25rem',
                    }}
                  >
                    {layer.visible ? '👁️' : '👁️‍🗨️'}
                  </button>
                  {layers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLayer(layer.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        color: '#f66',
                        padding: '0.25rem',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                {layer.effect} • {layer.opacity}%
              </div>
            </div>
          ))}
        </div>

        {selectedLayer && (
          <div
            style={{
              padding: '0.75rem',
              background: '#1a1a2e',
              borderRadius: '6px',
              marginBottom: '1rem',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                color: '#888',
                marginBottom: '0.5rem',
              }}
            >
              Opacity: {selectedLayer.opacity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedLayer.opacity}
              onChange={(e) => updateOpacity(selectedLayer.id, Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        )}

        <button
          onClick={addLayer}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#4a9eff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          + Add Layer
        </button>
      </div>
    </div>
  );
}
