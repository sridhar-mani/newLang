export * from './types';
export * from './gesture-recognition';
export * from './effect-generator';
export * from './paint-canvas';

// Export type aliases for backward compatibility
export type { RecognizedGesture as Gesture, GeneratedEffect as PaintEffect } from './types';
