import type {
  Point,
  Stroke,
  RecognizedGesture,
  GeneratedEffect,
  PaintSession,
  PaintEffectsConfig,
} from './types';
import { DEFAULT_CONFIG } from './types';
import { GestureRecognizer } from './gesture-recognition';
import { EffectGenerator } from './effect-generator';

export type PaintCanvasEventType =
  | 'strokeStart'
  | 'strokeUpdate'
  | 'strokeEnd'
  | 'gestureRecognized'
  | 'effectGenerated'
  | 'sessionUpdated';

export interface PaintCanvasEvent {
  type: PaintCanvasEventType;
  stroke?: Stroke;
  gesture?: RecognizedGesture;
  effect?: GeneratedEffect;
  session?: PaintSession;
}

export type PaintCanvasEventHandler = (event: PaintCanvasEvent) => void;

export class PaintCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: PaintEffectsConfig;
  private gestureRecognizer: GestureRecognizer;
  private effectGenerator: EffectGenerator;

  private currentStroke: Stroke | null = null;
  private session: PaintSession;
  private listeners: Map<PaintCanvasEventType, Set<PaintCanvasEventHandler>> = new Map();

  private isDrawing = false;
  private lastPoint: Point | null = null;

  constructor(canvas: HTMLCanvasElement, config: Partial<PaintEffectsConfig> = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.gestureRecognizer = new GestureRecognizer();
    this.effectGenerator = new EffectGenerator();

    this.session = this.createSession();

    this.setupEventListeners();
    this.setupCanvasStyle();
  }

  private createSession(): PaintSession {
    return {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      strokes: [],
      recognizedGestures: [],
      generatedEffects: [],
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  }

  private setupCanvasStyle(): void {
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointerleave', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerUp);
  }

  private handlePointerDown = (e: PointerEvent): void => {
    e.preventDefault();
    this.isDrawing = true;

    const point = this.getPoint(e);
    this.lastPoint = point;

    this.currentStroke = {
      points: [point],
      color: this.ctx.strokeStyle as string,
      width: this.ctx.lineWidth,
      startTime: Date.now(),
      endTime: Date.now(),
    };

    this.emit({
      type: 'strokeStart',
      stroke: this.currentStroke,
    });

    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (!this.isDrawing || !this.currentStroke) return;

    e.preventDefault();
    const point = this.getPoint(e);

    this.currentStroke.points.push(point);
    this.currentStroke.endTime = Date.now();

    if (this.lastPoint) {
      this.ctx.lineTo(point.x, point.y);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(point.x, point.y);
    }

    this.lastPoint = point;

    this.emit({
      type: 'strokeUpdate',
      stroke: this.currentStroke,
    });

    if (this.config.enableRealTimePreview && this.currentStroke.points.length > 5) {
      this.recognizeAndPreview();
    }
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (!this.isDrawing || !this.currentStroke) return;

    e.preventDefault();
    this.isDrawing = false;

    const point = this.getPoint(e);
    this.currentStroke.points.push(point);
    this.currentStroke.endTime = Date.now();

    this.emit({
      type: 'strokeEnd',
      stroke: this.currentStroke,
    });

    this.processStroke(this.currentStroke);

    this.currentStroke = null;
    this.lastPoint = null;
  };

  private getPoint(e: PointerEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure,
      timestamp: Date.now(),
    };
  }

  private recognizeAndPreview(): void {
    if (!this.currentStroke) return;

    const gesture = this.gestureRecognizer.recognize(this.currentStroke);

    if (gesture.confidence > this.config.gestureThreshold) {
      this.emit({
        type: 'gestureRecognized',
        gesture,
      });
    }
  }

  private processStroke(stroke: Stroke): void {
    if (stroke.points.length < 2) return;

    const pathLength = this.calculatePathLength(stroke.points);
    if (pathLength < this.config.minStrokeLength) return;

    this.session.strokes.push(stroke);

    const gesture = this.gestureRecognizer.recognize(stroke);

    if (gesture.confidence > this.config.gestureThreshold) {
      this.session.recognizedGestures.push(gesture);

      this.emit({
        type: 'gestureRecognized',
        gesture,
      });

      const effect = this.effectGenerator.generateWithMask(
        gesture,
        this.canvas.width,
        this.canvas.height
      );

      if (effect) {
        this.session.generatedEffects.push(effect);

        this.emit({
          type: 'effectGenerated',
          effect,
        });
      }
    }

    this.session.modifiedAt = Date.now();

    this.emit({
      type: 'sessionUpdated',
      session: this.session,
    });
  }

  private calculatePathLength(points: Point[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }

  on(event: PaintCanvasEventType, handler: PaintCanvasEventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: PaintCanvasEventType, handler: PaintCanvasEventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: PaintCanvasEvent): void {
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.session = this.createSession();

    this.emit({
      type: 'sessionUpdated',
      session: this.session,
    });
  }

  undo(): GeneratedEffect | null {
    if (this.session.generatedEffects.length === 0) return null;

    const removed = this.session.generatedEffects.pop()!;
    this.session.recognizedGestures.pop();
    this.session.strokes.pop();

    this.redrawStrokes();

    this.emit({
      type: 'sessionUpdated',
      session: this.session,
    });

    return removed;
  }

  private redrawStrokes(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const stroke of this.session.strokes) {
      if (stroke.points.length < 2) continue;

      this.ctx.strokeStyle = stroke.color ?? '#ffffff';
      this.ctx.lineWidth = stroke.width ?? 3;

      this.ctx.beginPath();
      this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      this.ctx.stroke();
    }
  }

  setColor(color: string): void {
    this.ctx.strokeStyle = color;
  }

  setLineWidth(width: number): void {
    this.ctx.lineWidth = width;
  }

  getSession(): PaintSession {
    return this.session;
  }

  getEffects(): GeneratedEffect[] {
    return [...this.session.generatedEffects];
  }

  resize(width: number, height: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    this.canvas.width = width;
    this.canvas.height = height;
    this.session.canvasWidth = width;
    this.session.canvasHeight = height;

    this.setupCanvasStyle();
    this.ctx.putImageData(imageData, 0, 0);
  }

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointerleave', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);

    this.listeners.clear();
  }
}
