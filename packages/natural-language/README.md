# @shader3d/natural-language

Describe shader effects in plain English - "warm glow with slight vignette" → working shader.

## Features

- **Natural Language Parsing**: Understands effect words, modifiers, colors, and intensity
- **20+ Effect Dictionary**: blur, glow, grain, vignette, chromatic, saturate, warm, cool, etc.
- **Intensity Modifiers**: "very", "slightly", "strong", "subtle"
- **Iterative Refinement**: "more blur", "less vignette", "make it warmer"
- **Auto-generated Sliders**: Creates UI controls for all parameters

## Installation

```bash
npm install @shader3d/natural-language
```

## Usage

### Quick Start

```typescript
import { SessionManager } from '@shader3d/natural-language';

const manager = new SessionManager();
const session = manager.createSession();

// Process natural language input
const result = manager.processInput(session.id, 'warm glow with subtle grain');

console.log('Layers:', result.generatedLayers);
// [
//   { type: 'color', effect: 'colorBalance', params: {...} },
//   { type: 'glow', effect: 'bloom', params: {...} },
//   { type: 'noise', effect: 'grain', params: {...} }
// ]
```

### Iterative Refinement

```typescript
// Initial effect
manager.processInput(session.id, 'dreamy blur with vignette');

// Refine with follow-up
manager.processInput(session.id, 'more blur');
manager.processInput(session.id, 'less vignette');
manager.processInput(session.id, 'make it warmer');

// Get current layers
const layers = manager.getCurrentLayers(session.id);
```

### Auto-generated Sliders

```typescript
// Get sliders for all parameters
const sliders = manager.getSliders(session.id);

for (const slider of sliders) {
  console.log(slider.label, slider.min, slider.max, slider.value);
}

// Update via slider
slider.value = 0.8;
manager.updateSlider(session.id, slider);
```

### Direct Parsing

```typescript
import { NLParser, LayerGenerator } from '@shader3d/natural-language';

const parser = new NLParser();
const generator = new LayerGenerator();

const intent = parser.parse('very strong chromatic aberration with cool tones');
const layers = generator.generate(intent);
```

## Supported Vocabulary

### Effects
`blur` `glow` `bloom` `vignette` `grain` `noise` `chromatic` `pixelate` `sharpen` `motion blur` `wave` `scanlines` `saturate` `desaturate` `contrast` `brighten` `darken` `warm` `cool` `tint` `vintage`

### Modifiers
`very` `slightly` `strong` `weak` `fast` `slow` `horizontal` `vertical` `diagonal` `center` `edges`

### Colors
`red` `orange` `yellow` `green` `blue` `purple` `pink` `teal` `brown` `white` `black`

## API Reference

### SessionManager

- `createSession()` - Create new conversation session
- `processInput(sessionId, text)` - Process natural language
- `getCurrentLayers(sessionId)` - Get effect layers
- `getSliders(sessionId)` - Get parameter sliders
- `updateSlider(sessionId, slider)` - Update from slider
- `clearSession(sessionId)` - Reset session

### NLParser

- `parse(input)` - Parse text to structured intent
- `addEffect(effect)` - Add custom effect word
- `addModifier(modifier)` - Add custom modifier
- `addColor(color)` - Add custom color

### LayerGenerator

- `generate(intent)` - Generate layers from intent
- `generateSliders(layers)` - Create sliders for layers
