import { useRef, useState, useCallback, useEffect } from 'react';
import {
  PaintCanvas,
  GestureRecognizer,
  EffectGenerator,
  type Gesture,
  type GestureType,
  type PaintEffect,
} from '@shader3d/paint-effects';

interface GestureInfo {
  type: GestureType;
  name: string;
  description: string;
  icon: string;
}

const gestureGuide: GestureInfo[] = [
  { type: 'circle', name: 'Circle', description: 'Draw a circle for radial effects', icon: '⭕' },
  { type: 'line', name: 'Line', description: 'Straight line for directional blur', icon: '📏' },
  { type: 'spiral', name: 'Spiral', description: 'Spiral for swirl/twist effects', icon: '🌀' },
  { type: 'zigzag', name: 'Zigzag', description: 'Zigzag for distortion effects', icon: '⚡' },
  { type: 'cross', name: 'Cross', description: 'Cross for bloom/glow', icon: '✚' },
  { type: 'star', name: 'Star', description: 'Star shape for sparkle effects', icon: '⭐' },
  { type: 'heart', name: 'Heart', description: 'Heart for vignette/focus', icon: '❤️' },
  { type: 'wave', name: 'Wave', description: 'Wavy line for ripple effects', icon: '🌊' },
];

export function PaintEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paintCanvas, setPaintCanvas] = useState<PaintCanvas | null>(null);
  const [recognizer] = useState(() => new GestureRecognizer());
  const [generator] = useState(() => new EffectGenerator());

  const [isDrawing, setIsDrawing] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<Gesture | null>(null);
  const [generatedEffect, setGeneratedEffect] = useState<PaintEffect | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [history, setHistory] = useState<Array<{ gesture: Gesture; effect: PaintEffect }>>([]);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#4a9eff');

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new PaintCanvas(canvasRef.current, {
        gestureThreshold: 0.7,
        minStrokeLength: brushSize * 4,
      });
      setPaintCanvas(canvas);

      return () => {
        canvas.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (paintCanvas) {
      paintCanvas.setLineWidth(brushSize);
      paintCanvas.setColor(brushColor);
    }
  }, [paintCanvas, brushSize, brushColor]);

  const handlePointerDown = useCallback(
    (_e: React.PointerEvent) => {
      if (!paintCanvas) return;
      setIsDrawing(true);
      setDetectedGesture(null);
      setGeneratedEffect(null);
    },
    [paintCanvas]
  );

  const handlePointerMove = useCallback(
    (_e: React.PointerEvent) => {
      if (!paintCanvas || !isDrawing) return;
    },
    [paintCanvas, isDrawing]
  );

  const handlePointerUp = useCallback(() => {
    if (!paintCanvas || !isDrawing) return;
    setIsDrawing(false);

    // Get latest effect from canvas
    const effects = paintCanvas.getEffects();
    if (effects.length > 0) {
      const latestEffect = effects[effects.length - 1];
      setGeneratedEffect(latestEffect);

      // Generate WGSL code (placeholder)
      const code = `// Generated effect: ${latestEffect.effect}\n// Type: ${latestEffect.layerType}\n// Opacity: ${(latestEffect.opacity * 100).toFixed(0)}%`;
      setGeneratedCode(code);

      const session = paintCanvas.getSession();
      const gesture = session.recognizedGestures[session.recognizedGestures.length - 1];
      if (gesture) {
        setDetectedGesture(gesture);
        setHistory((prev) => [...prev.slice(-9), { gesture, effect: latestEffect }]);
      }
    }
  }, [paintCanvas, isDrawing, recognizer, generator]);

  const clearCanvas = useCallback(() => {
    if (paintCanvas) {
      paintCanvas.clear();
      setDetectedGesture(null);
      setGeneratedEffect(null);
      setGeneratedCode('');
    }
  }, [paintCanvas]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
  }, [generatedCode]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
      {/* Canvas Area */}
      <div>
        <div
          style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              width: '100%',
              height: '400px',
              borderRadius: '8px',
              background: '#0a0a0f',
              cursor: 'crosshair',
              touchAction: 'none',
            }}
          />
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div>
            <label style={{ fontSize: '0.75rem', color: '#888', marginRight: '0.5rem' }}>
              Brush Size: {brushSize}px
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              style={{ width: '100px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#888', marginRight: '0.5rem' }}>
              Color:
            </label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            />
          </div>

          <button
            onClick={clearCanvas}
            style={{
              padding: '0.5rem 1rem',
              background: '#333',
              border: 'none',
              borderRadius: '6px',
              color: '#888',
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            🗑️ Clear
          </button>
        </div>

        {/* Gesture Guide */}
        <div
          style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '1rem',
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#888' }}>Gesture Guide</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
            }}
          >
            {gestureGuide.map((g) => (
              <div
                key={g.type}
                style={{
                  padding: '0.75rem',
                  background: detectedGesture?.type === g.type ? '#2a2a4e' : '#222238',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border:
                    detectedGesture?.type === g.type
                      ? '1px solid #4a9eff'
                      : '1px solid transparent',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{g.icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500 }}>{g.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '0.25rem' }}>
                  {g.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div>
        {/* Detection Result */}
        <div
          style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#888' }}>
            Detected Gesture
          </h3>

          {detectedGesture ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <span style={{ fontSize: '2rem' }}>
                  {gestureGuide.find((g) => g.type === detectedGesture.type)?.icon || '❓'}
                </span>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {detectedGesture.type.charAt(0).toUpperCase() + detectedGesture.type.slice(1)}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: detectedGesture.confidence > 0.7 ? '#4ade80' : '#fbbf24',
                    }}
                  >
                    {Math.round(detectedGesture.confidence * 100)}% confidence
                  </div>
                </div>
              </div>

              {/* Gesture metadata */}
              <div
                style={{
                  background: '#222238',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span style={{ color: '#888' }}>Center</span>
                  <span>
                    ({Math.round(detectedGesture.center.x)}, {Math.round(detectedGesture.center.y)})
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span style={{ color: '#888' }}>Size</span>
                  <span>
                    {Math.round(detectedGesture.bounds.width)}x
                    {Math.round(detectedGesture.bounds.height)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Scale</span>
                  <span>{Math.round(detectedGesture.scale ?? 100)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '2rem 0' }}>
              <p style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>✏️</p>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Draw a gesture on the canvas</p>
            </div>
          )}
        </div>

        {/* Generated Effect */}
        {generatedEffect && (
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#888' }}>
              Generated Effect
            </h3>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              {generatedEffect.effect}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1rem' }}>
              Type: {generatedEffect.layerType}
            </p>

            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#888' }}>
              Parameters
            </h4>
            <div
              style={{
                background: '#222238',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.75rem',
              }}
            >
              {Object.entries(generatedEffect.params).map(([key, value]) => (
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
              marginBottom: '1rem',
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
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>Shader Code</h3>
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
                maxHeight: '150px',
              }}
            >
              {generatedCode}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#888' }}>
              Recent Effects
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {history.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.5rem',
                    background: '#222238',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span>{gestureGuide.find((g) => g.type === item.gesture.type)?.icon}</span>
                  <span>{item.effect.effect}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
