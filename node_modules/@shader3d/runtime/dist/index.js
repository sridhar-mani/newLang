export { Shader3DRuntime } from './base';
// WebGPU runtime
export { WebGPURuntime, initWebGPU, isWebGPUSupported, getAdapterInfo } from './webgpu';
// Three.js adapter
export { ThreeJSAdapter, createThreeJSAdapter, createFullscreenQuadVertices, createFullscreenQuadUVs, convertShadertoyFragment, FULLSCREEN_VERTEX_SHADER, THREE_SHADER_CHUNKS } from './threejs';
// Version
export const VERSION = '0.1.0';
//# sourceMappingURL=index.js.map