import { parse } from './parser';
import { generateWGSL } from './codegen-wgsl';
import { generateJS } from './codegen-js';
import { generateGLSLVertex, generateGLSLFragment } from './codegen-glsl';
import { validate, hasErrors } from './validator';
import { checkStrictMode, parseStrictModeComment } from './strict-mode';
import { SourceMapGenerator, appendSourceMap } from './source-maps';
/**
 * Main Shader3D Transpiler class
 */
export class Shader3DTranspiler {
    defaultOptions;
    constructor(options = {}) {
        this.defaultOptions = options;
    }
    /**
     * Transpile source code to all outputs
     */
    transpile(source, filename, options) {
        const opts = { ...this.defaultOptions, ...options };
        const startTime = performance.now();
        const stats = { parseTime: 0, validateTime: 0, generateTime: 0, totalTime: 0 };
        // 1. Parse source to AST
        const parseStart = performance.now();
        const ast = parse(source, filename, {
            sourceLocations: opts.sourceMap
        });
        stats.parseTime = performance.now() - parseStart;
        // 2. Check for strict mode comments in source
        const strictMatch = source.match(/\/\/\s*@shader3d-(strict|typed).*/);
        let strictOptions = opts.strict;
        if (strictMatch) {
            const parsed = parseStrictModeComment(strictMatch[0]);
            if (parsed) {
                strictOptions = typeof opts.strict === 'object'
                    ? { ...parsed, ...opts.strict }
                    : parsed;
            }
        }
        // 3. Validate AST
        const validateStart = performance.now();
        const errors = [];
        if (opts.validate !== false) {
            const validationOptions = typeof opts.validate === 'object' ? opts.validate : {};
            errors.push(...validate(ast, validationOptions));
        }
        // 4. Run strict mode checks
        if (strictOptions) {
            const strictOpts = typeof strictOptions === 'object' ? strictOptions : { level: 'strict' };
            errors.push(...checkStrictMode(ast, strictOpts));
        }
        stats.validateTime = performance.now() - validateStart;
        // Check for critical errors
        if (hasErrors(errors)) {
            return {
                js: '',
                wgsl: '',
                ast,
                errors,
                stats
            };
        }
        // 5. Generate output code
        const generateStart = performance.now();
        // Generate WGSL
        const wgslOptions = {
            debug: opts.debug,
            ...opts.wgsl
        };
        const wgsl = generateWGSL(ast, wgslOptions);
        // Generate JavaScript
        const jsOptions = {
            ...opts.js
        };
        let js = generateJS(ast, wgsl, jsOptions);
        // Generate GLSL (if requested)
        let glslVertex;
        let glslFragment;
        const targets = opts.targets || ['wgsl', 'js'];
        if (targets.includes('glsl')) {
            const glslOptions = opts.glsl || {};
            glslVertex = generateGLSLVertex(ast, glslOptions);
            glslFragment = generateGLSLFragment(ast, glslOptions);
        }
        stats.generateTime = performance.now() - generateStart;
        // 6. Generate source map
        let sourceMap;
        if (opts.sourceMap) {
            sourceMap = this.generateSourceMap(ast, filename, wgsl, js);
            js = appendSourceMap(js, sourceMap);
        }
        stats.totalTime = performance.now() - startTime;
        return {
            js,
            wgsl,
            glslVertex,
            glslFragment,
            ast,
            errors: errors.length > 0 ? errors : undefined,
            sourceMap,
            stats
        };
    }
    /**
     * Transpile and return only JavaScript
     */
    transpileToJS(source, filename, options) {
        const result = this.transpile(source, filename, options);
        if (hasErrors(result.errors || [])) {
            throw new Error(`Compilation failed:\n${this.formatErrors(result.errors)}`);
        }
        return result.js;
    }
    /**
     * Transpile and return only WGSL
     */
    transpileToWGSL(source, filename, options) {
        const result = this.transpile(source, filename, options);
        if (hasErrors(result.errors || [])) {
            throw new Error(`Compilation failed:\n${this.formatErrors(result.errors)}`);
        }
        return result.wgsl;
    }
    /**
     * Generate source map for transpilation
     */
    generateSourceMap(ast, filename, _wgsl, _js) {
        const generator = new SourceMapGenerator(filename.replace(/\.[^.]+$/, '.js'));
        // Add source content
        if (ast.source) {
            generator.addSource(ast.source.filename, ast.source.content);
        }
        // Map shader definitions to output
        let wgslLine = 1;
        ast.gpuShaders.forEach(shader => {
            if (shader.location) {
                generator.addLocationMapping(wgslLine, 0, shader.location, shader.name);
            }
            // Estimate lines in output (rough approximation)
            const shaderLines = shader.body.split('\n').length + 5;
            wgslLine += shaderLines;
        });
        // Map type definitions
        ast.sharedTypes.forEach(type => {
            if (type.location) {
                generator.addLocationMapping(1, 0, type.location, type.name);
            }
        });
        return generator.generate();
    }
    /**
     * Format errors for display
     */
    formatErrors(errors) {
        return errors.map(err => {
            const loc = err.location
                ? `${err.location.file}:${err.location.line}:${err.location.column}`
                : '';
            const prefix = `[${err.code}] ${err.severity.toUpperCase()}`;
            return `${prefix} ${loc}\n  ${err.message}`;
        }).join('\n\n');
    }
}
// Singleton instance
const defaultTranspiler = new Shader3DTranspiler();
/**
 * Transpile source code (convenience function)
 */
export function transpile(source, filename, options) {
    return defaultTranspiler.transpile(source, filename, options);
}
/**
 * Transpile to JavaScript only
 */
export function transpileToJS(source, filename, options) {
    return defaultTranspiler.transpileToJS(source, filename, options);
}
/**
 * Transpile to WGSL only
 */
export function transpileToWGSL(source, filename, options) {
    return defaultTranspiler.transpileToWGSL(source, filename, options);
}
/**
 * Create a new transpiler instance with custom defaults
 */
export function createTranspiler(options) {
    return new Shader3DTranspiler(options);
}
//# sourceMappingURL=transpiler.js.map