// src/engine/EndingManager.ts

import yaml from 'js-yaml';
import { GameEnding, GameState, Trigger } from '../types/GameTypes';
import endingsYaml from '../data/endings.yaml?raw';

/**
 * Manages loading and checking for game endings.
 */
export class EndingManager {
  private static instance: EndingManager;
  public allEndings: GameEnding[];

  private constructor() {
    try {
      this.allEndings = yaml.load(endingsYaml) as GameEnding[];
    } catch (e) {
      console.error("Failed to load or parse endings.yaml:", e);
      this.allEndings = [];
    }
  }

  public static getInstance(): EndingManager {
    if (!EndingManager.instance) {
      EndingManager.instance = new EndingManager();
    }
    return EndingManager.instance;
  }

  /**
   * Checks if any ending conditions are met.
   * @param gameState The current state of the game.
   * @returns The triggered GameEnding, or null if no ending is triggered.
   */
  public checkEndings(gameState: GameState): GameEnding | null {
    // TODO: Implement the full trigger evaluation logic.
    for (const ending of this.allEndings) {
      if (this.evaluateTrigger(ending.trigger, gameState)) {
        return ending;
      }
    }
    return null;
  }

  private evaluateTrigger(trigger: Trigger, gameState: GameState): boolean {
    // TODO: Implement the logic for 'and', 'or', 'stat_check', etc.
    // This will be very similar to the EventManager's evaluateTrigger.
    return false;
  }
}
