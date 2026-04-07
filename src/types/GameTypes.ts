// src/types/GameTypes.ts

export interface StatDefinition {
  id: string;
  name: string;
  description: string;
}

export interface PlayerCharacter {
  name: string;
  role: 'Guitar' | 'Bass' | 'Keyboard' | 'Vocal' | 'Drum';
  gender: 'Male' | 'Female';
  stats: Map<string, number>;
  flags: Set<string>;
}

export interface LogEntry {
  week: number;
  text: string;
}

export interface BandMember {
  id: string;
  name: string;
  role: PlayerCharacter['role'];
  chemistry: number; // 0-100, relationship value with player
  mood: 'happy' | 'neutral' | 'unhappy';
}

export interface GameState {
  player: PlayerCharacter;
  currentDate: Date;
  actionPoints: number;
  week: number;
  firedEventIds: Set<string>;
  log: LogEntry[];
  bandMembers: BandMember[];
}

export interface Effect {
  stat: string;
  op: 'add' | 'subtract' | 'set';
  value: number;
}

export interface GameAction {
  id: string;
  name: string;
  description: string;
  cost: { ap: number };
  effects: Effect[];
}

export type Requirement =
  | { type: 'stat_check'; stat: string; op: 'greater_than' | 'less_than' | 'equal_to' | 'greater_than_or_equal' | 'less_than_or_equal'; value: number }
  | { type: 'role_check'; role: PlayerCharacter['role'] }
  | { type: 'age_check'; is: number }
  | { type: 'date_check'; month: number; day?: number }
  | { type: 'week_check'; min: number }   // fires when week >= min
  | { type: 'has_flag'; flag: string }
  | { type: 'not_flag'; flag: string }
  | { type: 'probability'; chance: number };

export interface Trigger {
  and?: Requirement[];
  or?: Requirement[];
  probability?: number;
}

export interface EventChoice {
  text: string;
  requirements?: Requirement[];
  effects: Effect[];
  flags_add?: string[];
  flags_remove?: string[];
  result_text?: string;
}

export interface GameEvent {
  id: string;
  description: string;
  narrative?: string;
  trigger: Trigger;
  choices: EventChoice[];
  visual?: string;
  oneTime?: boolean;
}

export interface GameEnding {
  id: string;
  title: string;
  description: string;
  trigger: Trigger;
  epilogue?: string;
}
