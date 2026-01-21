import { Shader3DRuntime } from './base';
/**
 * Render pass configuration
 */
export interface RenderPassConfig {
    clearColor?: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    loadOp?: 'clear' | 'load';
    storeOp?: 'store' | 'discard';
    depthTexture?: GPUTexture;
}
/**
 * Builtin uniforms (Shadertoy-compatible)
 */
export interface BuiltinUniforms {
    time: number;
    deltaTime: number;
    frame: number;
    resolution: [number, number];
    mouse: [number, number, number, number];
}
/**
 * WebGPU Runtime for Shader3D
 * Provides canvas rendering, compute dispatch, and builtin uniforms
 */
export declare class WebGPURuntime extends Shader3DRuntime {
    private canvas?;
    private context?;
    private format;
    private builtinUniformBuffer?;
    private depthTexture?;
    private animationId?;
    private startTime;
    private lastFrameTime;
    private frameCount;
    private mouseState;
    constructor(device: GPUDevice, canvas?: HTMLCanvasElement);
    /**
     * Setup canvas for WebGPU rendering
     */
    private setupCanvas;
    /**
     * Create builtin uniform buffer
     */
    private createBuiltinUniformBuffer;
    /**
     * Setup mouse event tracking
     */
    private setupMouseTracking;
    /**
     * Create depth texture for 3D rendering
     */
    private createDepthTexture;
    /**
     * Get canvas texture format
     */
    getFormat(): GPUTextureFormat;
    /**
     * Get builtin uniform buffer
     */
    getBuiltinUniformBuffer(): GPUBuffer;
    /**
     * Update builtin uniforms
     */
    updateBuiltinUniforms(): void;
    /**
     * Begin a render pass
     */
    beginRenderPass(config?: RenderPassConfig): {
        encoder: GPUCommandEncoder;
        pass: GPURenderPassEncoder;
    };
    /**
     * End render pass and submit
     */
    endRenderPass(encoder: GPUCommandEncoder, pass: GPURenderPassEncoder): void;
    /**
     * Render fullscreen quad (for fragment shaders)
     */
    renderFullscreenQuad(pipelineName: string, bindGroup?: GPUBindGroup | string, config?: RenderPassConfig): void;
    /**
     * Render with vertex buffer
     */
    render(pipelineName: string, options: {
        vertexBuffer?: GPUBuffer | string;
        indexBuffer?: GPUBuffer | string;
        bindGroup?: GPUBindGroup | string;
        vertexCount?: number;
        indexCount?: number;
        instanceCount?: number;
        clearColor?: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    }): void;
    /**
     * Resize canvas and recreate depth texture
     */
    resize(width: number, height: number): void;
    /**
     * Start animation loop
     */
    startAnimationLoop(callback: (time: number, deltaTime: number) => void): void;
    /**
     * Stop animation loop
     */
    stopAnimationLoop(): void;
    /**
     * Read buffer data back to CPU
     */
    readBuffer(buffer: GPUBuffer | string): Promise<ArrayBuffer>;
    /**
     * Dispose all resources
     */
    dispose(): void;
}
/**
 * Initialize WebGPU and create runtime
 */
export declare function initWebGPU(canvas?: HTMLCanvasElement): Promise<WebGPURuntime>;
/**
 * Check WebGPU support
 */
export declare function isWebGPUSupported(): boolean;
/**
 * Get WebGPU adapter info
 */
export declare function getAdapterInfo(): Promise<GPUAdapterInfo | null>;
//# sourceMappingURL=webgpu.d.ts.map