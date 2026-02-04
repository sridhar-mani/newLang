# @shader3d/react

React components and hooks for Shader3D - create GPU shader effects with simple React components.

## Install

```bash
npm install @shader3d/react
```

## Usage

### EffectCanvas Component

```tsx
import { EffectCanvas } from '@shader3d/react'

function App() {
  return (
    <EffectCanvas 
      src="/photo.jpg"
      preset="golden-hour"
      width={800}
      height={600}
    />
  )
}
```

### useShaderEffect Hook

```tsx
import { useShaderEffect } from '@shader3d/react'

function MyEffect() {
  const { canvas, apply, loading } = useShaderEffect()
  
  useEffect(() => {
    apply({ preset: 'vintage-film', intensity: 0.8 })
  }, [])
  
  return <canvas ref={canvas} />
}
```

### usePreset Hook

```tsx
import { usePreset } from '@shader3d/react'

function PresetSelector() {
  const { presets, apply, current } = usePreset()
  
  return (
    <select onChange={(e) => apply(e.target.value)}>
      {presets.map(p => <option key={p.name}>{p.name}</option>)}
    </select>
  )
}
```

## API

### Components
- `EffectCanvas` - Canvas with shader effect applied
- `EffectProvider` - Context provider for shared state

### Hooks
- `useShaderEffect()` - Core shader effect hook
- `usePreset()` - Preset management hook
- `useLayers()` - Layer composition hook

## License

See [LICENSE](../../LICENSE) in the root directory.
