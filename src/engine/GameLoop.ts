// src/engine/GameLoop.ts

import { GameState, PlayerCharacter, GameAction, Effect, GameEvent, GameEnding } from '../types/GameTypes';
import { StatSystem } from './StatSystem';
import { ActionSystem } from './ActionSystem';
import { EventManager } from './EventManager';
import { EndingManager } from './EndingManager';

const WEEKS_PER_YEAR = 52;
const START_AGE = 18;
const ACTION_POINTS_PER_WEEK = 4;

export class GameLoop {
  public gameState: GameState;
  private statSystem: StatSystem;
  private actionSystem: ActionSystem;
  private eventManager: EventManager;
  private endingManager: EndingManager;

  constructor(playerInfo: { name: string; gender: 'Male' | 'Female'; role: PlayerCharacter['role'] }) {
    this.statSystem = StatSystem.getInstance();
    this.actionSystem = ActionSystem.getInstance();
    this.eventManager = EventManager.getInstance();
    this.endingManager = EndingManager.getInstance();
    
    this.gameState = this.initializeGameState(playerInfo);
  }

  private initializeGameState(playerInfo: { name: string; gender: 'Male' | 'Female'; role: PlayerCharacter['role'] }): GameState {
    const player: PlayerCharacter = {
      name: playerInfo.name,
      gender: playerInfo.gender,
      role: playerInfo.role,
      stats: this.statSystem.initializeStats(),
      flags: new Set<string>(),
    };

    return {
      player,
      currentDate: new Date(new Date().getFullYear() + START_AGE, 0, 1), // Start at age 18
      actionPoints: ACTION_POINTS_PER_WEEK,
    };
  }

  public getAvailableActions(): GameAction[] {
    return this.actionSystem.actions;
  }
  
  public getAge(): number {
    const birthYear = this.gameState.currentDate.getFullYear() - START_AGE;
    return this.gameState.currentDate.getFullYear() - birthYear;
  }

  public performAction(actionId: string): { event: GameEvent | null, ending: GameEnding | null } {
    const action = this.actionSystem.getAction(actionId);
    if (!action || this.gameState.actionPoints < action.cost.ap) {
      console.warn(`Action ${actionId} not found or not enough AP.`);
      return { event: null, ending: null };
    }

    this.gameState.actionPoints -= action.cost.ap;
    this.applyEffects(action.effects);

    // If AP is now 0, automatically end the turn
    if (this.gameState.actionPoints === 0) {
      return this.endTurn();
    }
    
    // Return current state if turn is not over
    return { event: null, ending: null };
  }

  public endTurn(): { event: GameEvent | null, ending: GameEnding | null } {
    // 1. Apply weekly recurring effects (e.g., rent)
    // TODO: this.applyWeeklyCosts();

    // 2. Advance time
    this.gameState.currentDate.setDate(this.gameState.currentDate.getDate() + 7);

    // 3. Replenish Action Points
    this.gameState.actionPoints = ACTION_POINTS_PER_WEEK;

    // 4. Check for events
    const triggeredEvent = this.eventManager.checkForTriggeredEvents(this.gameState);
    if (triggeredEvent) {
      // The UI will handle showing the event. Game is paused until choice is made.
      return { event: triggeredEvent, ending: null };
    }

    // 5. Check for endings
    const triggeredEnding = this.endingManager.checkEndings(this.gameState);
    if (triggeredEnding) {
      // Game over
      return { event: null, ending: triggeredEnding };
    }
    
    return { event: null, ending: null };
  }

  public applyEffects(effects: Effect[]) {
    effects.forEach(effect => {
      const currentVal = this.gameState.player.stats.get(effect.stat) || 0;
      let newVal = currentVal;
      switch (effect.op) {
        case 'add':
          newVal += effect.value;
          break;
        case 'subtract':
          newVal -= effect.value;
          break;
        case 'set':
          newVal = effect.value;
          break;
      }
      this.gameState.player.stats.set(effect.stat, newVal);
    });
  }
}
