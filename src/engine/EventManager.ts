// src/engine/EventManager.ts

import yaml from 'js-yaml';
import { GameEvent, GameState } from '../types/GameTypes';
import { evaluateTrigger } from './TriggerEvaluator';
import eventsYaml from '../data/events.yaml?raw';

export class EventManager {
  private static instance: EventManager;
  public allEvents: GameEvent[];

  private constructor() {
    try {
      this.allEvents = (yaml.load(eventsYaml) as GameEvent[]) ?? [];
    } catch (e) {
      console.error('Failed to load events.yaml:', e);
      this.allEvents = [];
    }
  }

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  /**
   * Shuffle through all events and return the first one whose trigger evaluates to true.
   * One-time events that have already fired are skipped.
   */
  public checkForTriggeredEvents(gameState: GameState, age: number): GameEvent | null {
    const shuffled = [...this.allEvents].sort(() => Math.random() - 0.5);

    for (const event of shuffled) {
      if (event.oneTime && gameState.firedEventIds.has(event.id)) continue;
      if (evaluateTrigger(event.trigger, gameState, age)) {
        return event;
      }
    }
    return null;
  }
}
