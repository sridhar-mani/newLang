interface ThreeShaderMaterial {
    vertexShader: string;
    fragmentShader: string;
    uniforms: Record<string, {
        value: any;
    }>;
    needsUpdate: boolean;
}
/**
 * Shader3D uniform descriptors for Three.js
 */
export interface UniformDescriptor {
    name: string;
    type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat3' | 'mat4' | 'sampler2D' | 'samplerCube';
    value: any;
}
/**
 * Options for Three.js adapter
 */
export interface ThreeJSAdapterOptions {
    /** Auto-inject time uniform */
    autoTime?: boolean;
    /** Auto-inject resolution uniform */
    autoResolution?: boolean;
    /** Auto-inject mouse uniform */
    autoMouse?: boolean;
}
/**
 * Three.js Adapter for Shader3D
 *
 * Bridges Shader3D generated GLSL with Three.js ShaderMaterial
 */
export declare class ThreeJSAdapter {
    private options;
    private uniforms;
    private startTime;
    private animationId?;
    private canvas?;
    private mousePosition;
    constructor(options?: ThreeJSAdapterOptions);
    /**
     * Setup Shadertoy-compatible builtin uniforms
     */
    private setupBuiltinUniforms;
    /**
     * Create Three.js ShaderMaterial from Shader3D GLSL
     *
     * @param vertexShader - GLSL vertex shader code
     * @param fragmentShader - GLSL fragment shader code
     * @param customUniforms - Additional uniforms
     */
    createMaterial(vertexShader: string, fragmentShader: string, customUniforms?: Record<string, UniformDescriptor>): ThreeShaderMaterial;
    /**
     * Inject builtin uniform declarations into shader
     */
    private injectUniforms;
    /**
     * Update builtin uniforms (call in animation loop)
     */
    update(): void;
    /**
     * Set resolution (call on resize)
     */
    setResolution(width: number, height: number): void;
    /**
     * Set mouse position
     */
    setMouse(x: number, y: number): void;
    /**
     * Setup mouse tracking on element
     */
    setupMouseTracking(element: HTMLElement): () => void;
    /**
     * Get uniform value
     */
    getUniform(name: string): any;
    /**
     * Set uniform value
     */
    setUniform(name: string, value: any): void;
    /**
     * Get all uniforms (for Three.js ShaderMaterial)
     */
    getUniforms(): Record<string, {
        value: any;
    }>;
}
/**
 * Create a fullscreen quad geometry (for fragment shader effects)
 *
 * Usage with Three.js:
 * ```js
 * const geometry = createFullscreenQuad();
 * const material = adapter.createMaterial(vertexShader, fragmentShader);
 * const mesh = new THREE.Mesh(geometry, material);
 * ```
 */
export declare function createFullscreenQuadVertices(): Float32Array;
/**
 * Create fullscreen quad UVs
 */
export declare function createFullscreenQuadUVs(): Float32Array;
/**
 * Standard vertex shader for fullscreen effects
 * Works with Shader3D fragment shaders
 */
export declare const FULLSCREEN_VERTEX_SHADER = "#version 300 es\nprecision highp float;\n\nin vec3 position;\nin vec2 uv;\n\nout vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  gl_Position = vec4(position, 1.0);\n}\n";
/**
 * Convert Shadertoy-style mainImage to Three.js compatible fragment shader
 */
export declare function convertShadertoyFragment(shadertoyCode: string): string;
/**
 * Common Three.js includes that Shader3D shaders can use
 */
export declare const THREE_SHADER_CHUNKS: {
    common: string;
    noise: string;
    sdf: string;
};
/**
 * Create Three.js adapter
 */
export declare function createThreeJSAdapter(options?: ThreeJSAdapterOptions): ThreeJSAdapter;
export {};
//# sourceMappingURL=threejs.d.ts.map