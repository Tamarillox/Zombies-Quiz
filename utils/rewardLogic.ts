
import { Difficulty } from '../types';

export const MAX_LEVEL = 25;

export const calculateXpForNextLevel = (level: number): number => {
  if (level >= MAX_LEVEL) {
    return 0;
  }
  // Beginnt bei 500 XP für Level 1->2 und wird exponentiell schwieriger
  return Math.floor(500 * Math.pow(level, 1.8));
};

const XP_BASE: Record<Difficulty, number> = {
    [Difficulty.EASY]: 50,
    [Difficulty.MEDIUM]: 75,
    [Difficulty.HARD]: 125,
    [Difficulty.INSANE]: 200
};

export const calculateXpGain = (difficulty: Difficulty, round: number): number => {
    const baseXp = XP_BASE[difficulty];
    const roundBonus = round * 5; // Bonus fürs längere Überleben
    return baseXp + roundBonus;
};

export const calculateEvacuationBonus = (round: number): number => {
    // Quadratische Skalierung, um längere Runden wertvoller zu machen
    // und kurze "Evac-Farming"-Runden zu verhindern.
    return Math.floor(Math.pow(round, 2) * 10);
};

export interface LevelUpResult {
    newLevel: number;
    newXp: number;
    levelsGained: number;
}

export const processLevelUps = (currentLevel: number, currentXp: number, earnedXp: number): LevelUpResult => {
    if (currentLevel >= MAX_LEVEL) {
        return { newLevel: MAX_LEVEL, newXp: 0, levelsGained: 0 };
    }

    let newLevel = currentLevel;
    let totalXp = currentXp + earnedXp;
    let xpForNext = calculateXpForNextLevel(newLevel);
    
    let levelsGained = 0;

    while (xpForNext > 0 && totalXp >= xpForNext) {
        totalXp -= xpForNext;
        newLevel++;
        levelsGained++;
        xpForNext = calculateXpForNextLevel(newLevel);
    }
    
    if (newLevel >= MAX_LEVEL) {
        return { newLevel: MAX_LEVEL, newXp: 0, levelsGained };
    }

    return { newLevel, newXp: totalXp, levelsGained };
};
