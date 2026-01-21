// AST Types
export * from './ast';
// Parser
export { parse, createParser, Shader3DParser } from './parser';
// Code Generators
export { generateWGSL, WGSLCodeGenerator, compileToWGSL } from './codegen-wgsl';
export { generateJS, JSCodeGenerator } from './codegen-js';
export { generateGLSLVertex, generateGLSLFragment, generateThreeJSShader, GLSLCodeGenerator } from './codegen-glsl';
// Validator
export { validate, hasErrors, formatValidationErrors, Shader3DValidator } from './validator';
// Strict Mode
export { checkStrictMode, getStrictModeDefaults, parseStrictModeComment, StrictModeChecker } from './strict-mode';
// Source Maps
export { SourceMapGenerator, createSourceMapGenerator, mergeSourceMaps, appendSourceMap } from './source-maps';
// Main Transpiler API
export { transpile, transpileToJS, transpileToWGSL, createTranspiler, Shader3DTranspiler } from './transpiler';
// Version
export const VERSION = '0.1.0';
// Default export for convenience
import { transpile, transpileToJS, transpileToWGSL } from './transpiler';
export default {
    transpile,
    transpileToJS,
    transpileToWGSL,
    VERSION: '0.1.0'
};
//# sourceMappingURL=index.js.map