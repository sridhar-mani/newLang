import type { Shader3DAST } from './ast';
export interface GLSLCodeGenOptions {
    /** GLSL version: '300 es' (WebGL2) or '100' (WebGL1) */
    version?: '300 es' | '100';
    /** Generate for three.js ShaderMaterial */
    threejs?: boolean;
    /** Include precision specifiers */
    precision?: 'lowp' | 'mediump' | 'highp';
}
export declare class GLSLCodeGenerator {
    private options;
    private output;
    constructor(options?: GLSLCodeGenOptions);
    generateVertex(ast: Shader3DAST): string;
    generateFragment(ast: Shader3DAST): string;
    private emitHeader;
    private emitStructs;
    private emitBuiltinUniforms;
    private emitShader;
    private convertBody;
    private typeToGLSL;
    private emit;
}
/**
 * Generate GLSL vertex shader from AST
 */
export declare function generateGLSLVertex(ast: Shader3DAST, options?: GLSLCodeGenOptions): string;
/**
 * Generate GLSL fragment shader from AST
 */
export declare function generateGLSLFragment(ast: Shader3DAST, options?: GLSLCodeGenOptions): string;
/**
 * Generate three.js ShaderMaterial compatible code
 */
export declare function generateThreeJSShader(ast: Shader3DAST): {
    vertexShader: string;
    fragmentShader: string;
};
//# sourceMappingURL=codegen-glsl.d.ts.map