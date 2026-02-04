# Shader3D Compiler Architecture

This document explains how Shader3D transforms TypeScript-like shader code into valid WGSL for WebGPU.

## Pipeline Overview

```
┌─────────────┐    ┌─────────┐    ┌────────────┐    ┌─────────────┐    ┌──────┐
│ Source Code │ -> │  Lexer  │ -> │   Parser   │ -> │ Transformer │ -> │ WGSL │
│  (.shader3d)│    │ (tokens)│    │   (AST)    │    │  (CodeGen)  │    │      │
└─────────────┘    └─────────┘    └────────────┘    └─────────────┘    └──────┘
```

## Stages

### 1. Lexer

The lexer (`parser.ts` - `Lexer` class) tokenizes the input source into:

- **Keywords**: `function`, `const`, `var`, `let`, `if`, `else`, `for`, `while`, `return`, `struct`
- **Identifiers**: Variable names, type names, function names
- **Types**: `vec2f`, `vec3f`, `vec4f`, `mat4x4`, `f32`, `i32`, `u32`, etc.
- **Operators**: Arithmetic (`+`, `-`, `*`, `/`), comparison (`<`, `>`, `==`), assignment (`=`)
- **Decorators**: `@vertex`, `@fragment`, `@compute`, `@builtin`, `@location`, `@group`, `@binding`
- **Punctuation**: Braces, parentheses, semicolons, commas
- **Literals**: Numbers (integer and float), strings

### 2. Parser

The parser (`parser.ts` - `Parser` class) builds an Abstract Syntax Tree (AST) containing:

- **Program**: Root node containing all declarations
- **FunctionDeclaration**: Functions with decorators, parameters, return type, and body
- **StructDeclaration**: Custom struct types with typed fields
- **VariableDeclaration**: `const`/`var`/`let` with optional type annotation and initializer
- **Statements**: If/else, for loops, while loops, return, expression statements
- **Expressions**: Binary operations, unary operations, function calls, member access, indexing

### 3. Type System

The type system (`type-system/`) handles:

#### Type Mapping

| TypeScript/JS | WGSL |
|---------------|------|
| `number` | `f32` |
| `vec2f` | `vec2<f32>` |
| `vec3f` | `vec3<f32>` |
| `vec4f` | `vec4<f32>` |
| `mat4x4` | `mat4x4<f32>` |
| `i32` | `i32` |
| `u32` | `u32` |

#### Math.* Mapping

```typescript
// Input
const x = Math.sin(time);
const y = Math.sqrt(value);

// Output
let x = sin(time);
let y = sqrt(value);
```

### 4. Semantic Analysis

The analyzer (`analyzer.ts`) performs:

- **Scope resolution**: Track variable declarations and usage across scopes
- **Type checking**: Validate type compatibility in assignments and operations
- **Built-in detection**: Recognize WGSL built-in functions and uniforms
- **Error reporting**: Generate diagnostic messages with source locations

### 5. Transformer

The transformer (`transformer.ts`) applies AST transformations:

- **Uniform injection**: Auto-detect `time`, `resolution`, etc. and generate uniform bindings
- **Entry point annotation**: Add `@location(0)` to fragment shader outputs
- **Type syntax conversion**: Convert shorthand types to full WGSL syntax

### 6. Code Generator

The code generator (`codegen.ts`) emits valid WGSL:

- **Struct generation**: Proper WGSL struct syntax with trailing commas
- **Function generation**: Convert `function` to `fn`, add return type annotations
- **Uniform buffers**: Generate `@group(0) @binding(0)` declarations
- **Formatting**: Proper indentation and whitespace

## Example Transformation

### Input (TypeScript-like DSL)

```typescript
@fragment
function main(@builtin(position) pos: vec4f): vec4f {
  const uv = pos.xy / resolution;
  const col = vec3f(uv.x, uv.y, sin(time) * 0.5 + 0.5);
  return vec4f(col, 1.0);
}
```

### Output (WGSL)

```wgsl
struct Uniforms {
    time: f32,
    resolution: vec2<f32>,
}

@group(0) @binding(0) var<uniform> u: Uniforms;

@fragment
fn main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = pos.xy / u.resolution;
    let col = vec3<f32>(uv.x, uv.y, sin(u.time) * 0.5 + 0.5);
    return vec4<f32>(col, 1.0);
}
```

## Built-in Functions

The compiler recognizes all WGSL built-in functions:

**Math**: `abs`, `acos`, `asin`, `atan`, `atan2`, `ceil`, `clamp`, `cos`, `exp`, `floor`, `fract`, `log`, `max`, `min`, `pow`, `round`, `sign`, `sin`, `sqrt`, `tan`

**Vector**: `cross`, `distance`, `dot`, `length`, `normalize`, `reflect`, `refract`

**Interpolation**: `mix`, `smoothstep`, `step`

**Texture**: `textureSample`, `textureLoad`, `textureStore`

## Key Source Files

| File | Lines | Purpose |
|------|-------|---------|
| [`parser.ts`](../packages/core/src/parser.ts) | ~1100 | Lexer + Parser implementation |
| [`types.ts`](../packages/core/src/types.ts) | ~200 | AST node type definitions |
| [`transformer.ts`](../packages/core/src/transformer.ts) | ~500 | AST transformations |
| [`codegen.ts`](../packages/core/src/codegen.ts) | ~250 | WGSL code generation |
| [`analyzer.ts`](../packages/core/src/analyzer.ts) | ~400 | Semantic analysis |
| [`stdlib.ts`](../packages/core/src/stdlib.ts) | ~750 | Standard library definitions |

## Testing

The compiler uses golden tests comparing expected vs actual WGSL output:

```bash
npm run test
```

Test fixtures:
- [`tests/fixtures/shaders.ts`](../tests/fixtures/shaders.ts) - Input shaders in DSL syntax
- [`tests/fixtures/expected.ts`](../tests/fixtures/expected.ts) - Expected WGSL output

## Error Handling

The compiler produces structured diagnostics:

```typescript
interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  location: SourceLocation;
}
```

Example errors:
- Type mismatch: "Cannot assign vec3f to vec2f"
- Undefined variable: "Unknown identifier 'undefinedVar'"
- Missing return: "Function must return vec4f"
