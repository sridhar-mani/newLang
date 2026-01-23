import { useState, useMemo } from 'react';
import { NLParser, LayerGenerator, type ParsedIntent } from '@shader3d/natural-language';

// Example prompts to try
const EXAMPLE_PROMPTS = [
  'Make it look like a warm sunset with soft glow',
  'Add a vintage film look with grain',
  'Create a dramatic noir effect with high contrast',
  'Make it dreamy with soft focus and light leaks',
  'Add a cyberpunk neon glow effect',
  'Apply a cold, desaturated winter mood',
];

export function NaturalLanguage() {
  const [inputText, setInputText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedIntent | null>(null);
  const [generatedLayers, setGeneratedLayers] = useState<unknown[] | null>(null);

  // Initialize parser and generator
  const parser = useMemo(() => new NLParser(), []);
  const generator = useMemo(() => new LayerGenerator(), []);

  const processInput = () => {
    if (!inputText.trim()) return;

    // Step 1: Parse natural language into structured intent
    const parsed = parser.parse(inputText);
    setParsedResult(parsed);

    // Step 2: Generate layer configuration from intent
    const layers = generator.generate(parsed);
    setGeneratedLayers(layers);
  };

  const tryExample = (prompt: string) => {
    setInputText(prompt);
    // Auto-process after setting
    setTimeout(() => {
      const parsed = parser.parse(prompt);
      setParsedResult(parsed);
      const layers = generator.generate(parsed);
      setGeneratedLayers(layers);
    }, 0);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Left Panel - Input */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Describe the effect you want:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., Make it look like a warm sunset with a soft glow..."
            style={{
              width: '100%',
              height: '120px',
              padding: '1rem',
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          onClick={processInput}
          disabled={!inputText.trim()}
          style={{
            padding: '0.75rem 2rem',
            background: inputText.trim() ? '#4a9eff' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            fontSize: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          🪄 Generate Effect
        </button>

        <div>
          <h4 style={{ margin: '0 0 0.75rem 0', color: '#888', fontWeight: 500 }}>
            Try these examples:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => tryExample(prompt)}
                style={{
                  padding: '0.75rem',
                  background: '#2a2a3e',
                  color: '#aaa',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                }}
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>Analysis Result</h3>

        {!parsedResult ? (
          <div
            style={{
              padding: '3rem',
              background: '#1a1a2e',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            Enter a description and click "Generate Effect"
          </div>
        ) : (
          <>
            {/* Confidence Indicator */}
            <div
              style={{
                padding: '1rem',
                background: parsedResult.confidence > 0.7 ? '#1a4a1a' : '#4a4a1a',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Confidence</span>
                <span style={{ fontWeight: 600 }}>
                  {Math.round(parsedResult.confidence * 100)}%
                </span>
              </div>
              <div
                style={{
                  height: '4px',
                  background: '#333',
                  borderRadius: '2px',
                  marginTop: '0.5rem',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${parsedResult.confidence * 100}%`,
                    height: '100%',
                    background: parsedResult.confidence > 0.7 ? '#4a9eff' : '#ffaa00',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>

            {/* Detected Effects */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
                Detected Effects ({parsedResult.effects.length})
              </h4>
              {parsedResult.effects.length === 0 ? (
                <p style={{ color: '#666', margin: 0 }}>No specific effects detected</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {parsedResult.effects.map((effect, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '0.75rem',
                        background: '#2a2a3e',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                        {effect.effectWord.word}
                      </div>
                      {effect.modifiers.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                          Modifiers: {effect.modifiers.map((m) => m.word).join(', ')}
                        </div>
                      )}
                      {effect.colors.length > 0 && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#888',
                            display: 'flex',
                            gap: '0.5rem',
                            marginTop: '0.25rem',
                          }}
                        >
                          Colors:
                          {effect.colors.map((c, i) => (
                            <span
                              key={i}
                              style={{
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                background: `rgb(${c.rgb[0] * 255}, ${c.rgb[1] * 255}, ${c.rgb[2] * 255})`,
                                borderRadius: '3px',
                                border: '1px solid #555',
                              }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Global Modifiers */}
            {parsedResult.globalModifiers.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
                  Global Modifiers
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {parsedResult.globalModifiers.map((mod, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#333',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                      }}
                    >
                      {mod.word} ({mod.effect}: {mod.value > 0 ? '+' : ''}
                      {Math.round(mod.value * 100)}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Layers */}
            {generatedLayers && generatedLayers.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
                  Generated Layers ({generatedLayers.length})
                </h4>
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
                  {JSON.stringify(generatedLayers, null, 2)}
                </pre>
              </div>
            )}

            {/* Suggestions */}
            {parsedResult.suggestions && parsedResult.suggestions.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
                  Suggestions
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#aaa' }}>
                  {parsedResult.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
