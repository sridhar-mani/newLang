import type { LayerStack, EffectLayer, BlendMode } from './layer-types';
import { compileLayerStack, type CompiledShader } from './compiler';

export interface CompositionOptions {
  optimizePasses?: boolean;
  cacheShaders?: boolean;
  previewQuality?: 'low' | 'medium' | 'high';
}

export class LayerComposition {
  private stack: LayerStack;
  private compiledShader: CompiledShader | null = null;
  private isDirty = true;
  private layerOrder: string[] = [];

  constructor(width: number, height: number, name = 'Untitled') {
    this.stack = {
      id: crypto.randomUUID(),
      name,
      width,
      height,
      layers: [],
      globalBlendMode: 'normal',
    };
  }

  addLayer(layer: EffectLayer): void {
    this.stack.layers.push(layer);
    this.layerOrder.push(layer.id);
    this.markDirty();
  }

  insertLayer(layer: EffectLayer, index: number): void {
    this.stack.layers.splice(index, 0, layer);
    this.layerOrder.splice(index, 0, layer.id);
    this.markDirty();
  }

  removeLayer(layerId: string): EffectLayer | undefined {
    const index = this.stack.layers.findIndex((l) => l.id === layerId);
    if (index === -1) return undefined;

    const removed = this.stack.layers.splice(index, 1)[0];
    this.layerOrder = this.layerOrder.filter((id) => id !== layerId);
    this.markDirty();
    return removed;
  }

  moveLayer(layerId: string, newIndex: number): void {
    const currentIndex = this.stack.layers.findIndex((l) => l.id === layerId);
    if (currentIndex === -1) return;

    const [layer] = this.stack.layers.splice(currentIndex, 1);
    this.stack.layers.splice(newIndex, 0, layer);
    this.layerOrder = this.stack.layers.map((l) => l.id);
    this.markDirty();
  }

  getLayer(layerId: string): EffectLayer | undefined {
    return this.stack.layers.find((l) => l.id === layerId);
  }

  updateLayer(layerId: string, updates: Partial<EffectLayer>): void {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    Object.assign(layer, updates);
    this.markDirty();
  }

  updateLayerParam(layerId: string, paramName: string, value: unknown): void {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    (layer.params as Record<string, unknown>)[paramName] = value;
    this.markDirty();
  }

  setLayerVisibility(layerId: string, visible: boolean): void {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.visible = visible;
      this.markDirty();
    }
  }

  setLayerOpacity(layerId: string, opacity: number): void {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
      this.markDirty();
    }
  }

  setLayerBlendMode(layerId: string, blendMode: BlendMode): void {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.blendMode = blendMode;
      this.markDirty();
    }
  }

  duplicateLayer(layerId: string): EffectLayer | undefined {
    const layer = this.getLayer(layerId);
    if (!layer) return undefined;

    const duplicate: EffectLayer = {
      ...JSON.parse(JSON.stringify(layer)),
      id: crypto.randomUUID(),
      name: `${layer.name} copy`,
    };

    const index = this.stack.layers.findIndex((l) => l.id === layerId);
    this.insertLayer(duplicate, index + 1);
    return duplicate;
  }

  getLayers(): ReadonlyArray<EffectLayer> {
    return this.stack.layers;
  }

  getLayerCount(): number {
    return this.stack.layers.length;
  }

  compile(): CompiledShader {
    if (!this.isDirty && this.compiledShader) {
      return this.compiledShader;
    }

    this.compiledShader = compileLayerStack(this.stack);
    this.isDirty = false;
    return this.compiledShader;
  }

  private markDirty(): void {
    this.isDirty = true;
  }

  toJSON(): LayerStack {
    return JSON.parse(JSON.stringify(this.stack));
  }

  static fromJSON(data: LayerStack): LayerComposition {
    const comp = new LayerComposition(data.width, data.height, data.name);
    comp.stack = JSON.parse(JSON.stringify(data));
    comp.layerOrder = comp.stack.layers.map((l) => l.id);
    return comp;
  }

  resize(width: number, height: number): void {
    this.stack.width = width;
    this.stack.height = height;
    this.markDirty();
  }

  setName(name: string): void {
    this.stack.name = name;
  }

  getName(): string {
    return this.stack.name;
  }

  getDimensions(): { width: number; height: number } {
    return { width: this.stack.width, height: this.stack.height };
  }

  clear(): void {
    this.stack.layers = [];
    this.layerOrder = [];
    this.markDirty();
  }

  flatten(): EffectLayer[] {
    return this.stack.layers.filter((l) => l.visible);
  }
}
