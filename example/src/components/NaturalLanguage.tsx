import { useState, useCallback } from 'react';
import {
  SessionManager,
  parseNaturalLanguage,
  LayerGenerator,
  type ParsedIntent,
  type Slider,
} from '@shader3d/natural-language';

const examplePrompts = [
  'Make it look warm and cozy with a soft glow',
  'Add a cinematic feel with film grain and vignette',
  'Retro VHS look with scan lines and color bleeding',
  'Dreamy and ethereal with bloom and desaturation',
  'Neon cyberpunk with high contrast and blue tint',
  'Vintage sepia tone with subtle noise',
  'Underwater effect with blue-green color shift',
  'Horror movie style with high contrast and red tint',
];

export function NaturalLanguage() {
  const [sessionManager] = useState(() => new SessionManager());
  const [generator] = useState(() => new LayerGenerator());
  const [input, setInput] = useState('');
  const [parsedEffect, setParsedEffect] = useState<ParsedIntent | null>(null);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [generatedCode, setGeneratedCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{
      role: 'user' | 'assistant';
      content: string;
      effect?: ParsedIntent;
    }>
  >([]);

  const processInput = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsProcessing(true);

      // Add user message to conversation
      setConversation((prev) => [...prev, { role: 'user', content: text }]);

      try {
        // Parse the natural language input
        const parsed = parseNaturalLanguage(text);
        setParsedEffect(parsed);

        // Generate layers and sliders
        const layers = generator.generate(parsed);
        const effectSliders = generator.generateSliders(layers);
        setSliders(effectSliders);

        // Initialize slider values
        const initialValues: Record<string, number> = {};
        effectSliders.forEach((slider: Slider) => {
          initialValues[slider.id] = slider.value;
        });
        setSliderValues(initialValues);

        // Generate initial shader code (placeholder)
        const code = `// Generated ${layers.length} layers\n${layers.map((l) => `// - ${l.effect} (${l.type})`).join('\n')}`;
        setGeneratedCode(code);

        // Add assistant response
        const response =
          `I'll create effects with ${parsed.effects.map((e) => e.effectWord.effectName).join(', ')}. ` +
          `Use the sliders below to fine-tune the result.`;
        setConversation((prev) => [
          ...prev,
          { role: 'assistant', content: response, effect: parsed },
        ]);
      } catch (err) {
        setConversation((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Sorry, I couldn't understand that. Try describing the visual effect you want, like "warm glow" or "vintage film look".`,
          },
        ]);
      }

      setInput('');
      setIsProcessing(false);
    },
    [sessionManager]
  );

  const handleSliderChange = useCallback(
    (sliderId: string, value: number) => {
      const newValues = { ...sliderValues, [sliderId]: value };
      setSliderValues(newValues);

      if (parsedEffect) {
        const layers = generator.generate(parsedEffect);
        const code = `// Updated layers with slider values\n${layers.map((l) => `// - ${l.effect} (${l.type})`).join('\n')}`;
        setGeneratedCode(code);
      }
    },
    [sliderValues, parsedEffect, generator]
  );

  const handleExampleClick = useCallback(
    (prompt: string) => {
      setInput(prompt);
      processInput(prompt);
    },
    [processInput]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      processInput(input);
    },
    [input, processInput]
  );

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
  }, [generatedCode]);

  const clearConversation = useCallback(() => {
    setConversation([]);
    setParsedEffect(null);
    setSliders([]);
    setSliderValues({});
    setGeneratedCode('');
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
      {/* Chat Interface */}
      <div>
        <div
          style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            minHeight: '400px',
            maxHeight: '500px',
            overflow: 'auto',
          }}
        >
          {conversation.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                color: '#666',
              }}
            >
              <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>💬</p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 500 }}>
                Describe your effect in plain English
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                Try: "warm sunset glow", "vintage film look", or "cyberpunk neon"
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      background: msg.role === 'user' ? '#4a9eff' : '#2a2a3e',
                      color: msg.role === 'user' ? '#fff' : '#ddd',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{msg.content}</p>

                    {msg.effect && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          padding: '0.5rem',
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                        }}
                      >
                        <strong>Detected effects:</strong>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.25rem',
                            flexWrap: 'wrap',
                            marginTop: '0.25rem',
                          }}
                        >
                          {msg.effect.effects.map((e, i: number) => (
                            <span
                              key={i}
                              style={{
                                padding: '0.2rem 0.5rem',
                                background: 'rgba(74, 158, 255, 0.3)',
                                borderRadius: '4px',
                              }}
                            >
                              {e.effectWord.effectName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the effect you want..."
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.9rem',
            }}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              background: isProcessing ? '#333' : '#4a9eff',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: isProcessing ? 'wait' : 'pointer',
              fontWeight: 500,
            }}
          >
            {isProcessing ? '...' : 'Create'}
          </button>
          {conversation.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              style={{
                padding: '0.75rem 1rem',
                background: '#333',
                border: 'none',
                borderRadius: '8px',
                color: '#888',
                cursor: 'pointer',
              }}
            >
              🗑️
            </button>
          )}
        </form>

        {/* Example Prompts */}
        <div>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: '#888' }}>
            Try these examples:
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(prompt)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#2a2a3e',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                "{prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls & Output */}
      <div>
        {/* Effect Sliders */}
        {sliders.length > 0 && (
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#888' }}>
              🎛️ Fine-tune Your Effect
            </h3>

            {sliders.map((slider) => (
              <div key={slider.id} style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: '#888',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span>{slider.label}</span>
                  <span style={{ color: '#4a9eff' }}>
                    {sliderValues[slider.id]?.toFixed(2) ?? slider.value.toFixed(2)}
                  </span>
                </label>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={sliderValues[slider.id] ?? slider.value}
                  onChange={(e) => handleSliderChange(slider.id, parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '0.7rem', color: '#666' }}>{slider.unit || ''}</div>
              </div>
            ))}
          </div>
        )}

        {/* Parsed Effect Details */}
        {parsedEffect && (
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#888' }}>
              Understood Intent
            </h3>

            <div style={{ marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#888',
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Confidence
              </span>
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#333',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                }}
              >
                {Math.round(parsedEffect.confidence * 100)}%
              </span>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#888',
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Detected Colors
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {parsedEffect.effects
                  .flatMap((e) => e.colors)
                  .map((color, i: number) => {
                    const hex = `#${Math.round(color.rgb[0] * 255)
                      .toString(16)
                      .padStart(2, '0')}${Math.round(color.rgb[1] * 255)
                      .toString(16)
                      .padStart(2, '0')}${Math.round(color.rgb[2] * 255)
                      .toString(16)
                      .padStart(2, '0')}`;
                    return (
                      <div
                        key={i}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          background: hex,
                          border: '1px solid #444',
                        }}
                        title={color.word}
                      />
                    );
                  })}
              </div>
            </div>

            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#888',
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Effects Count
              </span>
              <div
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#333',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                }}
              >
                {parsedEffect.effects.length} effect(s)
              </div>
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
                fontSize: '0.65rem',
                overflow: 'auto',
                maxHeight: '200px',
              }}
            >
              {generatedCode}
            </pre>
          </div>
        )}

        {!parsedEffect && !generatedCode && (
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: '#666',
            }}
          >
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>🎛️</p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Controls will appear here after you describe an effect
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
