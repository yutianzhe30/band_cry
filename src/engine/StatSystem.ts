// src/engine/StatSystem.ts

import yaml from 'js-yaml';
import { StatDefinition, PlayerCharacter } from '../types/GameTypes';
// Using Vite's raw file import feature
import statsYaml from '../data/stats.yaml?raw';

/**
 * Manages game statistics, their definitions, and initialization.
 */
export class StatSystem {
  private static instance: StatSystem;
  public statDefinitions: StatDefinition[];

  private constructor() {
    try {
      this.statDefinitions = yaml.load(statsYaml) as StatDefinition[];
    } catch (e) {
      console.error("Failed to load or parse stats.yaml:", e);
      this.statDefinitions = [];
    }
  }

  /**
   * StatSystem is a singleton to ensure stats are loaded only once.
   */
  public static getInstance(): StatSystem {
    if (!StatSystem.instance) {
      StatSystem.instance = new StatSystem();
    }
    return StatSystem.instance;
  }

  /**
   * Initializes the stats map for a new player character.
   * @returns A map of stat IDs to their initial numeric values.
   */
  public initializeStats(): Map<string, number> {
    const stats = new Map<string, number>();
    this.statDefinitions.forEach(statDef => {
      // Initialize all stats with a default value, e.g., 30
      // This could be randomized or based on character choices later.
      stats.set(statDef.id, 30);
    });

    // You can set specific initial values here if needed
    stats.set('money', 500);
    stats.set('health', 100);
    stats.set('sanity', 100);

    return stats;
  }

  /**
   * A helper to get a stat definition by its ID.
   * @param statId The ID of the stat to find.
   * @returns The StatDefinition or undefined if not found.
   */
  public getStatDefinition(statId: string): StatDefinition | undefined {
    return this.statDefinitions.find(def => def.id === statId);
  }
}
