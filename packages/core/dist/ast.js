/**
 * Built-in uniforms that Shader3D auto-injects (Shadertoy-compatible)
 */
export const BUILTIN_UNIFORMS = [
    { name: 'time', type: { kind: 'primitive', name: 'f32' }, description: 'Elapsed time in seconds' },
    { name: 'deltaTime', type: { kind: 'primitive', name: 'f32' }, description: 'Time since last frame' },
    { name: 'frame', type: { kind: 'primitive', name: 'u32' }, description: 'Frame counter' },
    { name: 'resolution', type: { kind: 'vector', size: 2, elementType: 'f32' }, description: 'Canvas size in pixels' },
    { name: 'mouse', type: { kind: 'vector', size: 4, elementType: 'f32' }, description: 'Mouse position (xy: current, zw: click)' },
];
//# sourceMappingURL=ast.js.map