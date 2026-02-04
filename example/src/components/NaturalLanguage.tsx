import { useState } from 'react';

const EXAMPLES = [
  { text: 'Make it warm and soft like golden hour', icon: '🌅' },
  { text: 'Add vintage film grain effect', icon: '📼' },
  { text: 'Create dramatic high contrast look', icon: '🎬' },
  { text: 'Make it dreamy and ethereal', icon: '☁️' },
  { text: 'Add cyberpunk neon glow', icon: '🌃' },
  { text: 'Create underwater effect', icon: '🌊' },
];

const MOCK_RESPONSES: Record<string, string[]> = {
  warm: ['Color Temperature +25', 'Saturation +15%', 'Highlights -10%'],
  vintage: ['Contrast -15%', 'Grain 25%', 'Vignette 20%', 'Fade 10%'],
  dramatic: ['Contrast +30%', 'Shadows -20%', 'Clarity +25%'],
  dreamy: ['Blur 2px', 'Brightness +10%', 'Saturation -10%', 'Glow 15%'],
  cyberpunk: ['Chromatic Aberration 3px', 'Scanlines 5%', 'Color Balance: Cyan/Magenta'],
  underwater: ['Color Tint: Blue', 'Caustics 20%', 'Blur 1px'],
};

function parseInput(text: string): string[] {
  const lower = text.toLowerCase();
  if (lower.includes('warm') || lower.includes('golden')) return MOCK_RESPONSES.warm;
  if (lower.includes('vintage') || lower.includes('film')) return MOCK_RESPONSES.vintage;
  if (lower.includes('dramatic') || lower.includes('contrast')) return MOCK_RESPONSES.dramatic;
  if (lower.includes('dream') || lower.includes('ethereal')) return MOCK_RESPONSES.dreamy;
  if (lower.includes('cyber') || lower.includes('neon')) return MOCK_RESPONSES.cyberpunk;
  if (lower.includes('underwater') || lower.includes('water')) return MOCK_RESPONSES.underwater;
  return ['Brightness +10%', 'Contrast +5%', 'Saturation +5%'];
}

export function NaturalLanguage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const process = (text: string) => {
    setInput(text);
    setIsProcessing(true);
    setTimeout(() => {
      setResult(parseInput(text));
      setIsProcessing(false);
    }, 300);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div>
        <label
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}
        >
          Describe the effect you want:
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Make it warm and vintage with a film grain look"
          style={{
            width: '100%',
            height: '100px',
            padding: '1rem',
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '6px',
            fontFamily: 'inherit',
            marginBottom: '1rem',
            resize: 'vertical',
            fontSize: '0.9rem',
          }}
        />

        <button
          onClick={() => process(input)}
          disabled={!input.trim() || isProcessing}
          style={{
            padding: '0.75rem 1.5rem',
            background: input.trim() ? '#4a9eff' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            marginBottom: '1.5rem',
            opacity: isProcessing ? 0.7 : 1,
          }}
        >
          {isProcessing ? 'Generating...' : 'Generate Layers'}
        </button>

        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#888' }}>
          Try these examples:
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {EXAMPLES.map((example) => (
            <button
              key={example.text}
              onClick={() => process(example.text)}
              style={{
                padding: '0.6rem 0.75rem',
                background: '#2a2a3e',
                color: '#ccc',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>{example.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {example.text.length > 25 ? example.text.slice(0, 25) + '...' : example.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>Generated Layers</h3>
        {!result ? (
          <div
            style={{
              padding: '2rem',
              background: '#1a1a2e',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            Describe an effect to generate layers
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.map((layer, i) => (
              <div
                key={i}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#2a2a3e',
                  borderRadius: '6px',
                  borderLeft: '3px solid #4a9eff',
                  fontSize: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{layer}</span>
                <span style={{ color: '#4a9eff', fontSize: '0.8rem' }}>✓</span>
              </div>
            ))}
            <button
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#4a9eff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Apply All Layers
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
