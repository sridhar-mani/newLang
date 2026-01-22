export const EFFECT_SHADERS = {
  blur_gaussian: `
fn gaussianWeight(x: f32, sigma: f32) -> f32 {
  return exp(-(x * x) / (2.0 * sigma * sigma)) / (sqrt(2.0 * 3.14159) * sigma);
}

fn blurGaussian(tex: texture_2d<f32>, samp: sampler, uv: vec2f, radius: f32, direction: vec2f) -> vec4f {
  let sigma = radius * 0.3;
  var color = vec4f(0.0);
  var totalWeight = 0.0;
  let steps = i32(radius * 2.0);
  
  for (var i = -steps; i <= steps; i++) {
    let offset = vec2f(f32(i)) * direction / vec2f(textureDimensions(tex));
    let weight = gaussianWeight(f32(i), sigma);
    color += textureSample(tex, samp, uv + offset) * weight;
    totalWeight += weight;
  }
  
  return color / totalWeight;
}`,

  blur_motion: `
fn blurMotion(tex: texture_2d<f32>, samp: sampler, uv: vec2f, amount: f32, angle: f32) -> vec4f {
  let direction = vec2f(cos(angle), sin(angle)) * amount / 100.0;
  var color = vec4f(0.0);
  let samples = 16;
  
  for (var i = 0; i < samples; i++) {
    let t = (f32(i) / f32(samples - 1) - 0.5);
    color += textureSample(tex, samp, uv + direction * t);
  }
  
  return color / f32(samples);
}`,

  glow_bloom: `
fn extractBright(color: vec4f, threshold: f32) -> vec4f {
  let brightness = dot(color.rgb, vec3f(0.2126, 0.7152, 0.0722));
  return select(vec4f(0.0), color, brightness > threshold);
}

fn bloomEffect(tex: texture_2d<f32>, samp: sampler, uv: vec2f, intensity: f32, radius: f32, threshold: f32) -> vec4f {
  let original = textureSample(tex, samp, uv);
  var bloom = vec4f(0.0);
  let samples = 8;
  
  for (var i = 0; i < samples; i++) {
    let angle = f32(i) * 6.28318 / f32(samples);
    for (var j = 1; j <= 4; j++) {
      let offset = vec2f(cos(angle), sin(angle)) * radius * f32(j) / 400.0;
      let sample = textureSample(tex, samp, uv + offset);
      bloom += extractBright(sample, threshold) / f32(j * j);
    }
  }
  
  bloom = bloom / f32(samples * 4);
  return original + bloom * intensity;
}`,

  glow_neon: `
fn neonGlow(tex: texture_2d<f32>, samp: sampler, uv: vec2f, intensity: f32, radius: f32, glowColor: vec3f) -> vec4f {
  let original = textureSample(tex, samp, uv);
  let texSize = vec2f(textureDimensions(tex));
  
  var edge = 0.0;
  let offsets = array<vec2f, 8>(
    vec2f(-1, -1), vec2f(0, -1), vec2f(1, -1),
    vec2f(-1, 0), vec2f(1, 0),
    vec2f(-1, 1), vec2f(0, 1), vec2f(1, 1)
  );
  
  for (var i = 0; i < 8; i++) {
    let sample = textureSample(tex, samp, uv + offsets[i] / texSize);
    edge += length(original.rgb - sample.rgb);
  }
  
  var glow = vec4f(0.0);
  for (var r = 1.0; r <= radius; r += 1.0) {
    for (var i = 0; i < 8; i++) {
      let sample = textureSample(tex, samp, uv + offsets[i] * r / texSize);
      let sampleEdge = length(original.rgb - sample.rgb);
      glow += vec4f(glowColor * sampleEdge, sampleEdge) / (r * r);
    }
  }
  
  glow = glow / (radius * 8.0);
  return original + glow * intensity;
}`,

  distort_wave: `
fn distortWave(tex: texture_2d<f32>, samp: sampler, uv: vec2f, amount: f32, frequency: f32, phase: f32, time: f32) -> vec4f {
  let offset = vec2f(
    sin(uv.y * frequency + phase + time) * amount / 1000.0,
    sin(uv.x * frequency + phase + time) * amount / 1000.0
  );
  return textureSample(tex, samp, uv + offset);
}`,

  distort_ripple: `
fn distortRipple(tex: texture_2d<f32>, samp: sampler, uv: vec2f, amount: f32, frequency: f32, center: vec2f, time: f32) -> vec4f {
  let delta = uv - center;
  let dist = length(delta);
  let wave = sin(dist * frequency - time * 3.0) * amount / 1000.0;
  let offset = normalize(delta) * wave;
  return textureSample(tex, samp, uv + offset);
}`,

  distort_pixelate: `
fn distortPixelate(tex: texture_2d<f32>, samp: sampler, uv: vec2f, pixelSize: f32) -> vec4f {
  let texSize = vec2f(textureDimensions(tex));
  let pixels = floor(texSize / pixelSize);
  let pixelUV = floor(uv * pixels) / pixels;
  return textureSample(tex, samp, pixelUV + 0.5 / pixels);
}`,

  color_brightness_contrast: `
fn colorBrightnessContrast(color: vec4f, brightness: f32, contrast: f32) -> vec4f {
  var rgb = color.rgb;
  rgb = rgb + brightness;
  rgb = (rgb - 0.5) * (1.0 + contrast) + 0.5;
  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), color.a);
}`,

  color_hue_saturation: `
fn colorHueSaturation(color: vec4f, hueShift: f32, saturation: f32, lightness: f32) -> vec4f {
  let hsl = rgb2hsl(color.rgb);
  var newHSL = hsl;
  newHSL.x = fract(hsl.x + hueShift / 360.0);
  newHSL.y = clamp(hsl.y * (1.0 + saturation), 0.0, 1.0);
  newHSL.z = clamp(hsl.z + lightness, 0.0, 1.0);
  return vec4f(hsl2rgb(newHSL), color.a);
}`,

  color_vibrance: `
fn colorVibrance(color: vec4f, vibrance: f32) -> vec4f {
  let maxC = max(max(color.r, color.g), color.b);
  let minC = min(min(color.r, color.g), color.b);
  let sat = maxC - minC;
  let amt = vibrance * (1.0 - sat) * 0.5;
  let gray = dot(color.rgb, vec3f(0.2126, 0.7152, 0.0722));
  let rgb = mix(vec3f(gray), color.rgb, 1.0 + amt);
  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), color.a);
}`,

  color_tint: `
fn colorTint(color: vec4f, tintColor: vec3f, amount: f32) -> vec4f {
  let luminance = dot(color.rgb, vec3f(0.2126, 0.7152, 0.0722));
  let tinted = tintColor * luminance;
  return vec4f(mix(color.rgb, tinted, amount), color.a);
}`,

  noise_grain: `
fn hash21(p: vec2f) -> f32 {
  var p3 = fract(vec3f(p.x, p.y, p.x) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

fn noiseGrain(color: vec4f, uv: vec2f, amount: f32, scale: f32, time: f32, mono: bool) -> vec4f {
  let noise = hash21(uv * scale + time);
  var grain: vec3f;
  if (mono) {
    grain = vec3f(noise - 0.5) * amount;
  } else {
    grain = vec3f(
      hash21(uv * scale + time + 0.1),
      hash21(uv * scale + time + 0.2),
      hash21(uv * scale + time + 0.3)
    ) * amount - amount * 0.5;
  }
  return vec4f(clamp(color.rgb + grain, vec3f(0.0), vec3f(1.0)), color.a);
}`,

  noise_scanlines: `
fn noiseScanlines(color: vec4f, uv: vec2f, amount: f32, frequency: f32) -> vec4f {
  let scanline = sin(uv.y * frequency * 3.14159) * 0.5 + 0.5;
  let darkened = color.rgb * (1.0 - amount * (1.0 - scanline));
  return vec4f(darkened, color.a);
}`,

  stylize_vignette: `
fn stylizeVignette(color: vec4f, uv: vec2f, intensity: f32, softness: f32, size: f32) -> vec4f {
  let center = vec2f(0.5);
  let dist = distance(uv, center);
  let radius = 0.5 * size;
  let vignette = smoothstep(radius, radius - softness * 0.5, dist);
  return vec4f(color.rgb * mix(1.0 - intensity, 1.0, vignette), color.a);
}`,

  stylize_chromatic: `
fn stylizeChromatic(tex: texture_2d<f32>, samp: sampler, uv: vec2f, amount: f32, angle: f32) -> vec4f {
  let direction = vec2f(cos(angle), sin(angle)) * amount;
  let r = textureSample(tex, samp, uv + direction).r;
  let g = textureSample(tex, samp, uv).g;
  let b = textureSample(tex, samp, uv - direction).b;
  let a = textureSample(tex, samp, uv).a;
  return vec4f(r, g, b, a);
}`,

  stylize_sharpen: `
fn stylizeSharpen(tex: texture_2d<f32>, samp: sampler, uv: vec2f, amount: f32) -> vec4f {
  let texSize = vec2f(textureDimensions(tex));
  let pixel = 1.0 / texSize;
  
  let center = textureSample(tex, samp, uv);
  let top = textureSample(tex, samp, uv + vec2f(0.0, -pixel.y));
  let bottom = textureSample(tex, samp, uv + vec2f(0.0, pixel.y));
  let left = textureSample(tex, samp, uv + vec2f(-pixel.x, 0.0));
  let right = textureSample(tex, samp, uv + vec2f(pixel.x, 0.0));
  
  let sharpened = center * (1.0 + 4.0 * amount) - (top + bottom + left + right) * amount;
  return vec4f(clamp(sharpened.rgb, vec3f(0.0), vec3f(1.0)), center.a);
}`,

  lighting_godrays: `
fn lightingGodRays(tex: texture_2d<f32>, samp: sampler, uv: vec2f, lightPos: vec2f, intensity: f32, decay: f32, samples: i32) -> vec4f {
  let deltaUV = (uv - lightPos) / f32(samples);
  var currentUV = uv;
  var accumulator = vec4f(0.0);
  var illuminationDecay = 1.0;
  
  for (var i = 0; i < samples; i++) {
    currentUV -= deltaUV;
    let sample = textureSample(tex, samp, currentUV);
    let brightness = dot(sample.rgb, vec3f(0.2126, 0.7152, 0.0722));
    accumulator += sample * brightness * illuminationDecay;
    illuminationDecay *= decay;
  }
  
  let original = textureSample(tex, samp, uv);
  return original + accumulator * intensity / f32(samples);
}`,

  lighting_caustics: `
fn causticPattern(uv: vec2f, time: f32, scale: f32) -> f32 {
  var p = uv * scale;
  var c = 0.0;
  for (var i = 0; i < 3; i++) {
    let t = time * (1.0 - f32(i) * 0.1);
    p = p + vec2f(sin(p.y + t), cos(p.x + t));
    c += 1.0 / (1.0 + length(sin(p)));
  }
  return c / 3.0;
}

fn lightingCaustics(color: vec4f, uv: vec2f, intensity: f32, scale: f32, time: f32, tint: vec3f) -> vec4f {
  let caustic = causticPattern(uv, time, scale);
  let causticColor = tint * caustic * intensity;
  return vec4f(color.rgb + causticColor, color.a);
}`,
};

export type EffectShaderName = keyof typeof EFFECT_SHADERS;

export function getEffectShader(name: EffectShaderName): string {
  return EFFECT_SHADERS[name];
}
