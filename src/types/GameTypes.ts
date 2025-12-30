// src/types/GameTypes.ts

/**
 * Defines a single player attribute.
 */
export interface StatDefinition {
  id: string;
  name: string;
  description: string;
}

/**
 * Represents the player character.
 */
export interface PlayerCharacter {
  name: string;
  role: 'Guitar' | 'Bass' | 'Keyboard' | 'Vocal' | 'Drum';
  gender: 'Male' | 'Female';
  stats: Map<string, number>;
  flags: Set<string>; // For tracking story flags like 'signed_major_label'
}

/**
 * Represents the overall state of the game.
 */
export interface GameState {
  player: PlayerCharacter;
  currentDate: Date; // Game time
  actionPoints: number; // AP for the current turn (week)
}

/**
 * An effect that modifies the game state.
 */
export interface Effect {
  stat: string;
  op: 'add' | 'subtract' | 'set';
  value: number;
}

/**
 * Defines an action a player can take during a turn.
 */
export interface GameAction {
  id: string;
  name: string;
  description: string;
  cost: {
    ap: number;
  };
  effects: Effect[];
}


// --- Event & Ending System Types ---

/**
 * A requirement to be met for a choice to be available or an event to trigger.
 */
export type Requirement = 
  | { type: 'stat_check'; stat: string; op: 'greater_than' | 'less_than' | 'equal_to' | 'greater_than_or_equal' | 'less_than_or_equal'; value: number }
  | { type: 'role_check'; role: PlayerCharacter['role'] }
  | { type: 'age_check'; is: number }
  | { type: 'date_check'; month: number; day: number }
  | { type: 'has_flag', flag: string };

/**
 * A trigger condition for an event or ending.
 */
export interface Trigger {
  and?: Requirement[];
  or?: Requirement[];
  probability?: number;
}

/**
 * A choice within an event.
 */
export interface EventChoice {
  text: string;
  requirements?: Requirement[];
  effects: Effect[];
}

/**
 * Defines a game event.
 */
export interface GameEvent {
  id: string;
  description: string;
  trigger: Trigger;
  choices: EventChoice[];
  visual?: string; // Optional background image
}

/**
 * Defines a game ending.
 */
export interface GameEnding {
  id: string;
  title: string;
  description: string;
  trigger: Trigger;
}