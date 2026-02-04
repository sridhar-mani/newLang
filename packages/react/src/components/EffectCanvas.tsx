import React, { useEffect, useRef } from 'react';
import type { EffectCanvasProps } from '../types';

export function EffectCanvas({
  src,
  preset,
  layers,
  width = 400,
  height = 300,
  className,
  style,
  onLoad,
  onError,
}: EffectCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (src) {
      const img = new Image();
      imageRef.current = img;

      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        onLoad?.();
      };

      img.onerror = () => {
        onError?.(new Error('Failed to load image'));
      };

      img.src = src;
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);
    }
  }, [src, width, height, onLoad, onError]);

  useEffect(() => {
    if (preset) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(74, 158, 255, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#4a9eff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Preset: ${preset}`, width / 2, height - 20);
      }
    }
  }, [preset, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        background: '#1a1a2e',
        borderRadius: '8px',
        ...style,
      }}
    />
  );
}
