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
  eventLastFired: Map<string, number>; // eventId → turn number when last fired
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

export interface SkillCheck {
  stat: string;       // which stat to roll against
  difficulty: number; // stat value that gives ~50% success rate
}

export interface EventChoice {
  text: string;
  requirements?: Requirement[];
  effects: Effect[];            // guaranteed effects (applied regardless of skill check outcome)
  flags_add?: string[];
  flags_remove?: string[];
  result_text?: string;         // for choices without a skill check
  skill_check?: SkillCheck;
  success_text?: string;
  success_effects?: Effect[];
  fail_text?: string;
  fail_effects?: Effect[];
}

export interface GameEvent {
  id: string;
  description: string;
  narrative?: string;
  trigger: Trigger;
  choices: EventChoice[];
  visual?: string;
  oneTime?: boolean;
  cooldown?: number; // minimum turns between firings
}

export interface GameEnding {
  id: string;
  title: string;
  description: string;
  trigger: Trigger;
  epilogue?: string;
}
