# Shader3D Packages

Monorepo for Shader3D - a TypeScript shader development library with no-code shader creation tools.

## Core Packages

| Package | Description |
|---------|-------------|
| `@shader3d/core` | DSL parser, transpiler, code generators |
| `@shader3d/runtime` | WebGPU & Three.js runtime adapters |
| `@shader3d/vite-plugin` | Vite integration with HMR |
| `@shader3d/ladder` | Progressive learning CLI |

## No-Code Shader Creation

| Package | Description |
|---------|-------------|
| `@shader3d/layers` | Photoshop-style layer composition with blend modes and masks |
| `@shader3d/presets` | Smart preset library with auto-adaptation to image content |
| `@shader3d/paint-effects` | Draw gestures to create shader effects |
| `@shader3d/natural-language` | Describe effects in plain English |
| `@shader3d/learn-from-examples` | Upload images to learn and recreate styles |

## Development

```bash
pnpm install
pnpm run build
pnpm run dev
```

See root [README.md](../README.md) for full documentation.
