import { useState, useRef, useCallback } from 'react';
import { GestureRecognizer, type RecognizedGesture } from '@shader3d/paint-effects';

interface Stroke {
  id: string;
  points: { x: number; y: number }[];
  gesture: RecognizedGesture | null;
}

// Map gestures to shader effects
const GESTURE_EFFECTS: Record<string, { name: string; description: string; icon: string }> = {
  circle: { name: 'Radial Blur', description: 'Blur radiating from center', icon: '⭕' },
  line: { name: 'Motion Blur', description: 'Directional blur along the line', icon: '➖' },
  zigzag: { name: 'Wave Distortion', description: 'Wavy distortion effect', icon: '〰️' },
  spiral: { name: 'Swirl', description: 'Spiral distortion', icon: '🌀' },
  scribble: { name: 'Noise/Grain', description: 'Add film grain effect', icon: '✏️' },
  triangle: { name: 'Sharpen', description: 'Edge sharpening', icon: '🔺' },
  rectangle: { name: 'Vignette', description: 'Darkened edges', icon: '⬜' },
};

export function PaintEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [recognizedEffects, setRecognizedEffects] = useState<string[]>([]);

  // Gesture recognizer instance
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  if (!recognizerRef.current) {
    recognizerRef.current = new GestureRecognizer();
  }

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      const point = getCanvasPoint(e);
      setCurrentStroke([point]);
    },
    [getCanvasPoint]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const point = getCanvasPoint(e);
      setCurrentStroke((prev) => [...prev, point]);

      // Draw on canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || currentStroke.length === 0) return;

      ctx.strokeStyle = '#4a9eff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const lastPoint = currentStroke[currentStroke.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    },
    [isDrawing, currentStroke, getCanvasPoint]
  );

  const endDrawing = useCallback(() => {
    if (!isDrawing || currentStroke.length < 3) {
      setIsDrawing(false);
      setCurrentStroke([]);
      return;
    }

    // Recognize the gesture
    const gesture = recognizerRef.current?.recognize({ 
      points: currentStroke, 
      startTime: Date.now(), 
      endTime: Date.now() 
    }) ?? null;

    const stroke: Stroke = {
      id: crypto.randomUUID(),
      points: currentStroke,
      gesture,
    };

    setStrokes((prev) => [...prev, stroke]);

    if (gesture) {
      const effectInfo = GESTURE_EFFECTS[gesture.type];
      if (effectInfo) {
        setRecognizedEffects((prev) => [...prev, `${effectInfo.icon} ${effectInfo.name}`]);
      }
    }

    setIsDrawing(false);
    setCurrentStroke([]);
  }, [isDrawing, currentStroke]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
    setRecognizedEffects([]);
  }, []);

  const generateShader = useCallback(() => {
    if (recognizedEffects.length === 0) return null;

    // Generate a simple combined shader from recognized effects
    const effects = strokes
      .filter((s) => s.gesture)
      .map((s) => GESTURE_EFFECTS[s.gesture!.type]?.name)
      .filter(Boolean);

    return `// Generated shader from ${effects.length} gesture(s)
// Effects: ${effects.join(', ')}

fn fragmentMain(uv: vec2f) -> vec4f {
  var color = sampleTexture(uv);
  ${effects.includes('Radial Blur') ? '\n  color = radialBlur(color, uv, 0.5);' : ''}
  ${effects.includes('Motion Blur') ? '\n  color = motionBlur(color, uv, vec2f(1.0, 0.0));' : ''}
  ${effects.includes('Wave Distortion') ? '\n  color = waveDistort(color, uv, 0.02);' : ''}
  ${effects.includes('Noise/Grain') ? '\n  color = addGrain(color, 0.1);' : ''}
  ${effects.includes('Vignette') ? '\n  color = applyVignette(color, uv, 0.5);' : ''}
  return color;
}`;
  }, [strokes, recognizedEffects]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
      {/* Left Panel - Drawing Canvas */}
      <div>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, color: '#888' }}>
            Draw gestures to create effects. Try circles, lines, spirals, or scribbles!
          </p>
          <button
            onClick={clearCanvas}
            style={{
              padding: '0.5rem 1rem',
              background: '#4a2a2a',
              color: '#f88',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            border: '2px solid #333',
            cursor: 'crosshair',
            display: 'block',
            width: '100%',
          }}
        />

        {/* Gesture Legend */}
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#888', fontSize: '0.9rem' }}>
            Gesture Reference:
          </h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {Object.entries(GESTURE_EFFECTS).map(([gesture, info]) => (
              <div
                key={gesture}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#2a2a3e',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>{info.icon}</span>
                <span style={{ color: '#888' }}>{gesture}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Recognized Effects */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>Recognized Effects</h3>

        {recognizedEffects.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              background: '#1a1a2e',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            Draw gestures on the canvas to generate effects
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              {recognizedEffects.map((effect, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem',
                    background: '#2a2a3e',
                    borderRadius: '6px',
                  }}
                >
                  {effect}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const shader = generateShader();
                if (shader) {
                  console.log('Generated shader:', shader);
                  alert('Shader generated! Check console for output.');
                }
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#4a9eff',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              🔧 Generate Shader
            </button>

            {generateShader() && (
              <pre
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#1a1a2e',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {generateShader()}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}
