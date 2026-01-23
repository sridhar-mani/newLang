export * from './types';
export * from './parser';
export * from './generator';
export * from './session';

// Export alias for backward compatibility
export type { Slider as EffectSlider } from './types';

// Export function alias
import { NLParser } from './parser';
export function parseNaturalLanguage(input: string) {
  const parser = new NLParser();
  return parser.parse(input);
}
