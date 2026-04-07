// src/engine/TriggerEvaluator.ts

import { Trigger, Requirement, GameState } from '../types/GameTypes';

export function evaluateRequirement(req: Requirement, gameState: GameState, age: number): boolean {
  switch (req.type) {
    case 'stat_check': {
      const val = gameState.player.stats.get(req.stat) ?? 0;
      switch (req.op) {
        case 'greater_than':           return val > req.value;
        case 'less_than':              return val < req.value;
        case 'equal_to':               return val === req.value;
        case 'greater_than_or_equal':  return val >= req.value;
        case 'less_than_or_equal':     return val <= req.value;
        default:                       return false;
      }
    }
    case 'role_check':
      return gameState.player.role === req.role;
    case 'age_check':
      return age === req.is;
    case 'date_check': {
      const d = gameState.currentDate;
      const monthMatch = d.getMonth() + 1 === req.month;
      if (req.day !== undefined) return monthMatch && d.getDate() === req.day;
      return monthMatch;
    }
    case 'week_check':
      return gameState.week >= req.min;
    case 'has_flag':
      return gameState.player.flags.has(req.flag);
    case 'not_flag':
      return !gameState.player.flags.has(req.flag);
    case 'probability':
      return Math.random() < req.chance;
    default:
      return false;
  }
}

export function evaluateTrigger(trigger: Trigger, gameState: GameState, age: number): boolean {
  if (trigger.and && trigger.and.length > 0) {
    return trigger.and.every(req => evaluateRequirement(req, gameState, age));
  }
  if (trigger.or && trigger.or.length > 0) {
    return trigger.or.some(req => evaluateRequirement(req, gameState, age));
  }
  if (trigger.probability !== undefined) {
    return Math.random() < trigger.probability;
  }
  return false;
}

export function checkRequirements(requirements: Requirement[], gameState: GameState, age: number): boolean {
  return requirements.every(req => evaluateRequirement(req, gameState, age));
}
