# @shader3d/effects

Unified API for Shader3D - one import for all features.

## Install

```bash
npm install @shader3d/effects
```

## Usage

```typescript
import { Shader3D } from '@shader3d/effects'

const shader3d = new Shader3D()

// All methods in one place:
shader3d.preset('golden-hour')
shader3d.fromText('warm glow with vignette')
shader3d.fromGesture(gestureData)
shader3d.fromExample(imageData)
shader3d.layers.add('blur', { radius: 5 })
```

## API

### Preset Methods
- `preset(name)` - Apply a preset by name
- `presets()` - List all available presets

### Natural Language
- `fromText(description)` - Generate from text description
- `refine(adjustment)` - Refine current effect ("more blur", "warmer")

### Gesture Input
- `fromGesture(data)` - Recognize gesture and apply effect

### Image Learning
- `fromExample(image)` - Analyze image and match style

### Layer System
- `layers.add(type, params)` - Add a layer
- `layers.remove(index)` - Remove a layer
- `layers.update(index, params)` - Update layer

### Compilation
- `compile()` - Compile to WGSL shader code

## License

See [LICENSE](../../LICENSE) in the root directory.
