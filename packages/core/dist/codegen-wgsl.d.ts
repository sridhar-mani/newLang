import type { Shader3DAST } from './ast';
export interface WGSLCodeGenOptions {
    /** Include builtin uniforms (time, resolution, mouse) */
    builtinUniforms?: boolean;
    /** Minify output */
    minify?: boolean;
    /** Add debug comments */
    debug?: boolean;
    /** Bind group for builtin uniforms */
    builtinGroup?: number;
}
export declare class WGSLCodeGenerator {
    private options;
    private indentLevel;
    private output;
    constructor(options?: WGSLCodeGenOptions);
    generate(ast: Shader3DAST): string;
    private hasShaders;
    private generateBuiltinUniforms;
    private generateStruct;
    private generateFieldAttributes;
    private generateGlobal;
    private generateShader;
    private generateParameters;
    private generateReturnType;
    private typeToWGSL;
    private primitiveToWGSL;
    private convertBodyToWGSL;
    private emit;
}
/**
 * Generate WGSL code from AST
 */
export declare function generateWGSL(ast: Shader3DAST, options?: WGSLCodeGenOptions): string;
/**
 * Generate WGSL from source code directly
 */
export declare function compileToWGSL(source: string, filename: string, options?: WGSLCodeGenOptions): Promise<string>;
//# sourceMappingURL=codegen-wgsl.d.ts.map