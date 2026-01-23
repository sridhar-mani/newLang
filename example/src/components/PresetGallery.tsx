import { useState, useCallback, useEffect } from 'react';
import { PresetManager, ALL_PRESETS, type Preset, type PresetCategory } from '@shader3d/presets';

const categoryInfo: Record<PresetCategory, { icon: string; description: string }> = {
  photography: { icon: '📷', description: 'Professional photography looks' },
  video: { icon: '🎬', description: 'Film and video color grading' },
  gaming: { icon: '🎮', description: 'Game-inspired visual effects' },
  motion: { icon: '💨', description: 'Motion and transition effects' },
  artistic: { icon: '🎨', description: 'Artistic and stylized looks' },
  color: { icon: '🌈', description: 'Color adjustments and corrections' },
  vintage: { icon: '📼', description: 'Retro and vintage aesthetics' },
  modern: { icon: '✨', description: 'Contemporary and clean styles' },
};

export function PresetGallery() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory | 'all'>('all');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [adaptedSettings, setAdaptedSettings] = useState<Record<string, number>>({});
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [presetManager] = useState(() => new PresetManager());

  // Context sliders for smart adaptation
  const [context, setContext] = useState({
    brightness: 0.5,
    contrast: 0.5,
    colorTemperature: 0.5,
    saturation: 0.5,
  });

  useEffect(() => {
    setPresets(ALL_PRESETS);
  }, []);

  const filteredPresets =
    selectedCategory === 'all' ? presets : presets.filter((p) => p.category === selectedCategory);

  const handlePresetSelect = useCallback(
    async (preset: Preset) => {
      setSelectedPreset(preset);

      // Apply preset (gets adapted layers)
      const layers = await presetManager.applyPreset(preset.id, undefined, { adapt: true });

      // Store adapted layers params
      const params: Record<string, number> = {};
      layers.forEach((layer, i) => {
        Object.entries(layer.params).forEach(([key, val]) => {
          if (typeof val === 'number') {
            params[`layer${i}_${key}`] = val;
          }
        });
      });
      setAdaptedSettings(params);

      // Generate the shader code (placeholder)
      const code = `// Preset: ${preset.name}\n${layers.map((l) => `// - ${l.effect} (${l.type})`).join('\n')}`;
      setGeneratedCode(code);
    },
    [context, presetManager]
  );

  const handleContextChange = useCallback(
    async (key: keyof typeof context, value: number) => {
      setContext((prev) => ({ ...prev, [key]: value }));

      // Re-adapt current preset if one is selected
      if (selectedPreset) {
        const layers = await presetManager.applyPreset(selectedPreset.id, undefined, {
          adapt: true,
        });
        const params: Record<string, number> = {};
        layers.forEach((layer, i) => {
          Object.entries(layer.params).forEach(([key, val]) => {
            if (typeof val === 'number') {
              params[`layer${i}_${key}`] = val;
            }
          });
        });
        setAdaptedSettings(params);
        const code = `// Preset: ${selectedPreset.name}\n${layers.map((l) => `// - ${l.effect} (${l.type})`).join('\n')}`;
        setGeneratedCode(code);
      }
    },
    [context, selectedPreset, presetManager]
  );

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
  }, [generatedCode]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
      {/* Preset Gallery */}
      <div>
        {/* Category Filter */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '0.5rem 1rem',
              background: selectedCategory === 'all' ? '#4a9eff' : '#2a2a3e',
              color: selectedCategory === 'all' ? '#fff' : '#888',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            All Presets
          </button>
          {(Object.keys(categoryInfo) as PresetCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                background: selectedCategory === cat ? '#4a9eff' : '#2a2a3e',
                color: selectedCategory === cat ? '#fff' : '#888',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {categoryInfo[cat].icon} {cat}
            </button>
          ))}
        </div>

        {/* Preset Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              style={{
                background: selectedPreset?.id === preset.id ? '#2a2a4e' : '#1a1a2e',
                border:
                  selectedPreset?.id === preset.id ? '2px solid #4a9eff' : '2px solid transparent',
                borderRadius: '12px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {/* Preview thumbnail */}
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  background: preset.thumbnail
                    ? `url(${preset.thumbnail})`
                    : `linear-gradient(135deg, #4a9eff40, #ff6b6b40)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                }}
              >
                {!preset.thumbnail && categoryInfo[preset.category].icon}
              </div>

              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{preset.name}</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>{preset.description}</p>

              {preset.tags && preset.tags.length > 0 && (
                <div
                  style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}
                >
                  {preset.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        padding: '0.15rem 0.4rem',
                        background: '#333',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        color: '#888',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPresets.length === 0 && (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#666',
            }}
          >
            No presets in this category yet.
          </div>
        )}
      </div>

      {/* Right Panel - Context & Preview */}
      <div>
        {/* Smart Adaptation */}
        <div
          style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#888' }}>
            🧠 Smart Adaptation
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '1rem' }}>
            Adjust your image context and presets will automatically adapt their settings.
          </p>

          {Object.entries(context).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#888',
                  marginBottom: '0.25rem',
                }}
              >
                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
                <span>{Math.round(value * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) =>
                  handleContextChange(key as keyof typeof context, parseFloat(e.target.value))
                }
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>

        {/* Selected Preset Info */}
        {selectedPreset && (
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              {categoryInfo[selectedPreset.category].icon} {selectedPreset.name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
              {selectedPreset.description}
            </p>

            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#888' }}>
              Adapted Parameters
            </h4>
            <div
              style={{
                background: '#222238',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.75rem',
              }}
            >
              {Object.entries(adaptedSettings).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span style={{ color: '#888' }}>{key}</span>
                  <span style={{ color: '#4a9eff' }}>
                    {typeof value === 'number' ? value.toFixed(3) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Code */}
        {generatedCode && (
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>Generated Shader</h3>
              <button
                onClick={copyCode}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                📋 Copy
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '0.75rem',
                background: '#222238',
                borderRadius: '8px',
                fontSize: '0.7rem',
                overflow: 'auto',
                maxHeight: '200px',
              }}
            >
              {generatedCode}
            </pre>
          </div>
        )}

        {!selectedPreset && (
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: '#666',
            }}
          >
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>✨</p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Select a preset to see its generated shader code
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
