import { useState, useCallback, useRef } from 'react';
import {
  ImageAnalyzer,
  ShaderSynthesizer,
  type StyleAnalysis,
  type SynthesizedLayers,
} from '@shader3d/learn-from-examples';

const sampleImages = [
  {
    name: 'Sunset',
    url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400',
    category: 'warm',
  },
  {
    name: 'Neon City',
    url: 'https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=400',
    category: 'neon',
  },
  {
    name: 'Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
    category: 'nature',
  },
  {
    name: 'Vintage',
    url: 'https://images.unsplash.com/photo-1501556466850-7c9fa1fccb4c?w=400',
    category: 'retro',
  },
  {
    name: 'Ocean',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400',
    category: 'cool',
  },
  {
    name: 'Abstract',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400',
    category: 'abstract',
  },
];

export function LearnFromExamples() {
  const [analyzer] = useState(() => new ImageAnalyzer());
  const [synthesizer] = useState(() => new ShaderSynthesizer());

  const [imageUrl, setImageUrl] = useState<string>('');
  const [analysis, setAnalysis] = useState<StyleAnalysis | null>(null);
  const [synthesizedStyle, setSynthesizedStyle] = useState<SynthesizedLayers | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = useCallback(
    async (url: string) => {
      setIsAnalyzing(true);
      setError('');
      setImageUrl(url);

      try {
        // Load image as ImageData
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Analyze the image
        const result = await analyzer.analyze(imageData);
        setAnalysis(result);

        // Synthesize a style from the analysis
        const style = synthesizer.synthesize(result);
        setSynthesizedStyle(style);

        // Generate shader code - synthesizer doesn't have compile method, use placeholder
        const code = `// Synthesized ${style.layers.length} layers with ${(style.matchScore * 100).toFixed(0)}% match\n// Layers: ${style.layers.map((l) => l.effect).join(', ')}`;
        setGeneratedCode(code);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze image');
      }

      setIsAnalyzing(false);
    },
    [analyzer, synthesizer]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        analyzeImage(url);
      }
    },
    [analyzeImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        analyzeImage(url);
      }
    },
    [analyzeImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
  }, [generatedCode]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
      {/* Image Upload & Samples */}
      <div>
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            border: '2px dashed #333',
            cursor: 'pointer',
            marginBottom: '1rem',
            transition: 'border-color 0.2s',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {imageUrl ? (
            <div style={{ position: 'relative' }}>
              <img
                src={imageUrl}
                alt="Uploaded"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                }}
              />
              {isAnalyzing && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🔍 Analyzing...</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#666' }}>
              <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📷</p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 500 }}>
                Drop an image here or click to upload
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                We'll analyze it and create a matching shader effect
              </p>
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              background: '#ff4444',
              color: 'white',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Sample Images */}
        <div>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#888' }}>
            Or try a sample image:
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
            }}
          >
            {sampleImages.map((sample) => (
              <button
                key={sample.name}
                onClick={() => analyzeImage(sample.url)}
                disabled={isAnalyzing}
                style={{
                  background: '#1a1a2e',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: isAnalyzing ? 'wait' : 'pointer',
                  opacity: isAnalyzing ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '80px',
                    borderRadius: '6px',
                    background:
                      sample.category === 'warm'
                        ? 'linear-gradient(135deg, #ff8c00, #ff4500)'
                        : sample.category === 'neon'
                          ? 'linear-gradient(135deg, #00ffff, #ff00ff)'
                          : sample.category === 'nature'
                            ? 'linear-gradient(135deg, #228b22, #006400)'
                            : sample.category === 'retro'
                              ? 'linear-gradient(135deg, #d4a574, #8b7355)'
                              : sample.category === 'cool'
                                ? 'linear-gradient(135deg, #1e90ff, #00bfff)'
                                : 'linear-gradient(135deg, #9400d3, #ff1493)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  {sample.category === 'warm'
                    ? '🌅'
                    : sample.category === 'neon'
                      ? '🌃'
                      : sample.category === 'nature'
                        ? '🌲'
                        : sample.category === 'retro'
                          ? '📼'
                          : sample.category === 'cool'
                            ? '🌊'
                            : '🎨'}
                </div>
                <span
                  style={{
                    display: 'block',
                    marginTop: '0.5rem',
                    color: '#888',
                    fontSize: '0.75rem',
                  }}
                >
                  {sample.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div>
        {analysis && (
          <>
            {/* Color Palette */}
            <div
              style={{
                background: '#1a1a2e',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#888' }}>
                🎨 Extracted Colors
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {analysis.colorProfile.dominantColors.map(
                  (color: [number, number, number], i: number) => {
                    const hex = `#${Math.round(color[0] * 255)
                      .toString(16)
                      .padStart(2, '0')}${Math.round(color[1] * 255)
                      .toString(16)
                      .padStart(2, '0')}${Math.round(color[2] * 255)
                      .toString(16)
                      .padStart(2, '0')}`;
                    return (
                      <div
                        key={i}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: hex,
                          border: '2px solid #333',
                        }}
                        title={hex}
                      />
                    );
                  }
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ background: '#222238', padding: '0.5rem', borderRadius: '6px' }}>
                  <span style={{ color: '#888' }}>Brightness</span>
                  <div
                    style={{
                      height: '6px',
                      background: '#333',
                      borderRadius: '3px',
                      marginTop: '0.25rem',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${analysis.toneProfile.brightness * 100}%`,
                        height: '100%',
                        background: '#fbbf24',
                      }}
                    />
                  </div>
                </div>
                <div style={{ background: '#222238', padding: '0.5rem', borderRadius: '6px' }}>
                  <span style={{ color: '#888' }}>Saturation</span>
                  <div
                    style={{
                      height: '6px',
                      background: '#333',
                      borderRadius: '3px',
                      marginTop: '0.25rem',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${analysis.colorProfile.saturationLevel * 100}%`,
                        height: '100%',
                        background: '#f472b6',
                      }}
                    />
                  </div>
                </div>
                <div style={{ background: '#222238', padding: '0.5rem', borderRadius: '6px' }}>
                  <span style={{ color: '#888' }}>Contrast</span>
                  <div
                    style={{
                      height: '6px',
                      background: '#333',
                      borderRadius: '3px',
                      marginTop: '0.25rem',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${analysis.toneProfile.contrast * 100}%`,
                        height: '100%',
                        background: '#a78bfa',
                      }}
                    />
                  </div>
                </div>
                <div style={{ background: '#222238', padding: '0.5rem', borderRadius: '6px' }}>
                  <span style={{ color: '#888' }}>Temperature</span>
                  <div
                    style={{
                      height: '6px',
                      background: 'linear-gradient(90deg, #60a5fa, #fbbf24)',
                      borderRadius: '3px',
                      marginTop: '0.25rem',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: `${((analysis.colorProfile.colorTemperature + 1) / 2) * 100}%`,
                        top: '-2px',
                        width: '10px',
                        height: '10px',
                        background: '#fff',
                        borderRadius: '50%',
                        transform: 'translateX(-50%)',
                        border: '2px solid #333',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Detected Style */}
            <div
              style={{
                background: '#1a1a2e',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#888' }}>
                ✨ Detected Style
              </h3>

              <div style={{ marginBottom: '0.75rem' }}>
                <span
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: '#333',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                  }}
                >
                  {analysis.styleMarkers.length > 0
                    ? analysis.styleMarkers[0].type
                    : 'auto-detected'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {analysis.styleMarkers.slice(0, 6).map((marker, i: number) => (
                  <span
                    key={i}
                    style={{
                      padding: '0.2rem 0.5rem',
                      background: '#222238',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      color: '#888',
                    }}
                  >
                    {marker.type}
                  </span>
                ))}
              </div>
            </div>

            {/* Synthesized Effects */}
            {synthesizedStyle && (
              <div
                style={{
                  background: '#1a1a2e',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#888' }}>
                  🔮 Synthesized Effects
                </h3>

                {synthesizedStyle.layers.map((layer, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: '#222238',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{layer.effect}</span>
                      <span style={{ color: '#4a9eff', fontSize: '0.75rem' }}>
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>
                      {Object.entries(layer.params).map(([key, val]) => (
                        <span key={key} style={{ marginRight: '0.75rem' }}>
                          {key}: {typeof val === 'number' ? val.toFixed(2) : String(val)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
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

        {!analysis && !isAnalyzing && (
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: '#666',
            }}
          >
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>🔮</p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Upload an image to analyze its style and generate a matching shader
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
