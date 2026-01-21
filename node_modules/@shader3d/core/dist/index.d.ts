export * from './ast';
export { parse, createParser, Shader3DParser } from './parser';
export type { ParseOptions } from './parser';
export { generateWGSL, WGSLCodeGenerator, compileToWGSL } from './codegen-wgsl';
export type { WGSLCodeGenOptions } from './codegen-wgsl';
export { generateJS, JSCodeGenerator } from './codegen-js';
export type { JSCodeGenOptions } from './codegen-js';
export { generateGLSLVertex, generateGLSLFragment, generateThreeJSShader, GLSLCodeGenerator } from './codegen-glsl';
export type { GLSLCodeGenOptions } from './codegen-glsl';
export { validate, hasErrors, formatValidationErrors, Shader3DValidator } from './validator';
export type { ValidationError, ValidationSeverity, ValidationOptions } from './validator';
export { checkStrictMode, getStrictModeDefaults, parseStrictModeComment, StrictModeChecker } from './strict-mode';
export type { StrictLevel, StrictModeOptions } from './strict-mode';
export { SourceMapGenerator, createSourceMapGenerator, mergeSourceMaps, appendSourceMap } from './source-maps';
export type { SourcePosition, SourceMapping, SourceMapV3 } from './source-maps';
export { transpile, transpileToJS, transpileToWGSL, createTranspiler, Shader3DTranspiler } from './transpiler';
export type { TranspileOptions, TranspileResult } from './transpiler';
export declare const VERSION = "0.1.0";
import { transpile, transpileToJS, transpileToWGSL } from './transpiler';
declare const _default: {
    transpile: typeof transpile;
    transpileToJS: typeof transpileToJS;
    transpileToWGSL: typeof transpileToWGSL;
    VERSION: string;
};
export default _default;
//# sourceMappingURL=index.d.ts.map