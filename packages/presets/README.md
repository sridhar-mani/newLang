# @shader3d/presets

Smart preset library for one-click professional shader effects with auto-adaptation to image content.

## Features

- **50+ Professional Presets**: Photography, Video, Gaming, Motion, Artistic categories
- **Smart Adaptation**: Analyzes image brightness, contrast, saturation and auto-adjusts parameters
- **Preset Variants**: Subtle, Normal, Strong intensity options
- **Custom Presets**: Create and save your own presets

## Installation

```bash
npm install @shader3d/presets
```

## Usage

### Quick Start

```typescript
import { PresetManager, PHOTOGRAPHY_PRESETS } from '@shader3d/presets';

const manager = new PresetManager();

// Get a preset
const goldenHour = manager.getPreset('golden-hour');

// Apply with smart adaptation
const layers = await manager.applyPreset('golden-hour', imageData, {
  adapt: true,
  variant: 'Strong'
});
```

### Smart Suggestions

```typescript
import { PresetManager } from '@shader3d/presets';

const manager = new PresetManager();

// Get AI-suggested presets based on image analysis
const suggestions = await manager.suggestPresets(imageData, 5);
console.log('Recommended presets:', suggestions.map(p => p.name));
```

### Image Analysis

```typescript
import { SmartAdaptationEngine, analyzeImage } from '@shader3d/presets';

const engine = new SmartAdaptationEngine();
const analysis = await engine.analyze(imageData);

console.log('Brightness:', analysis.brightness);
console.log('Dominant color:', analysis.dominantColor);
console.log('Has subject:', analysis.hasSubject);
```

## Preset Categories

### Photography
- **Golden Hour** - Warm, soft sunset lighting
- **Dramatic Sky** - High contrast landscape
- **Soft Portrait** - Flattering skin tones with glow
- **Urban Grit** - Gritty street photography

### Video/Cinematic
- **Teal & Orange** - Hollywood blockbuster grading
- **VHS** - Authentic 80s tape look
- **Horror** - Creepy desaturated mood
- **Sci-Fi Neon** - Cyberpunk aesthetic

### Gaming
- **Pixel Art** - Retro 8/16/32-bit styles
- **CRT Screen** - Classic monitor effect
- **Cel Shading** - Cartoon/anime style

### Motion
- **Speed Blur** - Motion blur for action
- **Impact Flash** - Bright hit effects
- **Glitch** - Digital glitch transition

## API Reference

### PresetManager

- `getPreset(id)` - Get preset by ID
- `getAllPresets()` - Get all available presets
- `getPresetsByCategory(category)` - Filter by category
- `searchPresets(query)` - Search by name, description, tags
- `applyPreset(id, imageData?, options?)` - Apply with adaptation
- `suggestPresets(imageData, count)` - Get AI suggestions
- `addCustomPreset(preset)` - Add custom preset
- `createPresetFromLayers(name, layers)` - Create from layer stack

### SmartAdaptationEngine

- `analyze(imageData)` - Analyze image characteristics
- `adapt(preset, analysis)` - Adapt preset to image
- `suggestPresets(analysis, presets, count)` - Score and rank presets
