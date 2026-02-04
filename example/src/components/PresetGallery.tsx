import { useState } from 'react';

const CATEGORIES = ['All', 'Photography', 'Video', 'Gaming', 'Artistic', 'Social'];

const PRESETS = [
  // Photography
  { name: 'Golden Hour', category: 'Photography', icon: '🌅' },
  { name: 'Vintage Film', category: 'Photography', icon: '📷' },
  { name: 'HDR Pro', category: 'Photography', icon: '✨' },
  { name: 'Black & White', category: 'Photography', icon: '⬛' },
  { name: 'Portrait Pro', category: 'Photography', icon: '👤' },
  { name: 'Cinematic', category: 'Photography', icon: '🎬' },
  { name: 'Polaroid', category: 'Photography', icon: '🖼️' },
  { name: 'Matte', category: 'Photography', icon: '🌫️' },
  { name: 'Teal & Orange', category: 'Photography', icon: '🎨' },
  { name: 'Clarity', category: 'Photography', icon: '💎' },
  // Video
  { name: 'Motion Blur', category: 'Video', icon: '💨' },
  { name: 'VHS', category: 'Video', icon: '📼' },
  { name: 'Lens Flare', category: 'Video', icon: '☀️' },
  { name: 'Speed Lines', category: 'Video', icon: '⚡' },
  { name: 'Film Grain', category: 'Video', icon: '🎞️' },
  { name: 'Light Leak', category: 'Video', icon: '💡' },
  { name: 'Bokeh', category: 'Video', icon: '🔵' },
  { name: 'Slow Mo', category: 'Video', icon: '🐢' },
  { name: 'Chromatic', category: 'Video', icon: '🌈' },
  { name: 'Film Burn', category: 'Video', icon: '🔥' },
  // Gaming
  { name: 'Sci-Fi Neon', category: 'Gaming', icon: '🌈' },
  { name: 'CRT', category: 'Gaming', icon: '📺' },
  { name: 'Glitch', category: 'Gaming', icon: '📟' },
  { name: 'Retro', category: 'Gaming', icon: '👾' },
  { name: 'Cyberpunk', category: 'Gaming', icon: '🤖' },
  { name: '8-bit Pixel', category: 'Gaming', icon: '🎮' },
  { name: 'Synthwave', category: 'Gaming', icon: '🌆' },
  { name: 'Vaporwave', category: 'Gaming', icon: '🌴' },
  { name: 'Fantasy', category: 'Gaming', icon: '🧙' },
  { name: 'Holographic', category: 'Gaming', icon: '💿' },
  // Artistic
  { name: 'Watercolor', category: 'Artistic', icon: '🎨' },
  { name: 'Oil Paint', category: 'Artistic', icon: '🖌️' },
  { name: 'Sketch', category: 'Artistic', icon: '✏️' },
  { name: 'Impressionist', category: 'Artistic', icon: '🌻' },
  { name: 'Pop Art', category: 'Artistic', icon: '🎭' },
  { name: 'Stipple', category: 'Artistic', icon: '⚫' },
  { name: 'Halftone', category: 'Artistic', icon: '🔘' },
  { name: 'Line Art', category: 'Artistic', icon: '📝' },
  { name: 'Mosaic', category: 'Artistic', icon: '🪟' },
  { name: 'Stained Glass', category: 'Artistic', icon: '🏰' },
  // Social
  { name: 'Instagram', category: 'Social', icon: '📱' },
  { name: 'TikTok', category: 'Social', icon: '🎵' },
  { name: 'Warm Glow', category: 'Social', icon: '🔆' },
  { name: 'Cool Tone', category: 'Social', icon: '❄️' },
  { name: 'Dreamy', category: 'Social', icon: '☁️' },
  { name: 'Moody', category: 'Social', icon: '🌙' },
  { name: 'Bright', category: 'Social', icon: '☀️' },
  { name: 'Contrast', category: 'Social', icon: '🎚️' },
  { name: 'Fade', category: 'Social', icon: '🌫️' },
  { name: 'Vibrant', category: 'Social', icon: '🌈' },
];

export function PresetGallery() {
  const [selected, setSelected] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = PRESETS.filter((p) => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search presets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.9rem',
            }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '0.5rem 1rem',
                  background: category === cat ? '#4a9eff' : '#2a2a3e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
          }}
        >
          {filtered.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setSelected(preset.name)}
              style={{
                padding: '1.5rem',
                background: selected === preset.name ? '#2a3a5e' : '#2a2a3e',
                border: selected === preset.name ? '2px solid #4a9eff' : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                color: '#fff',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{preset.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{preset.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                {preset.category}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 1rem 0' }}>Details</h3>
        {!selected ? (
          <div
            style={{
              padding: '2rem',
              background: '#1a1a2e',
              borderRadius: '4px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            Select a preset
          </div>
        ) : (
          <div style={{ padding: '1.5rem', background: '#1a1a2e', borderRadius: '4px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
              {PRESETS.find((p) => p.name === selected)?.icon}
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{selected}</h4>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
              Professional effect preset for creating stunning visuals
            </p>
            <button
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#4a9eff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Apply Preset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
