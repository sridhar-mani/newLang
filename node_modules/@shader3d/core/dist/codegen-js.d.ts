import type { Shader3DAST } from './ast';
export interface JSCodeGenOptions {
    /** Output format: 'esm' | 'cjs' | 'iife' */
    format?: 'esm' | 'cjs' | 'iife';
    /** Include TypeScript types */
    typescript?: boolean;
    /** Generate React hooks */
    react?: boolean;
    /** Module name for IIFE format */
    moduleName?: string;
    /** Embed WGSL as string or import from file */
    embedWGSL?: boolean;
}
export declare class JSCodeGenerator {
    private options;
    private output;
    constructor(options?: JSCodeGenOptions);
    generate(ast: Shader3DAST, wgslCode: string): string;
    private generateImports;
    private generateTypeExports;
    private generateEmbeddedWGSL;
    private generateUniformHelpers;
    private generateStructWriter;
    private emitFieldWriter;
    private generatePipelineFactories;
    private generateReactHooks;
    private generateExports;
    private typeToTS;
    private calculateByteSize;
    private getTypeInfo;
    private capitalize;
    private emit;
}
/**
 * Generate JavaScript/TypeScript code from AST and WGSL
 */
export declare function generateJS(ast: Shader3DAST, wgslCode: string, options?: JSCodeGenOptions): string;
//# sourceMappingURL=codegen-js.d.ts.map