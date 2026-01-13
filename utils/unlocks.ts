
import { QuizStats, UserInventory } from '../types';
import { calculateEvacuationBonus } from './rewardLogic';
import { COLLECTION_ITEMS } from '../data/collectionItems';

export const checkAndAwardCallingCards = (
  stats: QuizStats,
  inventory: UserInventory,
  usedGums: Set<string>
): { newItems: { [key: string]: number }, xpFromUnlocks: number } => {
  const newItems = { ...inventory.items };
  let xpFromUnlocks = 0;

  const awardCard = (id: string) => {
    if (!newItems[id]) {
      newItems[id] = (newItems[id] || 0) + 1;
      const item = COLLECTION_ITEMS.find(i => i.id === id);
      if (item && item.xpReward) {
          xpFromUnlocks += item.xpReward;
      }
    }
  };

  // --- Normal Cards ---
  // 'Erster Kontakt' nur, wenn mindestens eine Frage richtig beantwortet wurde
  if (stats.correctAnswers > 0) awardCard('card_first_contact');
  if (stats.roundsSurvived >= 10) awardCard('card_survivor_10');
  if (stats.wasEvacuated) awardCard('card_evacuated');
  if (stats.roundsSurvived >= 20) awardCard('card_veteran_20');
  if (stats.roundsSurvived >= 30) awardCard('card_elite_30');
  
  // Calculate total XP for the high roller card
  const evacBonus = stats.wasEvacuated ? calculateEvacuationBonus(stats.roundsSurvived) : 0;
  const totalXpEarned = stats.xpEarned + evacBonus;
  if (totalXpEarned >= 10000) awardCard('card_high_roller');

  // --- Dark Ops Cards ---
  // Note: Cheated games don't get the 115 card to prevent manipulation
  if (stats.xpEarned === 115 && !stats.wasEvacuated) {
      awardCard('do_numbers');
  }
  
  // Evacuation started at round 6 finishes at the end of round 8.
  if (stats.wasEvacuated && stats.roundsSurvived === 8) {
      awardCard('do_close_call');
  }

  if (stats.hadFastAnswer) {
    awardCard('do_lightning_reflex');
  }
  
  if (stats.roundsSurvived === 55 && stats.correctAnswers === 55 && !stats.wasEvacuated) {
    awardCard('do_round_100');
  }

  if (usedGums.size >= 3) {
    awardCard('do_teddys_revenge');
  }

  // The 'do_betrayal' card is awarded in App.tsx's handleQuit function.
  // The 'do_legacy' card for max level is awarded in App.tsx's handleFinish function.

  return { newItems, xpFromUnlocks };
};
