import type { Point, Stroke, RecognizedGesture, GestureType } from './types';

export class GestureRecognizer {
  private templates: Map<GestureType, Point[][]> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    this.templates.set('circle', [this.generateCircleTemplate(32)]);
    this.templates.set('line', [
      this.generateLineTemplate(0),
      this.generateLineTemplate(45),
      this.generateLineTemplate(90),
      this.generateLineTemplate(135),
    ]);
    this.templates.set('arrow', [this.generateArrowTemplate()]);
    this.templates.set('wave', [this.generateWaveTemplate()]);
    this.templates.set('zigzag', [this.generateZigzagTemplate()]);
    this.templates.set('spiral', [this.generateSpiralTemplate()]);
    this.templates.set('rectangle', [this.generateRectangleTemplate()]);
    this.templates.set('triangle', [this.generateTriangleTemplate()]);
    this.templates.set('star', [this.generateStarTemplate()]);
  }

  private generateCircleTemplate(numPoints: number): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints;
      points.push({ x: Math.cos(angle), y: Math.sin(angle) });
    }
    return points;
  }

  private generateLineTemplate(angleDeg: number): Point[] {
    const angle = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
      { x: -cos, y: -sin },
      { x: cos, y: sin },
    ];
  }

  private generateArrowTemplate(): Point[] {
    return [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0.5, y: -0.5 },
      { x: 1, y: 0 },
      { x: 0.5, y: 0.5 },
    ];
  }

  private generateWaveTemplate(): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < 32; i++) {
      const t = i / 31;
      points.push({
        x: t * 2 - 1,
        y: Math.sin(t * Math.PI * 4) * 0.3,
      });
    }
    return points;
  }

  private generateZigzagTemplate(): Point[] {
    return [
      { x: -1, y: 0 },
      { x: -0.5, y: 0.5 },
      { x: 0, y: 0 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 0 },
    ];
  }

  private generateSpiralTemplate(): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < 48; i++) {
      const t = i / 47;
      const angle = t * Math.PI * 4;
      const radius = 0.2 + t * 0.8;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
    return points;
  }

  private generateRectangleTemplate(): Point[] {
    return [
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];
  }

  private generateTriangleTemplate(): Point[] {
    return [
      { x: 0, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: 0, y: -1 },
    ];
  }

  private generateStarTemplate(): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
      const radius = i % 2 === 0 ? 1 : 0.4;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
    points.push(points[0]);
    return points;
  }

  recognize(stroke: Stroke): RecognizedGesture {
    if (stroke.points.length < 3) {
      return this.createUnknownGesture(stroke);
    }

    const normalized = this.normalizePoints(stroke.points);
    const bounds = this.calculateBounds(stroke.points);
    const center = this.calculateCenter(stroke.points);

    if (this.isDot(stroke, bounds)) {
      return {
        type: 'dot',
        confidence: 0.95,
        bounds,
        center,
      };
    }

    if (this.isScribble(normalized)) {
      return {
        type: 'scribble',
        confidence: 0.85,
        bounds,
        center,
        scale: Math.max(bounds.width, bounds.height),
      };
    }

    let bestMatch: GestureType = 'unknown';
    let bestScore = 0;
    let bestRotation = 0;

    for (const [gestureType, templates] of this.templates) {
      for (const template of templates) {
        const { score, rotation } = this.matchTemplate(normalized, template);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = gestureType;
          bestRotation = rotation;
        }
      }
    }

    const direction = this.calculateDirection(stroke.points);

    return {
      type: bestScore > 0.6 ? bestMatch : 'unknown',
      confidence: bestScore,
      bounds,
      center,
      direction,
      rotation: bestRotation,
      scale: Math.max(bounds.width, bounds.height),
    };
  }

  private normalizePoints(points: Point[]): Point[] {
    if (points.length === 0) return [];

    const bounds = this.calculateBounds(points);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const scale = Math.max(bounds.width, bounds.height) / 2 || 1;

    const centered = points.map((p) => ({
      x: (p.x - centerX) / scale,
      y: (p.y - centerY) / scale,
    }));

    return this.resample(centered, 32);
  }

  private resample(points: Point[], numPoints: number): Point[] {
    if (points.length < 2) return points;

    const totalLength = this.pathLength(points);
    const interval = totalLength / (numPoints - 1);

    const resampled: Point[] = [points[0]];
    let D = 0;

    for (let i = 1; i < points.length; i++) {
      const d = this.distance(points[i - 1], points[i]);

      if (D + d >= interval) {
        const t = (interval - D) / d;
        const newPoint: Point = {
          x: points[i - 1].x + t * (points[i].x - points[i - 1].x),
          y: points[i - 1].y + t * (points[i].y - points[i - 1].y),
        };
        resampled.push(newPoint);
        points.splice(i, 0, newPoint);
        D = 0;
      } else {
        D += d;
      }
    }

    while (resampled.length < numPoints) {
      resampled.push(points[points.length - 1]);
    }

    return resampled.slice(0, numPoints);
  }

  private pathLength(points: Point[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += this.distance(points[i - 1], points[i]);
    }
    return length;
  }

  private distance(a: Point, b: Point): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  private calculateBounds(points: Point[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    for (const p of points) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  private calculateCenter(points: Point[]): Point {
    if (points.length === 0) return { x: 0, y: 0 };

    let sumX = 0,
      sumY = 0;
    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
    }

    return {
      x: sumX / points.length,
      y: sumY / points.length,
    };
  }

  private calculateDirection(points: Point[]): number {
    if (points.length < 2) return 0;

    const first = points[0];
    const last = points[points.length - 1];

    const angle = Math.atan2(last.y - first.y, last.x - first.x);
    return (angle * 180) / Math.PI;
  }

  private isDot(stroke: Stroke, bounds: { width: number; height: number }): boolean {
    const maxSize = 20;
    const maxDuration = 300;

    return (
      bounds.width < maxSize &&
      bounds.height < maxSize &&
      stroke.endTime - stroke.startTime < maxDuration
    );
  }

  private isScribble(points: Point[]): boolean {
    if (points.length < 10) return false;

    let directionChanges = 0;
    let prevAngle = 0;

    for (let i = 2; i < points.length; i++) {
      const angle = Math.atan2(points[i].y - points[i - 1].y, points[i].x - points[i - 1].x);

      if (i > 2) {
        const angleDiff = Math.abs(angle - prevAngle);
        if (angleDiff > Math.PI / 4 && angleDiff < Math.PI * 1.75) {
          directionChanges++;
        }
      }

      prevAngle = angle;
    }

    return directionChanges > points.length * 0.3;
  }

  private matchTemplate(points: Point[], template: Point[]): { score: number; rotation: number } {
    const resampledTemplate = this.resample([...template], points.length);

    let bestScore = 0;
    let bestRotation = 0;

    for (let angle = 0; angle < 360; angle += 15) {
      const rotated = this.rotatePoints(points, (angle * Math.PI) / 180);
      const score = this.calculateSimilarity(rotated, resampledTemplate);

      if (score > bestScore) {
        bestScore = score;
        bestRotation = angle;
      }
    }

    return { score: bestScore, rotation: bestRotation };
  }

  private rotatePoints(points: Point[], angle: number): Point[] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return points.map((p) => ({
      x: p.x * cos - p.y * sin,
      y: p.x * sin + p.y * cos,
    }));
  }

  private calculateSimilarity(a: Point[], b: Point[]): number {
    if (a.length !== b.length) return 0;

    let sumDist = 0;
    for (let i = 0; i < a.length; i++) {
      sumDist += this.distance(a[i], b[i]);
    }

    const avgDist = sumDist / a.length;
    const maxDist = 2 * Math.sqrt(2);

    return Math.max(0, 1 - avgDist / maxDist);
  }

  private createUnknownGesture(stroke: Stroke): RecognizedGesture {
    const bounds = this.calculateBounds(stroke.points);
    const center = this.calculateCenter(stroke.points);

    return {
      type: 'unknown',
      confidence: 0,
      bounds,
      center,
    };
  }
}
