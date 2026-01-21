import * as ts from 'typescript';
export class Shader3DParser {
    sourceFile;
    filename;
    _options;
    sourceText;
    constructor(source, filename, options = {}) {
        this.filename = filename;
        this._options = options;
        this.sourceText = source;
        this.sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    }
    parse() {
        const ast = {
            sharedTypes: [],
            cpuClasses: [],
            gpuShaders: [],
            imports: [],
            globals: [],
            source: {
                filename: this.filename,
                content: this.sourceText
            }
        };
        const visit = (node) => {
            if (ts.isImportDeclaration(node)) {
                ast.imports.push(this.parseImport(node));
            }
            else if (ts.isInterfaceDeclaration(node)) {
                const typeDef = this.parseTypeDefinition(node);
                if (typeDef)
                    ast.sharedTypes.push(typeDef);
            }
            else if (ts.isTypeAliasDeclaration(node)) {
                const typeDef = this.parseTypeAlias(node);
                if (typeDef)
                    ast.sharedTypes.push(typeDef);
            }
            else if (ts.isClassDeclaration(node)) {
                ast.cpuClasses.push(this.parseClass(node));
            }
            else if (ts.isFunctionDeclaration(node)) {
                const shader = this.tryParseShader(node);
                if (shader) {
                    ast.gpuShaders.push(shader);
                }
            }
            else if (ts.isVariableStatement(node)) {
                const globals = this.parseGlobalDeclarations(node);
                if (globals.length > 0) {
                    ast.globals.push(...globals);
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(this.sourceFile);
        return ast;
    }
    parseImport(node) {
        const source = node.moduleSpecifier.text;
        const specifiers = [];
        let isDefault = false;
        let namespace;
        if (node.importClause) {
            // Default import
            if (node.importClause.name) {
                specifiers.push(node.importClause.name.text);
                isDefault = true;
            }
            // Named imports
            if (node.importClause.namedBindings) {
                if (ts.isNamedImports(node.importClause.namedBindings)) {
                    node.importClause.namedBindings.elements.forEach(el => {
                        specifiers.push(el.name.text);
                    });
                }
                else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                    namespace = node.importClause.namedBindings.name.text;
                }
            }
        }
        return { source, specifiers, isDefault, namespace };
    }
    parseTypeDefinition(node) {
        const name = node.name.text;
        const fields = [];
        const location = this.getLocation(node);
        node.members.forEach(member => {
            if (ts.isPropertySignature(member) && member.type) {
                const fieldName = member.name.getText(this.sourceFile);
                fields.push({
                    name: fieldName,
                    type: this.parseTypeReference(member.type),
                    attributes: this.parseJSDocAttributes(member),
                    location: this.getLocation(member)
                });
            }
        });
        return {
            kind: 'struct',
            name,
            fields,
            location
        };
    }
    parseTypeAlias(node) {
        const name = node.name.text;
        const location = this.getLocation(node);
        // Handle type alias to object literal (like struct)
        if (ts.isTypeLiteralNode(node.type)) {
            const fields = [];
            node.type.members.forEach(member => {
                if (ts.isPropertySignature(member) && member.type) {
                    fields.push({
                        name: member.name.getText(this.sourceFile),
                        type: this.parseTypeReference(member.type),
                        attributes: this.parseJSDocAttributes(member),
                        location: this.getLocation(member)
                    });
                }
            });
            return { kind: 'struct', name, fields, location };
        }
        return null;
    }
    parseClass(node) {
        const name = node.name?.text || 'Anonymous';
        const properties = [];
        const methods = [];
        const location = this.getLocation(node);
        node.members.forEach(member => {
            if (ts.isPropertyDeclaration(member)) {
                properties.push({
                    name: member.name.getText(this.sourceFile),
                    type: member.type ? this.parseTypeReference(member.type) : { kind: 'primitive', name: 'f32' },
                    initializer: member.initializer?.getText(this.sourceFile),
                    location: this.getLocation(member)
                });
            }
            else if (ts.isMethodDeclaration(member)) {
                const methodName = member.name.getText(this.sourceFile);
                if (methodName !== 'constructor') {
                    methods.push({
                        name: methodName,
                        parameters: this.parseParameters(member.parameters),
                        returnType: member.type ? this.parseTypeReference(member.type) : undefined,
                        body: member.body?.getText(this.sourceFile) || '',
                        location: this.getLocation(member)
                    });
                }
            }
        });
        return { name, properties, methods, location };
    }
    tryParseShader(node) {
        // Check for decorators or JSDoc comments
        const decorators = this.getDecorators(node);
        const jsDocStage = this.getJSDocShaderStage(node);
        const shaderStage = this.getShaderStage(decorators) || jsDocStage;
        if (!shaderStage) {
            return null;
        }
        const name = node.name?.text || 'anonymous';
        const parameters = this.parseParameters(node.parameters);
        const attributes = decorators.filter(d => d.name !== 'compute' && d.name !== 'vertex' && d.name !== 'fragment');
        const location = this.getLocation(node);
        // Parse workgroup size for compute shaders
        let workgroupSize;
        const workgroupAttr = decorators.find(d => d.name === 'workgroup_size');
        if (workgroupAttr && workgroupAttr.value) {
            const sizes = workgroupAttr.value.split(',').map(s => parseInt(s.trim()));
            workgroupSize = sizes;
        }
        // Parse return type
        let returnType = undefined;
        if (node.type) {
            const returnAttrs = this.parseReturnAttributes(node);
            returnType = {
                type: this.parseTypeReference(node.type),
                attributes: returnAttrs
            };
        }
        return {
            stage: shaderStage,
            name,
            parameters,
            returnType,
            body: node.body?.getText(this.sourceFile) || '',
            attributes,
            location,
            workgroupSize
        };
    }
    getDecorators(node) {
        const decorators = [];
        // Check modifiers for decorators (TypeScript 5.0+)
        const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
        if (modifiers) {
            modifiers.forEach(modifier => {
                if (ts.isDecorator(modifier)) {
                    const expr = modifier.expression;
                    if (ts.isIdentifier(expr)) {
                        decorators.push({ name: expr.text });
                    }
                    else if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression)) {
                        const name = expr.expression.text;
                        const args = expr.arguments.map(arg => arg.getText(this.sourceFile));
                        decorators.push({
                            name,
                            value: args.join(', ')
                        });
                    }
                }
            });
        }
        // Also check JSDoc for attributes
        const jsDocAttrs = this.parseJSDocAttributes(node);
        decorators.push(...jsDocAttrs);
        return decorators;
    }
    getJSDocShaderStage(node) {
        const fullText = node.getFullText(this.sourceFile);
        // Check for @compute, @vertex, @fragment in JSDoc or magic comments
        if (/@compute\b/.test(fullText))
            return 'compute';
        if (/@vertex\b/.test(fullText))
            return 'vertex';
        if (/@fragment\b/.test(fullText))
            return 'fragment';
        // Check for magic comments like /* @3d-shader compute */
        const magicMatch = fullText.match(/\/\*\s*@3d-shader\s+(compute|vertex|fragment)\s*\*\//);
        if (magicMatch) {
            return magicMatch[1];
        }
        return null;
    }
    getShaderStage(decorators) {
        for (const dec of decorators) {
            if (dec.name === 'compute')
                return 'compute';
            if (dec.name === 'vertex')
                return 'vertex';
            if (dec.name === 'fragment')
                return 'fragment';
        }
        return null;
    }
    parseParameters(params) {
        return params.map(param => ({
            name: param.name.getText(this.sourceFile),
            type: param.type ? this.parseTypeReference(param.type) : { kind: 'primitive', name: 'f32' },
            attributes: this.parseJSDocAttributes(param),
            location: this.getLocation(param)
        }));
    }
    parseJSDocAttributes(node) {
        const attributes = [];
        const text = node.getFullText(this.sourceFile);
        // Match WGSL-style attributes: @builtin(position), @location(0), @binding(1), @group(0)
        const attrRegex = /@(builtin|location|binding|group|workgroup_size|align|size|interpolate|invariant)(?:\(([^)]+)\))?/g;
        let match;
        while ((match = attrRegex.exec(text)) !== null) {
            attributes.push({
                name: match[1],
                value: match[2] || undefined
            });
        }
        return attributes;
    }
    parseReturnAttributes(node) {
        const attributes = [];
        if (node.type) {
            const text = node.type.getFullText(this.sourceFile);
            const attrRegex = /@(\w+)(?:\(([^)]+)\))?/g;
            let match;
            while ((match = attrRegex.exec(text)) !== null) {
                attributes.push({
                    name: match[1],
                    value: match[2]
                });
            }
        }
        return attributes;
    }
    parseGlobalDeclarations(node) {
        const globals = [];
        node.declarationList.declarations.forEach(decl => {
            if (!ts.isIdentifier(decl.name))
                return;
            const name = decl.name.text;
            const attrs = this.parseJSDocAttributes(node);
            // Check if it has @group or @binding - that makes it a global
            const groupAttr = attrs.find(a => a.name === 'group');
            const bindingAttr = attrs.find(a => a.name === 'binding');
            if (groupAttr || bindingAttr) {
                globals.push({
                    name,
                    type: decl.type ? this.parseTypeReference(decl.type) : { kind: 'primitive', name: 'f32' },
                    group: groupAttr ? parseInt(groupAttr.value || '0') : 0,
                    binding: bindingAttr ? parseInt(bindingAttr.value || '0') : 0,
                    addressSpace: 'uniform',
                    initialValue: decl.initializer?.getText(this.sourceFile),
                    location: this.getLocation(decl)
                });
            }
        });
        return globals;
    }
    parseTypeReference(type) {
        if (ts.isTypeReferenceNode(type)) {
            const typeName = type.typeName.getText(this.sourceFile);
            // Vector types: vec2, vec3, vec4, vec2<f32>, etc.
            const vecMatch = typeName.match(/^vec([234])(?:<(\w+)>)?$/);
            if (vecMatch) {
                return {
                    kind: 'vector',
                    size: parseInt(vecMatch[1]),
                    elementType: vecMatch[2] || 'f32'
                };
            }
            // Matrix types: mat2x2, mat3x3, mat4x4, etc.
            const matMatch = typeName.match(/^mat(\d)x(\d)(?:<(\w+)>)?$/);
            if (matMatch) {
                return {
                    kind: 'matrix',
                    rows: parseInt(matMatch[1]),
                    cols: parseInt(matMatch[2]),
                    elementType: 'f32'
                };
            }
            // Texture types
            if (typeName.startsWith('texture_')) {
                return {
                    kind: 'texture',
                    textureType: typeName
                };
            }
            // Sampler types
            if (typeName === 'sampler' || typeName === 'sampler_comparison') {
                return {
                    kind: 'sampler',
                    samplerType: typeName
                };
            }
            // Array types with generic: Array<T> or array<T, N>
            if (typeName === 'Array' || typeName === 'array') {
                const args = type.typeArguments;
                if (args && args.length > 0) {
                    const elemType = this.parseTypeReference(args[0]);
                    const size = args.length > 1 ? parseInt(args[1].getText(this.sourceFile)) : undefined;
                    return {
                        kind: 'array',
                        elementType: elemType,
                        size
                    };
                }
            }
            // Custom type (struct, etc.)
            return { kind: 'custom', name: typeName };
        }
        if (ts.isArrayTypeNode(type)) {
            return {
                kind: 'array',
                elementType: this.parseTypeReference(type.elementType)
            };
        }
        // Primitive types
        const text = type.getText(this.sourceFile);
        const primitiveMap = {
            'number': 'number',
            'boolean': 'boolean',
            'f32': 'f32',
            'i32': 'i32',
            'u32': 'u32',
            'bool': 'bool'
        };
        if (text in primitiveMap) {
            return { kind: 'primitive', name: primitiveMap[text] };
        }
        // Fallback
        return { kind: 'primitive', name: 'f32' };
    }
    getLocation(node) {
        const start = this.sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const end = this.sourceFile.getLineAndCharacterOfPosition(node.getEnd());
        return {
            file: this.filename,
            line: start.line + 1,
            column: start.character + 1,
            endLine: end.line + 1,
            endColumn: end.character + 1
        };
    }
}
/**
 * Parse source code into Shader3D AST
 */
export function parse(source, filename, options) {
    const parser = new Shader3DParser(source, filename, options);
    return parser.parse();
}
/**
 * Parse and return the parser instance (for advanced use)
 */
export function createParser(source, filename, options) {
    return new Shader3DParser(source, filename, options);
}
//# sourceMappingURL=parser.js.map