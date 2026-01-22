# @shader3d/layers

Photoshop-style layer system for compositing shader effects with blend modes, masks, and pass optimization.

## Features

- **16 Blend Modes**: Normal, Add, Multiply, Screen, Overlay, Soft Light, Hard Light, Color Dodge, Color Burn, Darken, Lighten, Difference, Exclusion, Hue, Saturation, Color, Luminosity
- **20+ Effect Types**: Blur, Glow, Distortion, Color, Noise, Stylize, Lighting, Transitions
- **Layer Compiler**: Fuses compatible layers into optimized single-pass shaders
- **Mask System**: Paint, gradient, and radial masks with undo/redo history

## Installation

```bash
npm install @shader3d/layers
```

## Usage

### Layer Composition

```typescript
import { LayerComposition, createLayer } from '@shader3d/layers';

// Create a composition
const composition = new LayerComposition();

// Add layers
composition.addLayer(createLayer('blur', 'gaussian', { radius: 10 }));
composition.addLayer(createLayer('glow', 'bloom', { intensity: 0.5 }));
composition.addLayer(createLayer('stylize', 'vignette', { intensity: 0.4 }));

// Compile to optimized WGSL
const compiled = composition.compile();
console.log(compiled.wgsl);
```

### Blend Modes

```typescript
import { generateBlendShaderCode, BLEND_FUNCTIONS } from '@shader3d/layers';

// Generate blend shader for specific mode
const screenBlend = generateBlendShaderCode('screen');
```

### Mask Editing

```typescript
import { MaskEditor } from '@shader3d/layers';

const mask = new MaskEditor(512, 512);

// Paint on mask
mask.paint(100, 100, 50, 1.0, 0.8);

// Apply gradient
mask.applyGradient({ x: 0, y: 256 }, { x: 512, y: 256 });

// Undo last action
mask.undo();
```

## Layer Types

| Type | Effects |
|------|---------|
| blur | gaussian, motion, radial |
| glow | bloom, neon |
| distortion | wave, ripple, pixelate, swirl |
| color | brightnessContrast, hueSaturation, vibrance, tint, colorBalance |
| noise | grain, scanlines, static |
| stylize | vignette, chromaticAberration, sharpen, edges |
| lighting | godrays, caustics |
| transition | fade, dissolve, wipe |

## API Reference

### LayerComposition

- `addLayer(layer)` - Add a layer to the composition
- `removeLayer(id)` - Remove a layer by ID
- `moveLayer(id, newIndex)` - Reorder layers
- `updateLayerParam(id, param, value)` - Update effect parameters
- `setLayerVisibility(id, visible)` - Toggle layer visibility
- `setLayerOpacity(id, opacity)` - Set layer opacity
- `compile()` - Compile to optimized WGSL shader

### MaskEditor

- `paint(x, y, radius, intensity, hardness)` - Paint on mask
- `blur(radius)` - Blur entire mask
- `invert()` - Invert mask values
- `applyGradient(start, end)` - Apply linear gradient
- `applyRadial(center, innerRadius, outerRadius)` - Apply radial gradient
- `undo()` / `redo()` - History navigation
