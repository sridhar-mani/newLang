import type { WGSLCodeGenOptions } from './codegen-wgsl';
import type { JSCodeGenOptions } from './codegen-js';
import type { GLSLCodeGenOptions } from './codegen-glsl';
import type { Shader3DAST } from './ast';
import type { ValidationError, ValidationOptions } from './validator';
import type { StrictModeOptions } from './strict-mode';
import type { SourceMapV3 } from './source-maps';
/**
 * Transpile options combining all sub-options
 */
export interface TranspileOptions {
    /** Validation options */
    validate?: boolean | ValidationOptions;
    /** Generate source maps */
    sourceMap?: boolean;
    /** WGSL code generation options */
    wgsl?: WGSLCodeGenOptions;
    /** JavaScript code generation options */
    js?: JSCodeGenOptions;
    /** GLSL code generation options (for WebGL fallback) */
    glsl?: GLSLCodeGenOptions;
    /** Strict mode options */
    strict?: boolean | StrictModeOptions;
    /** Target outputs */
    targets?: ('wgsl' | 'js' | 'glsl')[];
    /** Include debug comments in output */
    debug?: boolean;
}
/**
 * Transpile result
 */
export interface TranspileResult {
    /** Generated JavaScript/TypeScript code */
    js: string;
    /** Generated WGSL code */
    wgsl: string;
    /** Generated GLSL vertex shader (if requested) */
    glslVertex?: string;
    /** Generated GLSL fragment shader (if requested) */
    glslFragment?: string;
    /** Parsed AST */
    ast: Shader3DAST;
    /** Validation and strict mode errors */
    errors?: ValidationError[];
    /** Source map (if requested) */
    sourceMap?: SourceMapV3;
    /** Compilation stats */
    stats?: {
        parseTime: number;
        validateTime: number;
        generateTime: number;
        totalTime: number;
    };
}
/**
 * Main Shader3D Transpiler class
 */
export declare class Shader3DTranspiler {
    private defaultOptions;
    constructor(options?: TranspileOptions);
    /**
     * Transpile source code to all outputs
     */
    transpile(source: string, filename: string, options?: TranspileOptions): TranspileResult;
    /**
     * Transpile and return only JavaScript
     */
    transpileToJS(source: string, filename: string, options?: TranspileOptions): string;
    /**
     * Transpile and return only WGSL
     */
    transpileToWGSL(source: string, filename: string, options?: TranspileOptions): string;
    /**
     * Generate source map for transpilation
     */
    private generateSourceMap;
    /**
     * Format errors for display
     */
    private formatErrors;
}
/**
 * Transpile source code (convenience function)
 */
export declare function transpile(source: string, filename: string, options?: TranspileOptions): TranspileResult;
/**
 * Transpile to JavaScript only
 */
export declare function transpileToJS(source: string, filename: string, options?: TranspileOptions): string;
/**
 * Transpile to WGSL only
 */
export declare function transpileToWGSL(source: string, filename: string, options?: TranspileOptions): string;
/**
 * Create a new transpiler instance with custom defaults
 */
export declare function createTranspiler(options?: TranspileOptions): Shader3DTranspiler;
//# sourceMappingURL=transpiler.d.ts.map