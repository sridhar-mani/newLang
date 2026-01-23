import { useState, useCallback } from 'react';
import { parse, analyze, transform, codegen } from '@shader3d/core';

// Example shader3d code snippets showcasing TypeScript-like syntax
const EXAMPLE_SHADERS = {
  gradient: {
    name: 'UV Gradient',
    description: 'Simple UV-based color gradient',
    code: `// Simple UV Gradient
fn fragmentMain(uv: vec2f) -> vec4f {
  return vec4f(uv.x, uv.y, 0.5, 1.0);
}`,
  },
  plasma: {
    name: 'Plasma Effect',
    description: 'Animated plasma using time uniform',
    code: `// Animated Plasma Effect
uniform time: f32;

fn fragmentMain(uv: vec2f) -> vec4f {
  const centered = uv * 2.0 - 1.0;
  const d = length(centered);
  const col = 0.5 + 0.5 * cos(d * 10.0 - time + vec3f(0.0, 2.0, 4.0));
  return vec4f(col, 1.0);
}`,
  },
  waves: {
    name: 'Rippling Waves',
    description: 'Multi-directional wave interference',
    code: `// Rippling Waves
uniform time: f32;

fn fragmentMain(uv: vec2f) -> vec4f {
  const wave1 = sin(uv.x * 20.0 + time * 2.0) * 0.5;
  const wave2 = sin(uv.y * 15.0 + time * 1.5) * 0.5;
  const combined = wave1 + wave2;
  return vec4f(
    0.3 + combined * 0.2,
    0.5 + combined * 0.3,
    0.8 + combined * 0.1,
    1.0
  );
}`,
  },
  circles: {
    name: 'Concentric Rings',
    description: 'Animated concentric circles with glow',
    code: `// Concentric Circles with Glow
uniform time: f32;

fn fragmentMain(uv: vec2f) -> vec4f {
  const centered = uv * 2.0 - 1.0;
  const d = length(centered);
  const rings = sin(d * 30.0 - time * 3.0);
  const glow = smoothstep(1.0, 0.0, d);
  return vec4f(
    rings * 0.5 + 0.5,
    glow * 0.8,
    rings * glow,
    1.0
  );
}`,
  },
};

type ShaderName = keyof typeof EXAMPLE_SHADERS;

interface CompileResult {
  success: boolean;
  wgsl?: string;
  error?: string;
  metadata?: {
    uniforms: string[];
    functions: string[];
  };
}

export function ShaderPlayground() {
  const [selectedShader, setSelectedShader] = useState<ShaderName>('gradient');
  const [customCode, setCustomCode] = useState(EXAMPLE_SHADERS.gradient.code);
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [isCustom, setIsCustom] = useState(false);

  // Compile shader using @shader3d/core pipeline
  const compileShader = useCallback((source: string) => {
    try {
      // Step 1: Parse TypeScript-like syntax into AST
      const parseResult = parse(source);

      // Step 2: Transform AST into intermediate representation
      const transformResult = transform(parseResult.ast);

      // Step 3: Analyze for optimizations and validation
      const analysisResult = analyze(transformResult.ir);

      // Step 4: Generate WGSL code
      const codegenResult = codegen(analysisResult.ir);

      setCompileResult({
        success: true,
        wgsl: codegenResult.code,
        metadata: {
          uniforms: [],
          functions: [],
        },
      });
    } catch (err) {
      setCompileResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  const handlePresetSelect = (name: ShaderName) => {
    setSelectedShader(name);
    setCustomCode(EXAMPLE_SHADERS[name].code);
    setIsCustom(false);
    setCompileResult(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Left Panel - Code Editor */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Example Shaders:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(Object.keys(EXAMPLE_SHADERS) as ShaderName[]).map((name) => (
              <button
                key={name}
                onClick={() => handlePresetSelect(name)}
                title={EXAMPLE_SHADERS[name].description}
                style={{
                  padding: '0.5rem 1rem',
                  background: selectedShader === name && !isCustom ? '#4a9eff' : '#2a2a3e',
                  color: selectedShader === name && !isCustom ? '#fff' : '#aaa',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {EXAMPLE_SHADERS[name].name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Shader3D Code (TypeScript-like syntax):
          </label>
          <textarea
            value={customCode}
            onChange={(e) => {
              setCustomCode(e.target.value);
              setIsCustom(true);
            }}
            style={{
              width: '100%',
              height: '280px',
              background: '#1a1a2e',
              color: '#e0e0e0',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          onClick={() => compileShader(customCode)}
          style={{
            padding: '0.75rem 2rem',
            background: '#4a9eff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          🔧 Compile to WGSL
        </button>
      </div>

      {/* Right Panel - Compilation Result */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>Compilation Result</h3>

        {compileResult === null && (
          <div
            style={{
              padding: '2rem',
              background: '#1a1a2e',
              borderRadius: '8px',
              color: '#888',
              textAlign: 'center',
            }}
          >
            Click "Compile to WGSL" to see the generated code
          </div>
        )}

        {compileResult?.success && (
          <>
            <div
              style={{
                padding: '0.75rem',
                background: '#1a4a1a',
                color: '#8f8',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              ✓ Compilation successful!
              {compileResult.metadata && (
                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>
                  Uniforms: {compileResult.metadata.uniforms.join(', ') || 'none'} • Functions:{' '}
                  {compileResult.metadata.functions.join(', ') || 'none'}
                </div>
              )}
            </div>
            <pre
              style={{
                padding: '1rem',
                background: '#1a1a2e',
                borderRadius: '8px',
                fontSize: '0.8rem',
                overflow: 'auto',
                maxHeight: '350px',
                margin: 0,
              }}
            >
              {compileResult.wgsl}
            </pre>
          </>
        )}

        {compileResult?.success === false && (
          <div
            style={{
              padding: '1rem',
              background: '#4a1a1a',
              color: '#f88',
              borderRadius: '8px',
            }}
          >
            <strong>Compile Error:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>
              {compileResult.error}
            </pre>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', color: '#666', fontSize: '0.85rem' }}>
          <strong>How it works:</strong>
          <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            <li>Write shaders in TypeScript-like syntax</li>
            <li>
              <code>parse()</code> → AST
            </li>
            <li>
              <code>transform()</code> → IR
            </li>
            <li>
              <code>analyze()</code> → Optimized IR
            </li>
            <li>
              <code>codegen()</code> → WGSL
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
