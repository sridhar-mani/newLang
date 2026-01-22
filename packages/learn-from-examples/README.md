# @shader3d/learn-from-examples

Upload example images and automatically generate matching shader effects through style analysis.

## Features

- **Image Analysis**: Detects color temperature, contrast, saturation, grain, vignette, bloom
- **Style Markers**: Identifies vintage, cinematic, dreamy, gritty, teal-orange looks
- **Effect Synthesis**: Generates layer stack matching the analyzed style
- **Multi-image Learning**: Combine multiple examples for refined results
- **Comparison**: Compare two images for style similarity

## Installation

```bash
npm install @shader3d/learn-from-examples
```

## Usage

### Learn from Single Image

```typescript
import { LearnFromExamples } from '@shader3d/learn-from-examples';

const learner = new LearnFromExamples();

// Analyze and generate effects from example image
const result = await learner.learnFromImage(imageData);

console.log('Match score:', result.matchScore);
console.log('Layers:', result.layers);
console.log('Suggestions:', result.suggestions);
```

### Multi-image Session

```typescript
const learner = new LearnFromExamples();
const session = learner.createSession();

// Add multiple example images
await learner.addExample(session.id, image1Data, { name: 'sunset1' });
await learner.addExample(session.id, image2Data, { name: 'sunset2' });
await learner.addExample(session.id, image3Data, { name: 'sunset3' });

// Synthesize combined style
const result = learner.synthesize(session.id);
// Merges common elements from all examples
```

### Iterative Refinement

```typescript
// After initial synthesis
let result = learner.synthesize(session.id);

// Refine based on feedback
result = learner.refine(session.id, 'warmer');
result = learner.refine(session.id, 'more');
result = learner.refine(session.id, 'sharper');
```

### Style Comparison

```typescript
const comparison = await learner.compare(imageA, imageB);

console.log('Overall similarity:', comparison.similarity);
console.log('Color similarity:', comparison.colorSimilarity);
console.log('Tone similarity:', comparison.toneSimilarity);
console.log('Differences:', comparison.differences);
```

## Analysis Features

### Color Profile
- Dominant colors (top 5)
- Color temperature (warm/cool)
- Saturation level
- Color harmony detection

### Tone Profile
- Brightness
- Contrast
- Shadow/highlight levels
- Dynamic range
- Histogram

### Texture Profile
- Grain amount
- Sharpness
- Noise type (fine, film, coarse)
- Pattern detection (scanlines, halftone)

### Style Markers
- Vignette detection
- Bloom/glow detection
- Chromatic aberration
- Film grain
- High/low contrast
- Desaturated
- Teal-orange grading
- Vintage/cinematic/dreamy styles

## API Reference

### LearnFromExamples

- `createSession()` - Create learning session
- `addExample(sessionId, imageData, options)` - Add example image
- `removeExample(sessionId, imageId)` - Remove example
- `learnFromImage(imageData)` - Quick single-image learning
- `synthesize(sessionId)` - Generate layers from examples
- `refine(sessionId, feedback)` - Refine with feedback
- `compare(imageA, imageB)` - Compare two images

### ImageAnalyzer

- `analyze(imageData)` - Full style analysis

### ShaderSynthesizer

- `synthesize(analysis)` - Generate layers from analysis
- `refine(synthesis, feedback)` - Apply refinement
