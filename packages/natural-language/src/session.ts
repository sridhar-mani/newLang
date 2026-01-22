import type {
  NLSession,
  ConversationTurn,
  GeneratedLayer,
  ParsedIntent,
  RefinementAction,
  Slider,
} from './types';
import { NLParser } from './parser';
import { LayerGenerator } from './generator';

export interface SessionManagerOptions {
  maxHistoryLength?: number;
  enableRefinement?: boolean;
}

export class SessionManager {
  private sessions: Map<string, NLSession> = new Map();
  private parser: NLParser;
  private generator: LayerGenerator;
  private options: Required<SessionManagerOptions>;

  constructor(options: SessionManagerOptions = {}) {
    this.options = {
      maxHistoryLength: options.maxHistoryLength ?? 50,
      enableRefinement: options.enableRefinement ?? true,
    };

    this.parser = new NLParser();
    this.generator = new LayerGenerator();
  }

  createSession(): NLSession {
    const session: NLSession = {
      id: `nl-session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      history: [],
      currentLayers: [],
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): NLSession | undefined {
    return this.sessions.get(sessionId);
  }

  processInput(sessionId: string, userInput: string): ConversationTurn {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const parsedIntent = this.parser.parse(userInput);

    let generatedLayers: GeneratedLayer[];
    let refinements: RefinementAction[] = [];

    if (this.options.enableRefinement && this.isRefinementRequest(userInput, parsedIntent)) {
      const result = this.processRefinement(session, userInput, parsedIntent);
      generatedLayers = result.layers;
      refinements = result.refinements;
    } else {
      generatedLayers = this.generator.generate(parsedIntent);

      if (this.shouldMergeLayers(userInput)) {
        session.currentLayers = [...session.currentLayers, ...generatedLayers];
      } else {
        session.currentLayers = generatedLayers;
      }
    }

    const turn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      userInput,
      parsedIntent,
      generatedLayers,
      refinements,
      timestamp: Date.now(),
    };

    session.history.push(turn);
    session.modifiedAt = Date.now();

    if (session.history.length > this.options.maxHistoryLength) {
      session.history = session.history.slice(-this.options.maxHistoryLength);
    }

    return turn;
  }

  private isRefinementRequest(input: string, intent: ParsedIntent): boolean {
    const refinementKeywords = [
      'more',
      'less',
      'increase',
      'decrease',
      'stronger',
      'weaker',
      'reduce',
      'boost',
      'remove',
      'delete',
      'undo',
      'adjust',
      'change',
      'modify',
      'tweak',
      'fix',
      'too much',
      'not enough',
    ];

    const lower = input.toLowerCase();

    for (const keyword of refinementKeywords) {
      if (lower.includes(keyword)) {
        return true;
      }
    }

    return false;
  }

  private processRefinement(
    session: NLSession,
    input: string,
    intent: ParsedIntent
  ): { layers: GeneratedLayer[]; refinements: RefinementAction[] } {
    const refinements: RefinementAction[] = [];
    const layers = [...session.currentLayers];
    const lower = input.toLowerCase();

    if (lower.includes('remove') || lower.includes('delete')) {
      const targetEffect = this.findTargetEffect(input, intent, layers);

      if (targetEffect !== null && targetEffect < layers.length) {
        const removed = layers.splice(targetEffect, 1)[0];
        refinements.push({
          type: 'remove',
          layerIndex: targetEffect,
          description: `Removed ${removed.effect} effect`,
        });
      }
    } else if (lower.includes('undo')) {
      if (session.history.length > 0) {
        const lastTurn = session.history[session.history.length - 1];
        if (lastTurn.generatedLayers.length > 0) {
          for (let i = 0; i < lastTurn.generatedLayers.length; i++) {
            layers.pop();
          }
          refinements.push({
            type: 'remove',
            description: 'Undid last action',
          });
        }
      }
    } else {
      const targetEffect = this.findTargetEffect(input, intent, layers);
      const multiplier = this.parseIntensityChange(input);

      if (targetEffect !== null && targetEffect < layers.length) {
        const layer = layers[targetEffect];

        for (const key in layer.params) {
          const value = layer.params[key];
          if (typeof value === 'number') {
            const oldValue = value;
            layer.params[key] = value * multiplier;

            refinements.push({
              type: 'adjust',
              layerIndex: targetEffect,
              paramName: key,
              oldValue,
              newValue: layer.params[key],
              description: `Adjusted ${key} ${multiplier > 1 ? 'up' : 'down'}`,
            });
          }
        }
      } else {
        for (let i = 0; i < layers.length; i++) {
          const layer = layers[i];
          for (const key in layer.params) {
            const value = layer.params[key];
            if (typeof value === 'number') {
              const oldValue = value;
              layer.params[key] = value * multiplier;

              refinements.push({
                type: 'adjust',
                layerIndex: i,
                paramName: key,
                oldValue,
                newValue: layer.params[key],
                description: `Adjusted ${key}`,
              });
            }
          }
        }
      }
    }

    session.currentLayers = layers;

    return { layers, refinements };
  }

  private findTargetEffect(
    input: string,
    intent: ParsedIntent,
    layers: GeneratedLayer[]
  ): number | null {
    if (intent.effects.length > 0) {
      const effectName = intent.effects[0].effectWord.effectName;
      const index = layers.findIndex((l) => l.effect === effectName);
      if (index >= 0) return index;
    }

    for (let i = 0; i < layers.length; i++) {
      if (input.toLowerCase().includes(layers[i].effect.toLowerCase())) {
        return i;
      }
    }

    if (layers.length > 0) {
      return layers.length - 1;
    }

    return null;
  }

  private parseIntensityChange(input: string): number {
    const lower = input.toLowerCase();

    if (lower.includes('much more') || lower.includes('a lot more')) return 2.0;
    if (
      lower.includes('more') ||
      lower.includes('increase') ||
      lower.includes('stronger') ||
      lower.includes('boost')
    )
      return 1.3;
    if (lower.includes('slightly more') || lower.includes('a bit more')) return 1.15;

    if (lower.includes('much less') || lower.includes('a lot less')) return 0.4;
    if (
      lower.includes('less') ||
      lower.includes('decrease') ||
      lower.includes('weaker') ||
      lower.includes('reduce')
    )
      return 0.7;
    if (lower.includes('slightly less') || lower.includes('a bit less')) return 0.85;

    return 1.0;
  }

  private shouldMergeLayers(input: string): boolean {
    const mergeKeywords = ['also', 'add', 'plus', 'with', 'and also', 'additionally'];
    const lower = input.toLowerCase();

    for (const keyword of mergeKeywords) {
      if (lower.startsWith(keyword) || lower.includes(` ${keyword} `)) {
        return true;
      }
    }

    return false;
  }

  getCurrentLayers(sessionId: string): GeneratedLayer[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return [...session.currentLayers];
  }

  getSliders(sessionId: string): Slider[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return this.generator.generateSliders(session.currentLayers);
  }

  updateSlider(sessionId: string, slider: Slider): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const layer = session.currentLayers[slider.layerIndex];
    if (!layer) return;

    if (slider.paramName === 'opacity') {
      layer.opacity = slider.value;
    } else {
      layer.params[slider.paramName] = slider.value;
    }

    session.modifiedAt = Date.now();
  }

  clearSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.history = [];
    session.currentLayers = [];
    session.modifiedAt = Date.now();
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  exportSession(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    return JSON.stringify(session, null, 2);
  }

  importSession(json: string): NLSession {
    const session = JSON.parse(json) as NLSession;
    this.sessions.set(session.id, session);
    return session;
  }
}

export const defaultSessionManager = new SessionManager();
