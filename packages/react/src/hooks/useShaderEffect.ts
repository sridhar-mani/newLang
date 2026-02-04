import { useRef, useState, useCallback, useEffect } from 'react';
import type { ShaderEffectOptions } from '../types';

export interface UseShaderEffectReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  apply: (options: ShaderEffectOptions) => void;
  loading: boolean;
  error: Error | null;
  clear: () => void;
}

export function useShaderEffect(): UseShaderEffectReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const apply = useCallback((options: ShaderEffectOptions) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setError(null);

    try {
      // Initialize WebGPU context and apply shader
      // This is a simplified implementation
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4a9eff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Effect: ${options.preset || 'custom'}`, canvas.width / 2, canvas.height / 2);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  return { canvasRef, apply, loading, error, clear };
}
