// src/engine/GameLoop.ts

import { GameState, PlayerCharacter, GameAction, Effect, GameEvent, GameEnding, EventChoice, LogEntry, BandMember } from '../types/GameTypes';
import { StatSystem } from './StatSystem';
import { ActionSystem } from './ActionSystem';
import { EventManager } from './EventManager';
import { EndingManager } from './EndingManager';

export interface SaveMeta {
  slot: string;
  playerName: string;
  week: number;
  age: number;
  savedAt: string; // ISO timestamp
}

const SAVE_INDEX_KEY = 'band_cry_save_index';
const SAVE_KEY = (slot: string) => `band_cry_save_${slot}`;

const START_AGE = 18;
const ACTION_POINTS_PER_WEEK = 4;
const WEEKLY_LIVING_COST = 80;

export class GameLoop {
  public gameState: GameState;
  private statSystem: StatSystem;
  private actionSystem: ActionSystem;
  private eventManager: EventManager;
  private endingManager: EndingManager;
  private birthYear: number;

  constructor(playerInfo: { name: string; gender: 'Male' | 'Female'; role: PlayerCharacter['role'] }) {
    this.statSystem = StatSystem.getInstance();
    this.actionSystem = ActionSystem.getInstance();
    this.eventManager = EventManager.getInstance();
    this.endingManager = EndingManager.getInstance();

    const startYear = new Date().getFullYear();
    this.birthYear = startYear - START_AGE;

    this.gameState = this.initializeGameState(playerInfo, startYear);
  }

  private initializeGameState(
    playerInfo: { name: string; gender: 'Male' | 'Female'; role: PlayerCharacter['role'] },
    startYear: number
  ): GameState {
    const player: PlayerCharacter = {
      name: playerInfo.name,
      gender: playerInfo.gender,
      role: playerInfo.role,
      stats: this.statSystem.initializeStats(),
      flags: new Set<string>(),
    };

    return {
      player,
      currentDate: new Date(startYear, 6, 1), // July 1st of start year
      actionPoints: ACTION_POINTS_PER_WEEK,
      week: 1,
      firedEventIds: new Set<string>(),
      log: [],
      bandMembers: [],
    };
  }

  public getAge(): number {
    return this.gameState.currentDate.getFullYear() - this.birthYear;
  }

  public getAvailableActions(): GameAction[] {
    return this.actionSystem.actions;
  }

  /** Perform an action and return a log message. Returns false if action invalid. */
  public performAction(actionId: string): string | null {
    const action = this.actionSystem.getAction(actionId);
    if (!action || this.gameState.actionPoints < action.cost.ap) {
      return null;
    }

    this.gameState.actionPoints -= action.cost.ap;
    this.applyEffects(action.effects);

    const logText = `执行了「${action.name}」`;
    this.addLog(logText);
    return logText;
  }

  /** End the current week. Returns triggered event, ending, or summary. */
  public endTurn(): { event: GameEvent | null; ending: GameEnding | null; summary: string[] } {
    const summary: string[] = [];

    // 1. Weekly living cost
    const money = this.gameState.player.stats.get('money') ?? 0;
    const cost = Math.min(money, WEEKLY_LIVING_COST);
    this.gameState.player.stats.set('money', Math.max(0, money - WEEKLY_LIVING_COST));
    if (cost > 0) summary.push(`支付了 ¥${cost} 生活费`);
    if (money < WEEKLY_LIVING_COST) summary.push(`⚠ 钱不够了，生活捉襟见肘`);

    // 2. Passive stat decay
    this.nudgeStat('health', -1);
    this.nudgeStat('sanity', -1);

    const health = this.gameState.player.stats.get('health') ?? 0;
    const sanity = this.gameState.player.stats.get('sanity') ?? 0;
    if (health < 20) summary.push(`⚠ 身体状态很差，注意休息`);
    if (sanity < 20) summary.push(`⚠ 精神状态濒临崩溃`);

    // 3. Advance time by one week
    const next = new Date(this.gameState.currentDate.getTime());
    next.setDate(next.getDate() + 7);
    this.gameState.currentDate = next;
    this.gameState.week++;

    // 4. Replenish action points
    this.gameState.actionPoints = ACTION_POINTS_PER_WEEK;

    // 5. Check for triggered events
    const triggeredEvent = this.eventManager.checkForTriggeredEvents(this.gameState, this.getAge());
    if (triggeredEvent) {
      if (triggeredEvent.oneTime) {
        this.gameState.firedEventIds.add(triggeredEvent.id);
      }
      return { event: triggeredEvent, ending: null, summary };
    }

    // 6. Check for endings
    const triggeredEnding = this.endingManager.checkEndings(this.gameState, this.getAge());
    if (triggeredEnding) {
      this.addLog(`【结局】${triggeredEnding.title}`);
      return { event: null, ending: triggeredEnding, summary };
    }

    return { event: null, ending: null, summary };
  }

