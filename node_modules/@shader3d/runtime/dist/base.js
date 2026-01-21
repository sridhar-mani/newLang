/**
 * Abstract base class for Shader3D runtimes
 * Handles GPU resource management, pipeline caching, and HMR
 */
export class Shader3DRuntime {
    device;
    pipelines = new Map();
    bindGroups = new Map();
    buffers = new Map();
    _disposed = false;
    constructor(device) {
        this.device = device;
        this.setupHMR();
        this.setupErrorHandling();
    }
    /**
     * Get the GPU device
     */
    getDevice() {
        return this.device;
    }
    /**
     * Check if runtime has been disposed
     */
    isDisposed() {
        return this._disposed;
    }
    // =====================
    // Pipeline Management
    // =====================
    /**
     * Create a compute pipeline
     */
    async createComputePipeline(name, shaderCode, entryPoint = 'main', layout) {
        const module = this.device.createShaderModule({
            label: `${name}_module`,
            code: shaderCode
        });
        const pipeline = await this.device.createComputePipelineAsync({
            label: name,
            layout: layout || 'auto',
            compute: {
                module,
                entryPoint
            }
        });
        this.pipelines.set(name, {
            pipeline,
            bindGroupLayout: pipeline.getBindGroupLayout(0),
            timestamp: Date.now(),
            source: shaderCode
        });
        return pipeline;
    }
    /**
     * Create a render pipeline
     */
    async createRenderPipeline(name, shaderCode, options = {}) {
        const { vertexEntry = 'vs_main', fragmentEntry = 'fs_main', format = navigator.gpu.getPreferredCanvasFormat(), topology = 'triangle-list', vertexBuffers = [], depthStencil, multisample, layout = 'auto' } = options;
        const module = this.device.createShaderModule({
            label: `${name}_module`,
            code: shaderCode
        });
        const pipelineDescriptor = {
            label: name,
            layout,
            vertex: {
                module,
                entryPoint: vertexEntry,
                buffers: vertexBuffers
            },
            fragment: {
                module,
                entryPoint: fragmentEntry,
                targets: [{ format }]
            },
            primitive: {
                topology,
                cullMode: 'none'
            }
        };
        if (depthStencil) {
            pipelineDescriptor.depthStencil = depthStencil;
        }
        if (multisample) {
            pipelineDescriptor.multisample = multisample;
        }
        const pipeline = await this.device.createRenderPipelineAsync(pipelineDescriptor);
        this.pipelines.set(name, {
            pipeline,
            bindGroupLayout: pipeline.getBindGroupLayout(0),
            timestamp: Date.now(),
            source: shaderCode
        });
        return pipeline;
    }
    /**
     * Get a cached pipeline
     */
    getPipeline(name) {
        return this.pipelines.get(name)?.pipeline;
    }
    /**
     * Check if pipeline exists
     */
    hasPipeline(name) {
        return this.pipelines.has(name);
    }
    // =====================
    // Buffer Management
    // =====================
    /**
     * Create a buffer
     */
    createBuffer(name, size, usage, data) {
        const buffer = this.device.createBuffer({
            label: name,
            size,
            usage,
            mappedAtCreation: !!data
        });
        if (data) {
            const mapped = buffer.getMappedRange();
            if (data instanceof ArrayBuffer) {
                new Uint8Array(mapped).set(new Uint8Array(data));
            }
            else {
                new Uint8Array(mapped).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
            }
            buffer.unmap();
        }
        this.buffers.set(name, buffer);
        return buffer;
    }
    /**
     * Create a uniform buffer
     */
    createUniformBuffer(name, size) {
        // Ensure 16-byte alignment for uniform buffers
        const alignedSize = Math.ceil(size / 16) * 16;
        return this.createBuffer(name, alignedSize, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
    }
    /**
     * Create a storage buffer
     */
    createStorageBuffer(name, size, data) {
        return this.createBuffer(name, size, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC, data);
    }
    /**
     * Create a vertex buffer
     */
    createVertexBuffer(name, data) {
        return this.createBuffer(name, data.byteLength, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, data);
    }
    /**
     * Create an index buffer
     */
    createIndexBuffer(name, data) {
        return this.createBuffer(name, data.byteLength, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, data);
    }
    /**
     * Update buffer data
     */
    updateBuffer(buffer, data, offset = 0) {
        const gpuBuffer = typeof buffer === 'string' ? this.buffers.get(buffer) : buffer;
        if (!gpuBuffer) {
            throw new Error(`Buffer not found: ${buffer}`);
        }
        this.device.queue.writeBuffer(gpuBuffer, offset, data);
    }
    /**
     * Get a named buffer
     */
    getBuffer(name) {
        return this.buffers.get(name);
    }
    // =====================
    // Bind Group Management
    // =====================
    /**
     * Create a bind group from buffer descriptors
     */
    createBindGroup(name, pipelineName, entries, groupIndex = 0) {
        const cached = this.pipelines.get(pipelineName);
        if (!cached) {
            throw new Error(`Pipeline '${pipelineName}' not found`);
        }
        const layout = cached.pipeline.getBindGroupLayout(groupIndex);
        const bindGroupEntries = entries.map(entry => {
            if ('buffer' in entry) {
                return {
                    binding: entry.binding,
                    resource: {
                        buffer: entry.buffer,
                        offset: entry.offset || 0,
                        size: entry.size || entry.buffer.size
                    }
                };
            }
            else {
                // Texture entry
                const resource = entry.texture instanceof GPUTexture
                    ? entry.texture.createView()
                    : entry.texture;
                return {
                    binding: entry.binding,
                    resource
                };
            }
        });
        const bindGroup = this.device.createBindGroup({
            label: name,
            layout,
            entries: bindGroupEntries
        });
        this.bindGroups.set(name, bindGroup);
        return bindGroup;
    }
    // =====================
    // Dispatch & Render
    // =====================
    /**
     * Dispatch a compute shader
     */
    dispatchCompute(pipelineName, bindGroup, workgroups) {
        const pipeline = this.getPipeline(pipelineName);
        if (!pipeline) {
            throw new Error(`Pipeline '${pipelineName}' not found`);
        }
        const group = typeof bindGroup === 'string'
            ? this.bindGroups.get(bindGroup)
            : bindGroup;
        const encoder = this.device.createCommandEncoder({ label: `compute_${pipelineName}` });
        const pass = encoder.beginComputePass({ label: pipelineName });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, group);
        pass.dispatchWorkgroups(workgroups[0], workgroups[1] || 1, workgroups[2] || 1);
        pass.end();
        const commands = encoder.finish();
        this.device.queue.submit([commands]);
        return commands;
    }
    // =====================
    // HMR Support
    // =====================
    /**
     * Hot reload a pipeline with new shader code
     */
    async hotReload(pipelineName, newShaderCode) {
        const cached = this.pipelines.get(pipelineName);
        if (!cached) {
            console.warn(`Pipeline '${pipelineName}' not found for hot reload`);
            return;
        }
        console.log(`🔄 Hot reloading pipeline: ${pipelineName}`);
        try {
            const isCompute = 'dispatchWorkgroups' in cached.pipeline.constructor.prototype ||
                /@compute/.test(cached.source || '');
            if (isCompute) {
                await this.createComputePipeline(pipelineName, newShaderCode);
            }
            else {
                await this.createRenderPipeline(pipelineName, newShaderCode);
            }
            console.log(`✅ Pipeline ${pipelineName} reloaded`);
        }
        catch (error) {
            console.error(`❌ Failed to reload pipeline ${pipelineName}:`, error);
            throw error;
        }
    }
    /**
     * Setup HMR event listeners
     */
    setupHMR() {
        if (typeof window === 'undefined')
            return;
        window.addEventListener('shader3d:hot-update', ((event) => {
            const { file, wgsl } = event.detail;
            this.onShaderUpdate(file, wgsl);
        }));
    }
    /**
     * Handle shader update - override in subclasses
     */
    onShaderUpdate(file, shaderCode) {
        // Default: try to match file to pipeline name
        const pipelineName = file.split('/').pop()?.replace(/\.[^.]+$/, '');
        if (pipelineName && this.pipelines.has(pipelineName)) {
            this.hotReload(pipelineName, shaderCode);
        }
    }
    // =====================
    // Error Handling
    // =====================
    /**
     * Setup GPU error handling
     */
    setupErrorHandling() {
        this.device.addEventListener('uncapturederror', (event) => {
            console.error('WebGPU Error:', event);
        });
    }
    // =====================
    // Cleanup
    // =====================
    /**
     * Dispose all resources
     */
    dispose() {
        this._disposed = true;
        // Destroy all buffers
        this.buffers.forEach(buffer => buffer.destroy());
        this.buffers.clear();
        // Clear pipeline cache
        this.pipelines.clear();
        // Clear bind groups
        this.bindGroups.clear();
    }
}
//# sourceMappingURL=base.js.map