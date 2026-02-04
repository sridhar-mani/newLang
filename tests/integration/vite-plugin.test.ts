import { describe, it, expect, vi } from 'vitest';

// Test the plugin structure and basic functionality
describe('vite-plugin-shader3d', () => {
  it('should have the expected plugin interface', async () => {
    // Dynamically import to test the module loads correctly
    const module = await import('@shader3d/vite-plugin');
    const shader3dPlugin = module.default;

    expect(shader3dPlugin).toBeDefined();
    expect(typeof shader3dPlugin).toBe('function');
  });

  it('should create plugin with correct name', async () => {
    const module = await import('@shader3d/vite-plugin');
    const shader3dPlugin = module.default;
    const plugin = shader3dPlugin({ debug: false });

    expect(plugin.name).toBe('vite-plugin-shader3d');
  });

  it('should have transform function', async () => {
    const module = await import('@shader3d/vite-plugin');
    const shader3dPlugin = module.default;
    const plugin = shader3dPlugin();

    expect(plugin.transform).toBeDefined();
    expect(typeof plugin.transform).toBe('function');
  });
});

// Test @shader3d/core compile function
describe('@shader3d/core compile', () => {
  it('should compile basic shader', async () => {
    const { compile } = await import('@shader3d/core');

    const result = compile(`
      @fragment
      function main(): vec4f {
        return vec4f(1.0, 0.0, 0.5, 1.0);
      }
    `);

    expect(result.code).toContain('fn main');
    expect(result.code).toContain('vec4<f32>');
  });

  it('should return metadata with entry points', async () => {
    const { compile } = await import('@shader3d/core');

    const result = compile(`
      @vertex
      function vertexMain(): vec4f {
        return vec4f(0.0);
      }
      
      @fragment
      function fragmentMain(): vec4f {
        return vec4f(1.0);
      }
    `);

    expect(result.metadata.entryPoints.length).toBeGreaterThan(0);
  });
});
