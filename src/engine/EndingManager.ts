// src/engine/EndingManager.ts

import yaml from 'js-yaml';
import { GameEnding, GameState } from '../types/GameTypes';
import { evaluateTrigger } from './TriggerEvaluator';
import endingsYaml from '../data/endings.yaml?raw';

export class EndingManager {
  private static instance: EndingManager;
  public allEndings: GameEnding[];

  private constructor() {
    try {
      this.allEndings = (yaml.load(endingsYaml) as GameEnding[]) ?? [];
    } catch (e) {
      console.error('Failed to load endings.yaml:', e);
      this.allEndings = [];
    }
  }

  public static getInstance(): EndingManager {
    if (!EndingManager.instance) {
      EndingManager.instance = new EndingManager();
    }
    return EndingManager.instance;
  }

  public checkEndings(gameState: GameState, age: number): GameEnding | null {
    for (const ending of this.allEndings) {
      if (evaluateTrigger(ending.trigger, gameState, age)) {
        return ending;
      }
    }
    return null;
  }
}
