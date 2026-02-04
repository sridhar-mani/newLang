# Shader3D

**Write GPU shaders in TypeScript → compile to WGSL for WebGPU**

🎮 [**Live Demo**](https://sridhar-mani.github.io/shader3d/) | 📦 [npm](https://www.npmjs.com/org/shader3d) | 📖 [Architecture](docs/architecture.md)

---

## Why Shader3D?

- **TypeScript-native DSL**: Write shaders with full type safety, IDE autocomplete, and familiar syntax
- **WGSL output**: Compiles to WebGPU's native shader language
- **Hot reload**: Vite plugin with instant HMR during development
- **Zero-knowledge mode**: Create effects without writing shader code using presets, natural language, or gesture painting

## One-Minute Demo

```bash
git clone https://github.com/sridhar-mani/shader3d.git
cd shader3d
npm install
npm run dev
```

Open http://localhost:5173 and try the Playground tab to write shaders in TypeScript syntax.

## Quick Start

### TypeScript Shader (Core Path)

Write shaders in TypeScript-like syntax:

```typescript
// input.shader3d
@fragment
function main(@builtin(position) pos: vec4f): vec4f {
  const uv = pos.xy / resolution;
  const col = vec3f(uv.x, uv.y, sin(time) * 0.5 + 0.5);
  return vec4f(col, 1.0);
}
```

Compiles to WGSL:

```wgsl
struct Uniforms {
    time: f32,
    resolution: vec2<f32>,
}

@group(0) @binding(0) var<uniform> u: Uniforms;

@fragment
fn main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = pos.xy / u.resolution;
    let col = vec3<f32>(uv.x, uv.y, sin(u.time) * 0.5 + 0.5);
    return vec4<f32>(col, 1.0);
}
```

### No-Code Mode (Effect Studio)

Create effects without writing shader code:

```typescript
import { Shader3D } from '@shader3d/effects'

const shader3d = new Shader3D()

// Apply a preset
shader3d.preset('golden-hour')

// Or describe in natural language
shader3d.fromText('warm glow with vignette')

// Refine interactively
shader3d.refine('more contrast, less grain')

// Get compiled shader
const result = shader3d.compile()
```

### React Components

```tsx
import { EffectCanvas } from '@shader3d/react'

function App() {
  return <EffectCanvas src="/photo.jpg" preset="vintage-film" />
}
```

## Installation

```bash
# Core only (for custom shader development)
npm install @shader3d/core @shader3d/runtime

# All-in-one effect studio
npm install @shader3d/effects

# React components
npm install @shader3d/react
```

## Packages

### Core (Stable, Minimal Dependencies)

| Package | Description |
|---------|-------------|
| `@shader3d/core` | TypeScript DSL parser → AST → WGSL codegen |
| `@shader3d/runtime` | WebGPU & Three.js runtime adapters |
| `@shader3d/vite-plugin` | Vite integration with HMR |

### Effect Studio (Optional, Feature-Rich)

| Package | Description |
|---------|-------------|
| `@shader3d/effects` | **Unified API** for all features below |
| `@shader3d/presets` | 50+ professional one-click effects |
| `@shader3d/layers` | Photoshop-style layer composition with 16 blend modes |
| `@shader3d/natural-language` | "Describe in English" → shader |
| `@shader3d/paint-effects` | Draw gestures → shader effects |
| `@shader3d/learn-from-examples` | Upload image → match style |
| `@shader3d/react` | React components and hooks |

## Features

### ✨ 50+ Professional Presets
Photography, Video, Gaming, Artistic, Social - one click to apply.

### 💬 Natural Language
```typescript
shader3d.fromText('cinematic with film grain and warm tones')
shader3d.refine('more contrast, less grain')
```

### ✋ Paint Gestures
Draw a circle → radial blur. Draw a line → motion blur. Draw a spiral → swirl effect.

### 📸 Learn from Examples
Upload an image, automatically match its visual style.

### 📚 Layer System
Stack effects like Photoshop with 16 blend modes and opacity control.

## CLI

```bash
npx shader3d init my-project
npx shader3d build
npx shader3d watch
```

## Vite Plugin

```typescript
// vite.config.ts
import shader3d from '@shader3d/vite-plugin'

export default {
  plugins: [shader3d()]
}
```

## Performance

| Metric | Value |
|--------|-------|
| First render | < 16ms |
| Effect switch | < 5ms |
| Bundle size (core) | ~15KB gzipped |
| Memory usage | < 50MB |
| Target FPS | 60 FPS |

## Browser Support

Requires a [WebGPU-enabled browser](https://caniuse.com/webgpu):

| Browser | Status |
|---------|--------|
| Chrome/Edge 113+ | ✅ Full support |
| Firefox 141+ | ✅ Full support |
| Safari 18+ | ✅ Full support |
| Mobile | ⚠️ Device dependent |

## Architecture

See [docs/architecture.md](docs/architecture.md) for compiler pipeline details:
- Lexer & Parser
- Type system with TypeScript-to-WGSL mapping
- AST transformations
- WGSL code generation

## License

Non-commercial use permitted. See [LICENSE](LICENSE) for details.  
Commercial licensing available on request.
