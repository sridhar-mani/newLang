# @shader3d/paint-effects

Draw gestures to create shader effects - paint circles for glow, draw arrows for motion blur, scribble for noise.

## Features

- **Gesture Recognition**: Circles, spirals, arrows, lines, waves, zigzags, stars, and more
- **Automatic Effect Mapping**: Gestures map to appropriate shader effects
- **Pressure Sensitivity**: Stylus pressure affects effect intensity
- **Real-time Preview**: See recognized gestures and effects as you draw
- **Mask Generation**: Creates per-layer masks from gesture shapes

## Installation

```bash
npm install @shader3d/paint-effects
```

## Usage

### Basic Setup

```typescript
import { PaintCanvas } from '@shader3d/paint-effects';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const paintCanvas = new PaintCanvas(canvas);

// Listen for generated effects
paintCanvas.on('effectGenerated', (event) => {
  console.log('Effect:', event.effect);
  // Apply effect.layerType, effect.effect, effect.params
});

// Listen for gesture recognition
paintCanvas.on('gestureRecognized', (event) => {
  console.log('Gesture:', event.gesture.type, event.gesture.confidence);
});
```

### Get Generated Effects

```typescript
// After user draws
const effects = paintCanvas.getEffects();

for (const effect of effects) {
  console.log(effect.layerType, effect.effect, effect.params);
  // effect.mask contains the gesture-shaped mask
}
```

### Custom Gesture Mappings

```typescript
import { EffectGenerator } from '@shader3d/paint-effects';

const generator = new EffectGenerator();

// Add custom mapping
generator.addCustomMapping({
  gesture: 'heart',
  intent: 'glow',
  effectType: 'glow',
  effectName: 'softGlow',
  parameterMappings: [
    { param: 'intensity', source: 'size', scale: 0.02 }
  ]
});
```

## Gesture → Effect Mappings

| Gesture | Effect | Description |
|---------|--------|-------------|
| Circle | Radial Blur / Bloom | Size affects radius |
| Spiral | Swirl Distortion | Rotation affects twist amount |
| Arrow | Motion Blur | Direction sets angle |
| Line | Directional Blur | Angle from line direction |
| Scribble | Film Grain | Intensity from chaos level |
| Wave | Wave Distortion | Size affects amplitude |
| Zigzag | Chromatic Aberration | Size affects intensity |
| Star | Star Glow | Creates lens star effect |
| Dot | Tilt Shift Focus | Creates depth-of-field |
| Rectangle | Vignette | Edge darkening |

## API Reference

### PaintCanvas

- `on(event, handler)` - Subscribe to events
- `off(event, handler)` - Unsubscribe
- `clear()` - Clear canvas and session
- `undo()` - Undo last effect
- `setColor(color)` - Set stroke color
- `setLineWidth(width)` - Set stroke width
- `getSession()` - Get current session data
- `getEffects()` - Get all generated effects
- `dispose()` - Clean up event listeners

### Events

- `strokeStart` - User started drawing
- `strokeUpdate` - Stroke in progress
- `strokeEnd` - Stroke completed
- `gestureRecognized` - Gesture identified
- `effectGenerated` - Effect created from gesture
- `sessionUpdated` - Session state changed

### GestureRecognizer

- `recognize(stroke)` - Identify gesture from stroke
