import type { EffectLayer, LayerStack, BlendMode } from './layer-types';
import { generateBlendShaderCode } from './blend-modes';
import { EFFECT_SHADERS } from './effects';

export interface CompiledShader {
  wgsl: string;
  uniforms: UniformBinding[];
  passes: number;
  estimatedCost: number;
}

export interface UniformBinding {
  name: string;
  type: 'f32' | 'vec2f' | 'vec3f' | 'vec4f' | 'i32';
  layerId: string;
  paramName: string;
}

interface LayerIR {
  id: string;
  effectCode: string;
  blendMode: BlendMode;
  opacity: number;
  uniforms: UniformBinding[];
  hasMask: boolean;
  requiresSeparatePass: boolean;
}

export function compileLayerStack(stack: LayerStack): CompiledShader {
  const visibleLayers = stack.layers.filter((l) => l.visible);
  if (visibleLayers.length === 0) {
    return {
      wgsl: generatePassthroughShader(),
      uniforms: [],
      passes: 1,
      estimatedCost: 1,
    };
  }

  const layerIRs = visibleLayers.map((layer) => compileLayerToIR(layer));
  const fusedLayers = fuseLayers(layerIRs);
  const blendModes = [...new Set(visibleLayers.map((l) => l.blendMode))];
  const blendCode = generateBlendShaderCode(blendModes);
  const effectCode = collectEffectCode(fusedLayers);
  const mainCode = generateMainFunction(fusedLayers, stack);
  const uniformBindings = collectUniforms(fusedLayers);
  const uniformDeclarations = generateUniformDeclarations(uniformBindings);

  const wgsl = `
${uniformDeclarations}

@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var texSampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var pos = array<vec2f, 3>(
    vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0)
  );
  var uvs = array<vec2f, 3>(
    vec2f(0.0, 1.0), vec2f(2.0, 1.0), vec2f(0.0, -1.0)
  );
  var output: VertexOutput;
  output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
  output.uv = uvs[vertexIndex];
  return output;
}

${blendCode}

${effectCode}

${mainCode}
`.trim();

  const separatePassCount = fusedLayers.filter((l) => l.requiresSeparatePass).length;

  return {
    wgsl,
    uniforms: uniformBindings,
    passes: Math.max(1, separatePassCount + 1),
    estimatedCost: estimateGPUCost(fusedLayers),
  };
}

function compileLayerToIR(layer: EffectLayer): LayerIR {
  const uniforms: UniformBinding[] = [];
  const shaderKey = `${layer.type}_${layer.effect}` as keyof typeof EFFECT_SHADERS;
  const effectCode = EFFECT_SHADERS[shaderKey] || '';

  for (const [paramName, paramValue] of Object.entries(layer.params)) {
    if (typeof paramValue === 'number') {
      uniforms.push({
        name: `u_${layer.id.replace(/-/g, '_')}_${paramName}`,
        type: 'f32',
        layerId: layer.id,
        paramName,
      });
    } else if (Array.isArray(paramValue) && paramValue.length === 3) {
      uniforms.push({
        name: `u_${layer.id.replace(/-/g, '_')}_${paramName}`,
        type: 'vec3f',
        layerId: layer.id,
        paramName,
      });
    }
  }

  const requiresSeparatePass =
    layer.type === 'blur' || (layer.type === 'glow' && layer.effect === 'bloom');

  return {
    id: layer.id,
    effectCode,
    blendMode: layer.blendMode,
    opacity: layer.opacity,
    uniforms,
    hasMask: !!layer.mask,
    requiresSeparatePass,
  };
}

function fuseLayers(layers: LayerIR[]): LayerIR[] {
  const result: LayerIR[] = [];
  let currentGroup: LayerIR | null = null;

  for (const layer of layers) {
    if (layer.requiresSeparatePass) {
      if (currentGroup) {
        result.push(currentGroup);
        currentGroup = null;
      }
      result.push(layer);
    } else {
      if (!currentGroup) {
        currentGroup = { ...layer };
      } else {
        currentGroup.effectCode += '\n' + layer.effectCode;
        currentGroup.uniforms.push(...layer.uniforms);
      }
    }
  }

  if (currentGroup) {
    result.push(currentGroup);
  }

  return result;
}

function collectEffectCode(layers: LayerIR[]): string {
  const seen = new Set<string>();
  let code = '';

  for (const layer of layers) {
    const lines = layer.effectCode.split('\n\n');
    for (const fn of lines) {
      const fnName = fn.match(/fn\s+(\w+)/)?.[1];
      if (fnName && !seen.has(fnName)) {
        seen.add(fnName);
        code += fn + '\n\n';
      }
    }
  }

  return code;
}

function generateMainFunction(layers: LayerIR[], stack: LayerStack): string {
  let code = `@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  var color = textureSample(inputTexture, texSampler, uv);
`;

  for (const layer of layers) {
    if (layer.requiresSeparatePass) {
      continue;
    }

    const blendFn = `blend${layer.blendMode.charAt(0).toUpperCase()}${layer.blendMode.slice(1)}`;
    code += `
  // Layer: ${layer.id}
  {
    let layerColor = color; // Effect processing here
    let opacity = ${layer.opacity.toFixed(4)};
    color = vec4f(${blendFn}(color.rgb, layerColor.rgb, opacity), color.a);
  }
`;
  }

  code += `
  return color;
}`;

  return code;
}

function collectUniforms(layers: LayerIR[]): UniformBinding[] {
  return layers.flatMap((l) => l.uniforms);
}

function generateUniformDeclarations(uniforms: UniformBinding[]): string {
  if (uniforms.length === 0) return '';

  let code = 'struct Uniforms {\n';
  for (const u of uniforms) {
    code += `  ${u.name}: ${u.type},\n`;
  }
  code += '  time: f32,\n';
  code += '}\n\n';
  code += '@group(0) @binding(2) var<uniform> uniforms: Uniforms;\n';

  return code;
}

function estimateGPUCost(layers: LayerIR[]): number {
  let cost = 0;
  for (const layer of layers) {
    cost += 1;
    if (layer.requiresSeparatePass) cost += 5;
    if (layer.hasMask) cost += 2;
  }
  return cost;
}

function generatePassthroughShader(): string {
  return `
@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var texSampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var pos = array<vec2f, 3>(
    vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0)
  );
  var uvs = array<vec2f, 3>(
    vec2f(0.0, 1.0), vec2f(2.0, 1.0), vec2f(0.0, -1.0)
  );
  var output: VertexOutput;
  output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
  output.uv = uvs[vertexIndex];
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  return textureSample(inputTexture, texSampler, input.uv);
}
`.trim();
}

export function optimizeShader(wgsl: string): string {
  let optimized = wgsl;
  optimized = optimized.replace(/\n\s*\n\s*\n/g, '\n\n');
  optimized = optimized.replace(/\/\/[^\n]*\n/g, '\n');
  return optimized;
}
