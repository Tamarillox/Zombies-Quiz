
import { GOBBLEGUMS } from '../data/gobblegums';
import { KaugummiRarity } from '../types';

// Gewichtung: Selten ist am häufigsten, Ultra am seltensten.
const RARITY_WEIGHTS: Record<KaugummiRarity, number> = {
  [KaugummiRarity.SELTEN]: 65,
  [KaugummiRarity.EPISCH]: 25,
  [KaugummiRarity.LEGENDÄR]: 8,
  [KaugummiRarity.ULTRA]: 2,
};

export const spinVat = (): string => {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  let chosenRarity: KaugummiRarity | null = null;

  for (const rarity in RARITY_WEIGHTS) {
    const weight = RARITY_WEIGHTS[rarity as KaugummiRarity];
    if (random < weight) {
      chosenRarity = rarity as KaugummiRarity;
      break;
    }
    random -= weight;
  }

  if (!chosenRarity) {
    // Fallback, sollte nie passieren
    chosenRarity = KaugummiRarity.SELTEN;
  }

  const possibleGums = GOBBLEGUMS.filter(gum => gum.rarity === chosenRarity);
  const randomGumIndex = Math.floor(Math.random() * possibleGums.length);
  
  return possibleGums[randomGumIndex].id;
};
