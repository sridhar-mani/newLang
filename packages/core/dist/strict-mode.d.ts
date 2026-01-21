import type { Shader3DAST, TypeReference } from './ast';
import type { ValidationError } from './validator';
/**
 * Strict mode levels (like TypeScript's strictness ladder)
 */
export type StrictLevel = 'off' | 'basic' | 'standard' | 'strict' | 'pedantic';
/**
 * Strict mode options (like tsconfig.json)
 */
export interface StrictModeOptions {
    /** Overall strict level */
    level?: StrictLevel;
    /** Individual flags (like TypeScript) */
    noImplicitAny?: boolean;
    strictNullChecks?: boolean;
    strictPropertyInitialization?: boolean;
    noUnusedLocals?: boolean;
    noUnusedParameters?: boolean;
    noImplicitReturns?: boolean;
    noFallthroughCasesInSwitch?: boolean;
    /** Shader3D-specific */
    strictAlignment?: boolean;
    strictBindings?: boolean;
    strictWorkgroupSize?: boolean;
    noImplicitFloat?: boolean;
}
/**
 * Type inference result
 */
export interface InferredType {
    type: TypeReference;
    confidence: 'certain' | 'inferred' | 'unknown';
    source?: string;
}
/**
 * Strict mode type checker
 */
export declare class StrictModeChecker {
    private options;
    private errors;
    private typeMap;
    private inferredTypes;
    constructor(options?: StrictModeOptions);
    /**
     * Expand strict level to individual flags
     */
    private expandLevel;
    /**
     * Check AST with strict mode rules
     */
    check(ast: Shader3DAST): ValidationError[];
    private checkShader;
    private checkParameter;
    private checkReturns;
    private checkWorkgroupSize;
    private checkBindings;
    private checkBody;
    private checkAlignmentInBody;
    private typeToString;
    private addError;
}
/**
 * Run strict mode checks on AST
 */
export declare function checkStrictMode(ast: Shader3DAST, options?: StrictModeOptions): ValidationError[];
/**
 * Get default strict mode options for a level
 */
export declare function getStrictModeDefaults(level: StrictLevel): StrictModeOptions;
/**
 * Parse strict mode from magic comment
 * e.g., // @shader3d-strict
 * e.g., // @shader3d-strict noImplicitAny
 */
export declare function parseStrictModeComment(comment: string): StrictModeOptions | null;
//# sourceMappingURL=strict-mode.d.ts.map