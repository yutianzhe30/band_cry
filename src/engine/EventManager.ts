// src/engine/EventManager.ts

import yaml from 'js-yaml';
import { GameEvent, GameState, Trigger } from '../types/GameTypes';
import eventsYaml from '../data/events.yaml?raw';

/**
 * Manages loading, triggering, and resolving game events.
 */
export class EventManager {
  private static instance: EventManager;
  public allEvents: GameEvent[];

  private constructor() {
    try {
      this.allEvents = yaml.load(eventsYaml) as GameEvent[];
    } catch (e) {
      console.error("Failed to load or parse events.yaml:", e);
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
   * Checks all events to see if any should be triggered based on the current game state.
   * @param gameState The current state of the game.
   * @returns A GameEvent to be presented to the player, or null if no event triggers.
   */
  public checkForTriggeredEvents(gameState: GameState): GameEvent | null {
    // TODO: Implement the full trigger evaluation logic.
    // This is a placeholder that just returns the first event for now.
    if (this.allEvents.length > 0) {
      // In the future, this will loop through allEvents and evaluate their triggers.
      // For now, let's not trigger anything automatically to avoid breaking the loop.
      console.log("Event check placeholder: No events triggered.");
    }
    return null;
  }

  private evaluateTrigger(trigger: Trigger, gameState: GameState): boolean {
    // TODO: Implement the logic for 'and', 'or', 'stat_check', etc.
    return false;
  }
}
