// src/engine/ActionSystem.ts

import yaml from 'js-yaml';
import { GameAction } from '../types/GameTypes';
import actionsYaml from '../data/actions.yaml?raw';

/**
 * Manages game actions, loading them from data files.
 */
export class ActionSystem {
  private static instance: ActionSystem;
  public actions: GameAction[];

  private constructor() {
    try {
      this.actions = yaml.load(actionsYaml) as GameAction[];
    } catch (e) {
      console.error("Failed to load or parse actions.yaml:", e);
      this.actions = [];
    }
  }

  public static getInstance(): ActionSystem {
    if (!ActionSystem.instance) {
      ActionSystem.instance = new ActionSystem();
    }
    return ActionSystem.instance;
  }

  public getAction(id: string): GameAction | undefined {
    return this.actions.find(action => action.id === id);
  }
}
