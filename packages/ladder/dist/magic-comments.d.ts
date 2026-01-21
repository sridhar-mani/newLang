import * as ts from 'typescript';
/**
 * Magic comment directive types
 */
export interface MagicCommentDirective {
    type: 'compute' | 'vertex' | 'fragment';
    name?: string;
    workgroupSize?: number;
    target: string;
    location: {
        line: number;
        column: number;
    };
    options: Record<string, string>;
}
/**
 * Parse magic comments from source code
 */
export declare class MagicCommentParser {
    private sourceFile;
    private sourceText;
    constructor(source: string, filename: string);
    /**
     * Extract all magic comment directives
     */
    parse(): MagicCommentDirective[];
    /**
     * Check if source has any magic comments
     */
    hasMagicComments(): boolean;
    /**
     * Extract directive from a function node
     */
    private extractDirective;
    /**
     * Get function name from node
     */
    private getFunctionName;
}
/**
 * Convert JavaScript function to WGSL
 */
export declare class JSToWGSLConverter {
    /**
     * Convert a JavaScript function to WGSL
     */
    convert(func: ts.FunctionDeclaration, directive: MagicCommentDirective): string;
    /**
     * Generate WGSL parameters
     */
    private generateParameters;
    /**
     * Generate return type
     */
    private generateReturnType;
    /**
     * Infer WGSL type from JS parameter
     */
    private inferWGSLType;
    /**
     * Convert JavaScript function body to WGSL
     */
    private convertBody;
}
/**
 * Quick check for magic comments in source
 */
export declare function hasMagicComments(source: string): boolean;
/**
 * Parse magic comments from source
 */
export declare function parseMagicComments(source: string, filename: string): MagicCommentDirective[];
/**
 * Convert magic-commented JS to WGSL
 */
export declare function convertMagicToWGSL(source: string, filename: string): string;
//# sourceMappingURL=magic-comments.d.ts.map