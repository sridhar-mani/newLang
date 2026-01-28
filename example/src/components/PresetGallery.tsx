import { useState, useMemo } from 'react';
import { PresetManager, type Preset, type PresetCategory } from '@shader3d/presets';

const CATEGORY_INFO: Record<PresetCategory, { icon: string; label: string }> = {
  photography: { icon: '📷', label: 'Photography' },
  video: { icon: '🎬', label: 'Video' },
  gaming: { icon: '🎮', label: 'Gaming' },
  motion: { icon: '🎞️', label: 'Motion Graphics' },
  artistic: { icon: '🎨', label: 'Artistic' },
  color: { icon: '🎨', label: 'Color Grading' },
  vintage: { icon: '📼', label: 'Vintage' },
  modern: { icon: '✨', label: 'Modern' },
};

export function PresetGallery() {
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory | 'all'>('all');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedPreset, setAppliedPreset] = useState<Preset | null>(null);

  // Initialize preset manager
  const presetManager = useMemo(() => new PresetManager(), []);

  // Get filtered presets
  const filteredPresets = useMemo(() => {
    let presets = presetManager.getAllPresets();

    if (selectedCategory !== 'all') {
      presets = presetManager.getPresetsByCategory(selectedCategory);
    }

    if (searchQuery.trim()) {
      presets = presetManager.searchPresets(searchQuery);
      if (selectedCategory !== 'all') {
        presets = presets.filter((p) => p.category === selectedCategory);
      }
    }

    return presets;
  }, [presetManager, selectedCategory, searchQuery]);

  const applyPreset = async (preset: Preset) => {
    try {
      // In a real app, this would apply to an image
      const layers = await presetManager.applyPreset(preset.id);
      console.log('Applied preset with layers:', layers);
      setAppliedPreset(preset);
    } catch (err) {
      console.error('Failed to apply preset:', err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
      {/* Left Panel - Preset Grid */}
      <div>
        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.9rem',
            }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '0.5rem 1rem',
              background: selectedCategory === 'all' ? '#4a9eff' : '#2a2a3e',
              color: selectedCategory === 'all' ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            All
          </button>
          {(Object.keys(CATEGORY_INFO) as PresetCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '0.5rem 1rem',
                background: selectedCategory === category ? '#4a9eff' : '#2a2a3e',
                color: selectedCategory === category ? '#fff' : '#aaa',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {CATEGORY_INFO[category].icon} {CATEGORY_INFO[category].label}
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
              onClick={() => setSelectedPreset(preset)}
              style={{
                padding: '1rem',
                background: selectedPreset?.id === preset.id ? '#2a3a5e' : '#1a1a2e',
                border: selectedPreset?.id === preset.id ? '2px solid #4a9eff' : '2px solid #333',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {/* Thumbnail placeholder with icon */}
              <div
                style={{
                  height: '80px',
                  background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                }}
              >
                {preset.icon ?? CATEGORY_INFO[preset.category]?.icon ?? '✨'}
              </div>

              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>{preset.name}</h4>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  color: '#888',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {preset.description}
              </p>

              {/* Tags */}
              {preset.tags && preset.tags.length > 0 && (
                <div
                  style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}
                >
                  {preset.tags.slice(0, 3).map((tag) => (
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
            No presets found matching your criteria
          </div>
        )}
      </div>

      {/* Right Panel - Preset Details */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>Preset Details</h3>

        {!selectedPreset ? (
          <div
            style={{
              padding: '3rem',
              background: '#1a1a2e',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            Select a preset to view details
          </div>
        ) : (
          <div
            style={{
              padding: '1.5rem',
              background: '#1a1a2e',
              borderRadius: '8px',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}
            >
              <span style={{ fontSize: '2.5rem' }}>
                {selectedPreset.icon ?? CATEGORY_INFO[selectedPreset.category]?.icon ?? '✨'}
              </span>
              <div>
                <h3 style={{ margin: 0 }}>{selectedPreset.name}</h3>
                <span style={{ color: '#888', fontSize: '0.85rem' }}>
                  {CATEGORY_INFO[selectedPreset.category]?.label}
                </span>
              </div>
            </div>

            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>{selectedPreset.description}</p>

            {/* Layer breakdown */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
                Effect Layers ({selectedPreset.layers.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedPreset.layers.map((layer, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: '#2a2a3e',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{layer.effect}</span>
                    <span style={{ color: '#888' }}>{Math.round(layer.opacity * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            {selectedPreset.variants && selectedPreset.variants.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
                  Variants
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selectedPreset.variants.map((variant) => (
                    <span
                      key={variant.name}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#333',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                      }}
                    >
                      {variant.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => applyPreset(selectedPreset)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#4a9eff',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              Apply Preset
            </button>

            {appliedPreset?.id === selectedPreset.id && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: '#1a4a1a',
                  color: '#8f8',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                ✓ Preset applied successfully!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
