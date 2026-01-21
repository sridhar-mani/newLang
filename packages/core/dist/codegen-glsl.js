import { BUILTIN_UNIFORMS } from './ast';
export class GLSLCodeGenerator {
    options;
    output = [];
    constructor(options = {}) {
        this.options = {
            version: '300 es',
            threejs: false,
            precision: 'highp',
            ...options
        };
    }
    generateVertex(ast) {
        const vertexShaders = ast.gpuShaders.filter(s => s.stage === 'vertex');
        if (vertexShaders.length === 0)
            return '';
        this.output = [];
        this.emitHeader();
        this.emitStructs(ast.sharedTypes);
        this.emitBuiltinUniforms();
        this.emitShader(vertexShaders[0], 'vertex');
        return this.output.join('\n');
    }
    generateFragment(ast) {
        const fragmentShaders = ast.gpuShaders.filter(s => s.stage === 'fragment');
        if (fragmentShaders.length === 0)
            return '';
        this.output = [];
        this.emitHeader();
        this.emitStructs(ast.sharedTypes);
        this.emitBuiltinUniforms();
        this.emitShader(fragmentShaders[0], 'fragment');
        return this.output.join('\n');
    }
    emitHeader() {
        if (this.options.version === '300 es') {
            this.emit('#version 300 es');
        }
        this.emit(`precision ${this.options.precision} float;`);
        this.emit('');
    }
    emitStructs(types) {
        types.forEach(type => {
            this.emit(`struct ${type.name} {`);
            type.fields.forEach(field => {
                const glslType = this.typeToGLSL(field.type);
                this.emit(`  ${glslType} ${field.name};`);
            });
            this.emit('};');
            this.emit('');
        });
    }
    emitBuiltinUniforms() {
        this.emit('// Shader3D built-in uniforms');
        BUILTIN_UNIFORMS.forEach(uniform => {
            const glslType = this.typeToGLSL(uniform.type);
            this.emit(`uniform ${glslType} ${uniform.name};`);
        });
        this.emit('');
    }
    emitShader(shader, stage) {
        // Convert parameters to in/out declarations
        shader.parameters.forEach(param => {
            const isBuiltin = param.attributes.some(a => a.name === 'builtin');
            if (!isBuiltin) {
                const location = param.attributes.find(a => a.name === 'location')?.value || '0';
                const qualifier = stage === 'vertex' ? 'in' : 'in';
                const glslType = this.typeToGLSL(param.type);
                if (this.options.version === '300 es') {
                    this.emit(`layout(location = ${location}) ${qualifier} ${glslType} ${param.name};`);
                }
                else {
                    this.emit(`${qualifier === 'in' ? 'attribute' : 'varying'} ${glslType} ${param.name};`);
                }
            }
        });
        // Output declarations for fragment shader
        if (stage === 'fragment' && shader.returnType) {
            const location = shader.returnType.attributes.find(a => a.name === 'location')?.value || '0';
            if (this.options.version === '300 es') {
                this.emit(`layout(location = ${location}) out vec4 fragColor;`);
            }
        }
        this.emit('');
        // Main function
        this.emit('void main() {');
        // Convert body
        let body = this.convertBody(shader.body, stage);
        body.split('\n').forEach(line => {
            if (line.trim()) {
                this.emit('  ' + line.trim());
            }
        });
        this.emit('}');
    }
    convertBody(body, stage) {
        let converted = body.trim();
        // Remove braces
        if (converted.startsWith('{'))
            converted = converted.slice(1);
        if (converted.endsWith('}'))
            converted = converted.slice(0, -1);
        // WGSL to GLSL conversions
        converted = converted
            // var -> type (need to infer type)
            .replace(/\bvar\s+/g, '')
            // let -> const (GLSL uses const for immutable)
            .replace(/\blet\s+/g, 'const ')
            // Type suffixes: f32 -> float, etc.
            .replace(/:\s*f32\b/g, ': float')
            .replace(/:\s*i32\b/g, ': int')
            .replace(/:\s*u32\b/g, ': uint')
            .replace(/:\s*bool\b/g, ': bool')
            // Vector constructors: vec4<f32>(x,y,z,w) -> vec4(x,y,z,w)
            .replace(/vec(\d)<\w+>/g, 'vec$1')
            // Matrix constructors
            .replace(/mat(\d)x(\d)<\w+>/g, 'mat$1')
            // select(a, b, c) -> mix or ternary
            .replace(/select\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/g, '($3 ? $2 : $1)')
            // Return statement for fragment shader
            .replace(/return\s+(vec4[^;]+);/g, stage === 'fragment' ? 'fragColor = $1;' : 'gl_Position = $1;')
            // gl_Position for vertex
            .replace(/@builtin\(position\)/g, 'gl_Position')
            // arrayLength -> .length()
            .replace(/arrayLength\s*\(\s*&(\w+)\s*\)/g, '$1.length()');
        return converted;
    }
    typeToGLSL(type) {
        switch (type.kind) {
            case 'primitive':
                const map = {
                    'f32': 'float',
                    'i32': 'int',
                    'u32': 'uint',
                    'bool': 'bool',
                    'number': 'float',
                    'boolean': 'bool'
                };
                return map[type.name] || 'float';
            case 'vector':
                const prefix = type.elementType === 'i32' ? 'i' :
                    type.elementType === 'u32' ? 'u' :
                        type.elementType === 'bool' ? 'b' : '';
                return `${prefix}vec${type.size}`;
            case 'matrix':
                return `mat${type.rows}${type.rows !== type.cols ? 'x' + type.cols : ''}`;
            case 'array':
                const elemType = this.typeToGLSL(type.elementType);
                return type.size ? `${elemType}[${type.size}]` : `${elemType}[]`;
            case 'texture':
                if (type.textureType === 'texture_2d')
                    return 'sampler2D';
                if (type.textureType === 'texture_3d')
                    return 'sampler3D';
                if (type.textureType === 'texture_cube')
                    return 'samplerCube';
                return 'sampler2D';
            case 'sampler':
                return ''; // Samplers are combined with textures in GLSL
            case 'custom':
                return type.name;
            default:
                return 'float';
        }
    }
    emit(line) {
        this.output.push(line);
    }
}
/**
 * Generate GLSL vertex shader from AST
 */
export function generateGLSLVertex(ast, options) {
    const generator = new GLSLCodeGenerator(options);
    return generator.generateVertex(ast);
}
/**
 * Generate GLSL fragment shader from AST
 */
export function generateGLSLFragment(ast, options) {
    const generator = new GLSLCodeGenerator(options);
    return generator.generateFragment(ast);
}
/**
 * Generate three.js ShaderMaterial compatible code
 */
export function generateThreeJSShader(ast) {
    const options = { version: '300 es', threejs: true };
    return {
        vertexShader: generateGLSLVertex(ast, options),
        fragmentShader: generateGLSLFragment(ast, options)
    };
}
//# sourceMappingURL=codegen-glsl.js.map