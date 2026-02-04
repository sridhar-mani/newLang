import { useState } from 'react';

const SAMPLE_STYLES = [
  {
    name: 'Golden Hour',
    icon: '🌅',
    analysis: {
      colors: ['Warm', 'Golden', 'Soft'],
      effects: ['Brightness +15%', 'Saturation +5%', 'Vignette'],
    },
  },
  {
    name: 'Portrait',
    icon: '👤',
    analysis: {
      colors: ['Neutral', 'Skin tones', 'Sharp'],
      effects: ['Clarity +20%', 'Softness 0.5px', 'Eyes +10%'],
    },
  },
  {
    name: 'Vintage',
    icon: '📼',
    analysis: {
      colors: ['Faded', 'Sepia', 'Grain'],
      effects: ['Contrast -10%', 'Grain 20%', 'Vignette 30%'],
    },
  },
  {
    name: 'Landscape',
    icon: '⛰️',
    analysis: {
      colors: ['Vivid', 'Blue', 'Green'],
      effects: ['HDR +25%', 'Dehaze +15%', 'Vibrance +20%'],
    },
  },
  {
    name: 'Night',
    icon: '🌙',
    analysis: {
      colors: ['Dark', 'Neon', 'Contrast'],
      effects: ['Shadows +30%', 'Highlights -20%', 'Clarity +15%'],
    },
  },
  {
    name: 'Minimal',
    icon: '⬜',
    analysis: {
      colors: ['Clean', 'White', 'Subtle'],
      effects: ['Exposure +10%', 'Whites +20%', 'Fade 5%'],
    },
  },
];

export function LearnFromExamples() {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedStyle = SAMPLE_STYLES.find((s) => s.name === selected);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>Style Examples:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {SAMPLE_STYLES.map((style) => (
            <button
              key={style.name}
              onClick={() => setSelected(style.name)}
              style={{
                aspectRatio: '1',
                padding: '0.5rem',
                background: selected === style.name ? '#2a3a5e' : '#2a2a3e',
                border: selected === style.name ? '2px solid #4a9eff' : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{style.icon}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500 }}>{style.name}</div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            Or upload image:
          </label>
          <input
            type="file"
            accept="image/*"
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem',
              background: '#1a1a2e',
              color: '#fff',
              border: '1px dashed #333',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>Analysis</h3>
        {!selectedStyle ? (
          <div
            style={{
              padding: '2rem',
              background: '#1a1a2e',
              borderRadius: '4px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            Select a style to analyze
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#888' }}>
                Detected Colors:
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedStyle.analysis.colors.map((color) => (
                  <div
                    key={color}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#2a2a3e',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                    }}
                  >
                    {color}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#888' }}>
                Suggested Effects:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedStyle.analysis.effects.map((effect, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.75rem',
                      background: '#2a2a3e',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      borderLeft: '2px solid #4a9eff',
                    }}
                  >
                    {effect}
                  </div>
                ))}
              </div>
            </div>

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
              Apply Effects
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
