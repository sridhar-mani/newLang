import type { EffectWord, ModifierWord, ColorWord, ParsedIntent, ParsedEffect } from './types';
import { EFFECT_DICTIONARY, MODIFIER_DICTIONARY, COLOR_DICTIONARY } from './types';

export class NLParser {
  private effects: EffectWord[];
  private modifiers: ModifierWord[];
  private colors: ColorWord[];

  constructor(
    customEffects?: EffectWord[],
    customModifiers?: ModifierWord[],
    customColors?: ColorWord[]
  ) {
    this.effects = customEffects ?? EFFECT_DICTIONARY;
    this.modifiers = customModifiers ?? MODIFIER_DICTIONARY;
    this.colors = customColors ?? COLOR_DICTIONARY;
  }

  parse(input: string): ParsedIntent {
    const normalized = this.normalizeInput(input);
    const tokens = this.tokenize(normalized);

    const foundEffects = this.findEffects(tokens, normalized);
    const globalModifiers = this.findGlobalModifiers(tokens, foundEffects);

    const confidence = this.calculateConfidence(foundEffects, tokens);
    const suggestions = confidence < 0.5 ? this.generateSuggestions(normalized) : undefined;

    return {
      effects: foundEffects,
      globalModifiers,
      confidence,
      originalText: input,
      suggestions,
    };
  }

