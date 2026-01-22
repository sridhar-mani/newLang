# Shader3D Demo

A comprehensive interactive demo showcasing all Shader3D packages and their capabilities.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Features

The demo includes **6 interactive tabs** demonstrating the full Shader3D library:

### 🎮 Playground

Write shaders in TypeScript-like syntax and see them compile to WGSL in real-time. Includes 4 example shaders (gradient, plasma, waves, circles) with live editing.

### 📚 Effect Layers (`@shader3d/layers`)

Photoshop-style layer composition system:

- Add effect layers (blur, glow, vignette, noise, etc.)
- Add adjustment layers (brightness, contrast, hue/saturation)
- Add solid color fills
- Adjust blend modes (16 modes: multiply, screen, overlay, etc.)
- Control opacity per layer
- Reorder layers in the stack
- Generate combined shader code

### ✨ Presets (`@shader3d/presets`)

One-click professional shader effects:

- Browse presets by category (cinematic, retro, nature, abstract, utility)
- Smart adaptation sliders that adjust preset parameters to your content
- Preview generated parameters
- Copy shader code

### 🎨 Paint Effects (`@shader3d/paint-effects`)

Draw gestures to create shader effects:

- Gesture recognition for 8 shapes (circle, line, spiral, zigzag, cross, star, heart, wave)
- Real-time confidence scoring
- Automatic effect generation based on gesture type and size
- Adjustable brush size and color

### 💬 Talk to Me (`@shader3d/natural-language`)

Describe effects in plain English:

- Natural language parsing ("warm glow with vignette")
- Conversational interface
- Auto-generated fine-tuning sliders
- 8 example prompts to try

### 📷 Show Me (`@shader3d/learn-from-examples`)

Upload images to learn their visual style:

- Drag-and-drop image upload
- Color palette extraction
- Brightness, saturation, contrast analysis
- Mood and style detection
- Automatic effect synthesis
- 6 sample image categories

## Package Dependencies

This demo uses all Shader3D packages:

```json
{
  "@shader3d/core": "*",
  "@shader3d/runtime": "*",
  "@shader3d/layers": "*",
  "@shader3d/presets": "*",
  "@shader3d/paint-effects": "*",
  "@shader3d/natural-language": "*",
  "@shader3d/learn-from-examples": "*"
}
```

## Browser Requirements

- **WebGPU support required**: Chrome 113+, Edge 113+, Safari 18+
- Modern JavaScript (ES2022)
