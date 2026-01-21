export { Shader3DRuntime } from './base';
export type { BufferDescriptor, TextureDescriptor } from './base';
export { WebGPURuntime, initWebGPU, isWebGPUSupported, getAdapterInfo } from './webgpu';
export type { RenderPassConfig, BuiltinUniforms } from './webgpu';
export { ThreeJSAdapter, createThreeJSAdapter, createFullscreenQuadVertices, createFullscreenQuadUVs, convertShadertoyFragment, FULLSCREEN_VERTEX_SHADER, THREE_SHADER_CHUNKS } from './threejs';
export type { ThreeJSAdapterOptions, UniformDescriptor } from './threejs';
export declare const VERSION = "0.1.0";
//# sourceMappingURL=index.d.ts.map