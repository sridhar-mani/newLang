import type { LayerMask, MaskGradient, MaskRadial } from './layer-types';

export interface MaskBrush {
  size: number;
  hardness: number;
  opacity: number;
  flow: number;
}

export class MaskEditor {
  private width: number;
  private height: number;
  private data: Float32Array;
  private history: Float32Array[] = [];
  private historyIndex = -1;
  private maxHistory = 50;

  constructor(width: number, height: number, initialValue = 1) {
    this.width = width;
    this.height = height;
    this.data = new Float32Array(width * height).fill(initialValue);
    this.saveState();
  }

  paint(x: number, y: number, brush: MaskBrush, add: boolean): void {
    const radius = brush.size / 2;
    const radiusSq = radius * radius;

    const minX = Math.max(0, Math.floor(x - radius));
    const maxX = Math.min(this.width - 1, Math.ceil(x + radius));
    const minY = Math.max(0, Math.floor(y - radius));
    const maxY = Math.min(this.height - 1, Math.ceil(y + radius));

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const dx = px - x;
        const dy = py - y;
        const distSq = dx * dx + dy * dy;

        if (distSq <= radiusSq) {
          const dist = Math.sqrt(distSq);
          const falloff = this.calculateFalloff(dist, radius, brush.hardness);
          const strength = falloff * brush.opacity * brush.flow;

          const index = py * this.width + px;
          const current = this.data[index];

          if (add) {
            this.data[index] = Math.min(1, current + strength);
          } else {
            this.data[index] = Math.max(0, current - strength);
          }
        }
      }
    }
  }

  private calculateFalloff(distance: number, radius: number, hardness: number): number {
    const normalized = distance / radius;
    const softRadius = 1 - hardness;

    if (normalized <= softRadius) {
      return 1;
    }

    const t = (normalized - softRadius) / (1 - softRadius);
    return 1 - t * t;
  }

  fill(value: number): void {
    this.data.fill(value);
  }

  invert(): void {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = 1 - this.data[i];
    }
    this.saveState();
  }

  blur(radius: number): void {
    const sigma = radius * 0.3;
    const kernelSize = Math.ceil(radius * 2) * 2 + 1;
    const kernel = this.generateGaussianKernel(kernelSize, sigma);

    const temp = new Float32Array(this.data.length);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let sum = 0;
        let weightSum = 0;

        for (let i = 0; i < kernelSize; i++) {
          const sx = x + i - Math.floor(kernelSize / 2);
          if (sx >= 0 && sx < this.width) {
            sum += this.data[y * this.width + sx] * kernel[i];
            weightSum += kernel[i];
          }
        }

        temp[y * this.width + x] = sum / weightSum;
      }
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let sum = 0;
        let weightSum = 0;

        for (let i = 0; i < kernelSize; i++) {
          const sy = y + i - Math.floor(kernelSize / 2);
          if (sy >= 0 && sy < this.height) {
            sum += temp[sy * this.width + x] * kernel[i];
            weightSum += kernel[i];
          }
        }

        this.data[y * this.width + x] = sum / weightSum;
      }
    }

    this.saveState();
  }

  private generateGaussianKernel(size: number, sigma: number): Float32Array {
    const kernel = new Float32Array(size);
    const center = Math.floor(size / 2);
    let sum = 0;

    for (let i = 0; i < size; i++) {
      const x = i - center;
      kernel[i] = Math.exp((-x * x) / (2 * sigma * sigma));
      sum += kernel[i];
    }

    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }

    return kernel;
  }

  applyGradient(gradient: MaskGradient): void {
    const dx = gradient.endX - gradient.startX;
    const dy = gradient.endY - gradient.startY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return;

    const nx = dx / length;
    const ny = dy / length;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const px = x / this.width;
        const py = y / this.height;

        const vx = px - gradient.startX;
        const vy = py - gradient.startY;

        let t = (vx * nx + vy * ny) / length;

        if (gradient.type === 'reflected') {
          t = Math.abs(t * 2 - 1);
        }

        t = Math.max(0, Math.min(1, t));
        this.data[y * this.width + x] = t;
      }
    }

    this.saveState();
  }

  applyRadial(radial: MaskRadial): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const px = x / this.width;
        const py = y / this.height;

        const dx = (px - radial.centerX) / radial.radiusX;
        const dy = (py - radial.centerY) / radial.radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let value: number;
        if (dist >= 1) {
          value = 0;
        } else {
          value = Math.pow(1 - dist, radial.falloff);
        }

        this.data[y * this.width + x] = value;
      }
    }

    this.saveState();
  }

  private saveState(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(new Float32Array(this.data));
    this.historyIndex = this.history.length - 1;

    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.data = new Float32Array(this.history[this.historyIndex]);
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.data = new Float32Array(this.history[this.historyIndex]);
      return true;
    }
    return false;
  }

  commit(): void {
    this.saveState();
  }

  getData(): Float32Array {
    return this.data;
  }

  toLayerMask(inverted = false, feather = 0): LayerMask {
    return {
      type: 'painted',
      data: new Float32Array(this.data),
      inverted,
      feather,
    };
  }

  resize(newWidth: number, newHeight: number): void {
    const newData = new Float32Array(newWidth * newHeight);

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = (x / newWidth) * this.width;
        const srcY = (y / newHeight) * this.height;

        const x0 = Math.floor(srcX);
        const y0 = Math.floor(srcY);
        const x1 = Math.min(x0 + 1, this.width - 1);
        const y1 = Math.min(y0 + 1, this.height - 1);

        const fx = srcX - x0;
        const fy = srcY - y0;

        const v00 = this.data[y0 * this.width + x0];
        const v10 = this.data[y0 * this.width + x1];
        const v01 = this.data[y1 * this.width + x0];
        const v11 = this.data[y1 * this.width + x1];

        const v0 = v00 * (1 - fx) + v10 * fx;
        const v1 = v01 * (1 - fx) + v11 * fx;
        newData[y * newWidth + x] = v0 * (1 - fy) + v1 * fy;
      }
    }

    this.width = newWidth;
    this.height = newHeight;
    this.data = newData;
    this.saveState();
  }

  getPixel(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
    return this.data[Math.floor(y) * this.width + Math.floor(x)];
  }

  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}

export function createLinearGradientMask(
  width: number,
  height: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): Float32Array {
  const editor = new MaskEditor(width, height, 0);
  editor.applyGradient({ startX, startY, endX, endY, type: 'linear' });
  return editor.getData();
}

export function createRadialGradientMask(
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  falloff = 1
): Float32Array {
  const editor = new MaskEditor(width, height, 0);
  editor.applyRadial({ centerX, centerY, radiusX, radiusY, falloff });
  return editor.getData();
}
