import type { Shader3DAST, SourceLocation } from './ast';
/**
 * Validation error severity
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';
/**
 * Validation error/warning
 */
export interface ValidationError {
    severity: ValidationSeverity;
    message: string;
    location?: SourceLocation;
    code: string;
    suggestion?: string;
}
/**
 * Validation options
 */
export interface ValidationOptions {
    /** Enable strict mode (more checks) */
    strict?: boolean;
    /** Check for performance issues */
    performance?: boolean;
    /** Check for WebGPU compatibility */
    webgpuCompat?: boolean;
}
/**
 * Shader3D AST Validator
 */
export declare class Shader3DValidator {
    private errors;
    private options;
    private typeMap;
    constructor(options?: ValidationOptions);
    validate(ast: Shader3DAST): ValidationError[];
    private validateType;
    private validateField;
    private checkFieldAlignment;
    private validateShader;
    private validateVertexShader;
    private validateFragmentShader;
    private validateComputeShader;
    private validateParameter;
    private validateGlobals;
    private validateCrossReferences;
    private isValidType;
    private getTypeAlignment;
    private typeToString;
    private addError;
}
/**
 * Validate a Shader3D AST
 */
export declare function validate(ast: Shader3DAST, options?: ValidationOptions): ValidationError[];
/**
 * Quick check if AST has critical errors
 */
export declare function hasErrors(errors: ValidationError[]): boolean;
/**
 * Format validation errors for display
 */
export declare function formatValidationErrors(errors: ValidationError[]): string;
//# sourceMappingURL=validator.d.ts.map