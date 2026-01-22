import type { Plugin } from 'vite'

export default function shader3dPlugin(): Plugin {
  return {
    name: 'vite-plugin-shader3d',
    transform(code: string, id: string) {
      if (id.endsWith('.shader3d') || id.endsWith('.shader3d.ts')) {
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null
        }
      }
    }
  }
}
