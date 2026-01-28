import { useState, useRef, useCallback } from 'react';
import {
  ImageAnalyzer,
  ShaderSynthesizer,
  type StyleAnalysis,
} from '@shader3d/learn-from-examples';

// Sample image URLs for demonstration
const SAMPLE_IMAGES = [
  {
    name: 'Golden Hour',
    url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400',
    description: 'Warm sunset lighting',
  },
  {
    name: 'Moody Portrait',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    description: 'Dramatic portrait lighting',
  },
  {
    name: 'Vintage Film',
    url: 'https://images.unsplash.com/photo-1518173946687-a4c036bc3c95?w=400',
    description: 'Film-like color grading',
  },
  {
    name: 'High Contrast',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
    description: 'Dramatic mountain scene',
  },
];

export function LearnFromExamples() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<StyleAnalysis | null>(null);
  const [generatedLayers, setGeneratedLayers] = useState<unknown[] | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize analyzer and synthesizer
  const analyzerRef = useRef<ImageAnalyzer | null>(null);
  const synthesizerRef = useRef<ShaderSynthesizer | null>(null);

  if (!analyzerRef.current) {
    analyzerRef.current = new ImageAnalyzer();
  }
  if (!synthesizerRef.current) {
    synthesizerRef.current = new ShaderSynthesizer();
  }

  const analyzeImage = useCallback(async (imageUrl: string) => {
    setIsAnalyzing(true);
    setSelectedImage(imageUrl);
    setAnalysis(null);
    setGeneratedLayers(null);

    try {
      // Load image and create ImageData
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });

      // Create canvas to extract image data
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(img.width, 400); // Limit size for performance
      canvas.height = Math.min(img.height, 400);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Analyze the image
      const result = await analyzerRef.current!.analyze(imageData);
      if (isMounted.current) setAnalysis(result);

      // Synthesize layers from analysis
      const layers = synthesizerRef.current!.synthesize(result);
      setGeneratedLayers(layers.layers);
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      analyzeImage(url);
    },
    [analyzeImage]
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Left Panel - Image Selection */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Upload your own image:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#2a2a3e',
                color: '#aaa',
                border: '1px dashed #444',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              📁 Choose File
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Or enter image URL:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <button
              onClick={() => customImageUrl && analyzeImage(customImageUrl)}
              disabled={!customImageUrl}
              style={{
                padding: '0.75rem 1rem',
                background: customImageUrl ? '#4a9eff' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: customImageUrl ? 'pointer' : 'not-allowed',
              }}
            >
              Analyze
            </button>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.75rem 0', color: '#888', fontWeight: 500 }}>
            Or try these samples:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {SAMPLE_IMAGES.map((sample) => (
              <div
                key={sample.name}
                onClick={() => analyzeImage(sample.url)}
                style={{
                  padding: '0.75rem',
                  background: selectedImage === sample.url ? '#2a3a5e' : '#1a1a2e',
                  border: selectedImage === sample.url ? '2px solid #4a9eff' : '2px solid #333',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    height: '60px',
                    background: '#2a2a3e',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  🖼️
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{sample.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>{sample.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Analysis Results */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>Style Analysis</h3>

        {isAnalyzing && (
          <div
            style={{
              padding: '3rem',
              background: '#1a1a2e',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#888',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
            Analyzing image...
          </div>
        )}

        {!isAnalyzing && !analysis && (
          <div
            style={{
              padding: '3rem',
              background: '#1a1a2e',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            Select an image to analyze its visual style
          </div>
        )}

        {analysis && (
          <>
            {/* Color Profile */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
                Color Profile
              </h4>
              <div
                style={{
                  padding: '1rem',
                  background: '#1a1a2e',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#888' }}>Dominant Colors:</span>
                  {analysis.colorProfile.dominantColors.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: '24px',
                        height: '24px',
                        background: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                        borderRadius: '4px',
                        border: '1px solid #444',
                      }}
                      title={`RGB(${color.join(', ')})`}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                  Brightness: {(analysis.colorProfile.brightness * 100).toFixed(0)}% • Saturation:{' '}
                  {(analysis.colorProfile.saturation * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Tone Profile */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
                Tone Profile
              </h4>
              <div
                style={{
                  padding: '1rem',
                  background: '#1a1a2e',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <div style={{ color: '#888', fontSize: '0.75rem' }}>Shadows</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                      {(analysis.toneProfile.dark * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#888', fontSize: '0.75rem' }}>Midtones</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                      {(analysis.toneProfile.mid * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#888', fontSize: '0.75rem' }}>Highlights</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                      {(analysis.toneProfile.light * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#aaa' }}>
                  Contrast: {(analysis.toneProfile.contrast * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Generated Layers */}
            {generatedLayers && generatedLayers.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
                  Generated Effect Layers ({generatedLayers.length})
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
          </>
        )}
      </div>
    </div>
  );
}
