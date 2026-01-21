import type { Shader3DAST } from './ast';
export interface ParseOptions {
    /** Enable strict type checking mode */
    strict?: boolean;
    /** Extract source locations for error mapping */
    sourceLocations?: boolean;
    /** Parse magic comments in JS files */
    magicComments?: boolean;
}
export declare class Shader3DParser {
    private sourceFile;
    private filename;
    private _options;
    private sourceText;
    constructor(source: string, filename: string, options?: ParseOptions);
    parse(): Shader3DAST;
    private parseImport;
    private parseTypeDefinition;
    private parseTypeAlias;
    private parseClass;
    private tryParseShader;
    private getDecorators;
    private getJSDocShaderStage;
    private getShaderStage;
    private parseParameters;
    private parseJSDocAttributes;
    private parseReturnAttributes;
    private parseGlobalDeclarations;
    private parseTypeReference;
    private getLocation;
}
/**
 * Parse source code into Shader3D AST
 */
export declare function parse(source: string, filename: string, options?: ParseOptions): Shader3DAST;
/**
 * Parse and return the parser instance (for advanced use)
 */
export declare function createParser(source: string, filename: string, options?: ParseOptions): Shader3DParser;
//# sourceMappingURL=parser.d.ts.map