export interface BufferDescriptor {
    binding: number;
    buffer: GPUBuffer;
    offset?: number;
    size?: number;
}
/**
 * Texture descriptor for bind groups
 */
export interface TextureDescriptor {
    binding: number;
    texture: GPUTexture | GPUTextureView;
    sampler?: GPUSampler;
}
/**
 * Pipeline cache entry
 */
interface PipelineCacheEntry {
    pipeline: GPUComputePipeline | GPURenderPipeline;
    bindGroupLayout: GPUBindGroupLayout;
    timestamp: number;
    source?: string;
}
/**
 * Abstract base class for Shader3D runtimes
 * Handles GPU resource management, pipeline caching, and HMR
 */
export declare abstract class Shader3DRuntime {
    protected device: GPUDevice;
    protected pipelines: Map<string, PipelineCacheEntry>;
    protected bindGroups: Map<string, GPUBindGroup>;
    protected buffers: Map<string, GPUBuffer>;
    protected _disposed: boolean;
    constructor(device: GPUDevice);
    /**
     * Get the GPU device
     */
    getDevice(): GPUDevice;
    /**
     * Check if runtime has been disposed
     */
    isDisposed(): boolean;
    /**
     * Create a compute pipeline
     */
    createComputePipeline(name: string, shaderCode: string, entryPoint?: string, layout?: GPUPipelineLayout | 'auto'): Promise<GPUComputePipeline>;
    /**
     * Create a render pipeline
     */
    createRenderPipeline(name: string, shaderCode: string, options?: {
        vertexEntry?: string;
        fragmentEntry?: string;
        format?: GPUTextureFormat;
        topology?: GPUPrimitiveTopology;
        vertexBuffers?: GPUVertexBufferLayout[];
        depthStencil?: GPUDepthStencilState;
        multisample?: GPUMultisampleState;
        layout?: GPUPipelineLayout | 'auto';
    }): Promise<GPURenderPipeline>;
    /**
     * Get a cached pipeline
     */
    getPipeline(name: string): GPUComputePipeline | GPURenderPipeline | undefined;
    /**
     * Check if pipeline exists
     */
    hasPipeline(name: string): boolean;
    /**
     * Create a buffer
     */
    createBuffer(name: string, size: number, usage: GPUBufferUsageFlags, data?: ArrayBuffer | ArrayBufferView): GPUBuffer;
    /**
     * Create a uniform buffer
     */
    createUniformBuffer(name: string, size: number): GPUBuffer;
    /**
     * Create a storage buffer
     */
    createStorageBuffer(name: string, size: number, data?: ArrayBuffer | ArrayBufferView): GPUBuffer;
    /**
     * Create a vertex buffer
     */
    createVertexBuffer(name: string, data: Float32Array | Uint32Array): GPUBuffer;
    /**
     * Create an index buffer
     */
    createIndexBuffer(name: string, data: Uint16Array | Uint32Array): GPUBuffer;
    /**
     * Update buffer data
     */
    updateBuffer(buffer: GPUBuffer | string, data: ArrayBuffer | ArrayBufferView, offset?: number): void;
    /**
     * Get a named buffer
     */
    getBuffer(name: string): GPUBuffer | undefined;
    /**
     * Create a bind group from buffer descriptors
     */
    createBindGroup(name: string, pipelineName: string, entries: (BufferDescriptor | TextureDescriptor)[], groupIndex?: number): GPUBindGroup;
    /**
     * Dispatch a compute shader
     */
    dispatchCompute(pipelineName: string, bindGroup: GPUBindGroup | string, workgroups: [number, number?, number?]): GPUCommandBuffer;
    /**
     * Hot reload a pipeline with new shader code
     */
    hotReload(pipelineName: string, newShaderCode: string): Promise<void>;
    /**
     * Setup HMR event listeners
     */
    protected setupHMR(): void;
    /**
     * Handle shader update - override in subclasses
     */
    protected onShaderUpdate(file: string, shaderCode: string): void;
    /**
     * Setup GPU error handling
     */
    protected setupErrorHandling(): void;
    /**
     * Dispose all resources
     */
    dispose(): void;
}
export {};
//# sourceMappingURL=base.d.ts.map