  /** Apply an event choice's effects and flags. */
  public applyEventChoice(choice: EventChoice): void {
    this.applyEffects(choice.effects);
    if (choice.flags_add) choice.flags_add.forEach(f => this.gameState.player.flags.add(f));
    if (choice.flags_remove) choice.flags_remove.forEach(f => this.gameState.player.flags.delete(f));
    this.addLog(`选择了：${choice.text}`);
    if (choice.result_text) this.addLog(choice.result_text);
  }

  public applyEffects(effects: Effect[]): void {
    effects.forEach(effect => {
      const current = this.gameState.player.stats.get(effect.stat) ?? 0;
      let next = current;
      switch (effect.op) {
        case 'add':      next = current + effect.value; break;
        case 'subtract': next = current - effect.value; break;
        case 'set':      next = effect.value;           break;
      }
      if (effect.stat === 'money') {
        next = Math.max(0, next);
      } else {
        next = Math.max(0, Math.min(100, next));
      }
      this.gameState.player.stats.set(effect.stat, next);
    });
  }

  private nudgeStat(statId: string, delta: number): void {
    const val = this.gameState.player.stats.get(statId) ?? 0;
    const next = Math.max(0, Math.min(100, val + delta));
    this.gameState.player.stats.set(statId, next);
  }

  private addLog(text: string): void {
    this.gameState.log.push({ week: this.gameState.week, text });
    if (this.gameState.log.length > 60) this.gameState.log.shift();
  }

  // ── Save / Load ──────────────────────────────────────────

  public saveState(slot = 'autosave'): void {
    const data = {
      birthYear: this.birthYear,
      gameState: {
        player: {
          name: this.gameState.player.name,
          gender: this.gameState.player.gender,
          role: this.gameState.player.role,
          stats: Object.fromEntries(this.gameState.player.stats),
          flags: Array.from(this.gameState.player.flags),
        },
        currentDate: this.gameState.currentDate.toISOString(),
        actionPoints: this.gameState.actionPoints,
        week: this.gameState.week,
        firedEventIds: Array.from(this.gameState.firedEventIds),
        log: this.gameState.log,
        bandMembers: this.gameState.bandMembers,
      },
    };
    localStorage.setItem(SAVE_KEY(slot), JSON.stringify(data));

    // Update save index
    const metas = GameLoop.getSaveMetas();
    const meta: SaveMeta = {
      slot,
      playerName: this.gameState.player.name,
      week: this.gameState.week,
      age: this.getAge(),
      savedAt: new Date().toISOString(),
    };
    const idx = metas.findIndex(m => m.slot === slot);
    if (idx >= 0) metas[idx] = meta;
    else metas.push(meta);
    localStorage.setItem(SAVE_INDEX_KEY, JSON.stringify(metas));
  }

  public static hasSave(slot?: string): boolean {
    if (slot) return localStorage.getItem(SAVE_KEY(slot)) !== null;
    return GameLoop.getSaveMetas().length > 0;
  }

  public static getSaveMetas(): SaveMeta[] {
    const raw = localStorage.getItem(SAVE_INDEX_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) as SaveMeta[]; } catch { return []; }
  }

  public static deleteSave(slot: string): void {
    localStorage.removeItem(SAVE_KEY(slot));
    const metas = GameLoop.getSaveMetas().filter(m => m.slot !== slot);
    localStorage.setItem(SAVE_INDEX_KEY, JSON.stringify(metas));
  }

  /** Returns a GameLoop instance restored from a saved slot, or null if no save exists. */
  public static fromSave(slot = 'autosave'): GameLoop | null {
    const raw = localStorage.getItem(SAVE_KEY(slot));
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      const gs = data.gameState;
      const instance = new GameLoop({ name: gs.player.name, gender: gs.player.gender, role: gs.player.role });
      instance.birthYear = data.birthYear;
      instance.gameState = {
        player: {
          name: gs.player.name,
          gender: gs.player.gender,
          role: gs.player.role,
          stats: new Map(Object.entries(gs.player.stats) as [string, number][]),
          flags: new Set<string>(gs.player.flags),
        },
        currentDate: new Date(gs.currentDate),
        actionPoints: gs.actionPoints,
        week: gs.week,
        firedEventIds: new Set<string>(gs.firedEventIds),
        log: gs.log,
        bandMembers: gs.bandMembers ?? [],
      };
      return instance;
    } catch {
      return null;
    }
  }
}