  private normalizeInput(input: string): string {
    return input
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private tokenize(input: string): string[] {
    return input.split(' ').filter((t) => t.length > 0);
  }

  private findEffects(tokens: string[], fullText: string): ParsedEffect[] {
    const parsedEffects: ParsedEffect[] = [];
    const usedTokenIndices = new Set<number>();

    for (const effectWord of this.effects) {
      const matchResult = this.matchEffectWord(effectWord, tokens, fullText);

      if (matchResult.matched) {
        matchResult.tokenIndices.forEach((i) => usedTokenIndices.add(i));

        const { modifiers, modifierIndices } = this.findLocalModifiers(
          tokens,
          matchResult.tokenIndices,
          usedTokenIndices
        );
        modifierIndices.forEach((i) => usedTokenIndices.add(i));

        const colors = this.findColors(tokens, matchResult.tokenIndices);

        const intensity = this.calculateIntensity(modifiers);
        const area = this.findArea(modifiers);

        parsedEffects.push({
          effectWord,
          modifiers,
          colors,
          intensity,
          area,
        });
      }
    }

    return parsedEffects;
  }

  private matchEffectWord(
    effectWord: EffectWord,
    tokens: string[],
    fullText: string
  ): { matched: boolean; tokenIndices: number[] } {
    const allWords = [effectWord.word, ...effectWord.aliases];

    for (const word of allWords) {
      if (word.includes(' ')) {
        if (fullText.includes(word)) {
          const wordTokens = word.split(' ');
          const indices: number[] = [];

          for (let i = 0; i <= tokens.length - wordTokens.length; i++) {
            let match = true;
            for (let j = 0; j < wordTokens.length; j++) {
              if (tokens[i + j] !== wordTokens[j]) {
                match = false;
                break;
              }
            }
            if (match) {
              for (let j = 0; j < wordTokens.length; j++) {
                indices.push(i + j);
              }
              return { matched: true, tokenIndices: indices };
            }
          }
        }
      } else {
        const index = tokens.indexOf(word);
        if (index >= 0) {
          return { matched: true, tokenIndices: [index] };
        }

        for (let i = 0; i < tokens.length; i++) {
          if (this.fuzzyMatch(tokens[i], word)) {
            return { matched: true, tokenIndices: [i] };
          }
        }
      }
    }

    return { matched: false, tokenIndices: [] };
  }

  private fuzzyMatch(token: string, target: string): boolean {
    if (token === target) return true;
    if (token.length < 3 || target.length < 3) return false;

    if (target.startsWith(token) || token.startsWith(target)) {
      const shorter = token.length < target.length ? token : target;
      const longer = token.length < target.length ? target : token;
      return shorter.length / longer.length > 0.7;
    }

    let distance = 0;
    const maxLen = Math.max(token.length, target.length);

    for (let i = 0; i < maxLen; i++) {
      if (token[i] !== target[i]) distance++;
    }

    return distance / maxLen < 0.3;
  }

  private findLocalModifiers(
    tokens: string[],
    effectIndices: number[],
    usedIndices: Set<number>
  ): { modifiers: ModifierWord[]; modifierIndices: number[] } {
    const modifiers: ModifierWord[] = [];
    const modifierIndices: number[] = [];

    const minEffectIdx = Math.min(...effectIndices);
    const maxEffectIdx = Math.max(...effectIndices);

    const searchStart = Math.max(0, minEffectIdx - 3);
    const searchEnd = Math.min(tokens.length - 1, maxEffectIdx + 3);

    for (let i = searchStart; i <= searchEnd; i++) {
      if (usedIndices.has(i)) continue;

      const token = tokens[i];

      for (const modifier of this.modifiers) {
        const allWords = [modifier.word, ...modifier.aliases];

        for (const word of allWords) {
          if (token === word || this.fuzzyMatch(token, word)) {
            modifiers.push(modifier);
            modifierIndices.push(i);
            break;
          }
        }
      }
    }

    return { modifiers, modifierIndices };
  }

  private findGlobalModifiers(tokens: string[], parsedEffects: ParsedEffect[]): ModifierWord[] {
    const usedModifiers = new Set<string>();
    for (const effect of parsedEffects) {
      for (const mod of effect.modifiers) {
        usedModifiers.add(mod.word);
      }
    }

    const globalModifiers: ModifierWord[] = [];

    for (const token of tokens) {
      for (const modifier of this.modifiers) {
        if (usedModifiers.has(modifier.word)) continue;

        const allWords = [modifier.word, ...modifier.aliases];

        for (const word of allWords) {
          if (token === word) {
            globalModifiers.push(modifier);
            usedModifiers.add(modifier.word);
            break;
          }
        }
      }
    }

    return globalModifiers;
  }

  private findColors(tokens: string[], effectIndices: number[]): ColorWord[] {
    const colors: ColorWord[] = [];

    for (const token of tokens) {
      for (const color of this.colors) {
        const allWords = [color.word, ...color.aliases];

        for (const word of allWords) {
          if (token === word || token.includes(word) || word.includes(token)) {
            if (!colors.find((c) => c.word === color.word)) {
              colors.push(color);
            }
            break;
          }
        }
      }
    }

    return colors;
  }

  private calculateIntensity(modifiers: ModifierWord[]): number {
    let intensity = 1.0;

    for (const mod of modifiers) {
      if (mod.type === 'intensity' && typeof mod.value === 'number') {
        intensity *= mod.value;
      }
    }

    return Math.max(0.1, Math.min(3.0, intensity));
  }

  private findArea(
    modifiers: ModifierWord[]
  ): 'center' | 'edges' | 'top' | 'bottom' | 'left' | 'right' | 'all' | undefined {
    for (const mod of modifiers) {
      if (mod.type === 'area' && typeof mod.value === 'string') {
        return mod.value as 'center' | 'edges';
      }
    }
    return undefined;
  }

  private calculateConfidence(effects: ParsedEffect[], tokens: string[]): number {
    if (effects.length === 0) return 0;

    const effectWords = effects.reduce((count, e) => {
      return count + 1 + e.modifiers.length + e.colors.length;
    }, 0);

    const ratio = effectWords / tokens.length;

    const baseConfidence = Math.min(1, ratio * 1.5);

    const effectBonus = Math.min(0.3, effects.length * 0.1);

    return Math.min(1, baseConfidence + effectBonus);
  }

  private generateSuggestions(input: string): string[] {
    const suggestions: string[] = [];

    const effectExamples = [
      'blur',
      'glow',
      'vignette',
      'grain',
      'chromatic aberration',
      'saturate',
      'warm',
      'cool',
    ];

    suggestions.push(
      `Try describing an effect like "${effectExamples[Math.floor(Math.random() * effectExamples.length)]}"`
    );

    suggestions.push('You can combine effects: "warm glow with subtle grain"');
    suggestions.push('Add intensity: "very strong blur" or "slight vignette"');

    return suggestions;
  }

  addEffect(effect: EffectWord): void {
    this.effects.push(effect);
  }

  addModifier(modifier: ModifierWord): void {
    this.modifiers.push(modifier);
  }

  addColor(color: ColorWord): void {
    this.colors.push(color);
  }

  getEffectDictionary(): EffectWord[] {
    return [...this.effects];
  }

  getModifierDictionary(): ModifierWord[] {
    return [...this.modifiers];
  }

  getColorDictionary(): ColorWord[] {
    return [...this.colors];
  }
}
