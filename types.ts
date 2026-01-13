
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  INSANE = 'Insane'
}

export enum Category {
  LORE = 'Lore',
  EASTER_EGGS = 'Easter Eggs',
  GAMEPLAY = 'Gameplay',
  CHARACTERS = 'Characters'
}

export enum Saga {
  AETHER = 'Aether Saga',
  DARK_AETHER = 'Dark Aether Saga',
  CHAOS = 'Chaos Saga',
  ALL = 'Alle Sagas'
}

export enum Rarity {
  COMMON = 'Common',
  RARE = 'Rare',
  DARK_OPS = 'Dark Ops',
  EVENT = 'Event'
}

export enum KaugummiRarity {
  SELTEN = 'Selten',
  EPISCH = 'Episch',
  LEGENDÄR = 'Legendär',
  ULTRA = 'Ultra'
}

export enum ItemType {
  CARD = 'Calling Card'
}

export enum PowerUpType {
  NUKE = 'Atombombe',
  DOUBLE_POINTS = 'Doppelte Punkte',
  INSTA_KILL = 'Insta-Kill',
  MAX_AMMO = 'Maximale Munition',
}

export interface PowerUp {
  type: PowerUpType;
  icon: string;
}

export interface GobbleGum {
  id: string;
  name: string;
  rarity: KaugummiRarity;
  description: string;
  icon: string;
}

export interface CollectibleItem {
  id: string;
  name: string;
  rarity: Rarity;
  type: ItemType;
  description: string;
  imageUrl: string;
  /**
   * Preferred object-fit behavior when rendering the image. If omitted, the default is `cover`.
   */
  imageFit?: 'cover' | 'contain' | 'scale-down';
  color?: string;
  isSecret?: boolean;
  xpReward?: number;
  quote?: string;
}

export interface UserInventory {
  level: number;
  xp: number;
  items: { [key: string]: number };
  divinium: number;
  gobblegums: { [key: string]: number };
  gobblegumPack: string[];
}

export interface Question {
  id:string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty: Difficulty;
  category: Category;
  saga: Saga;
  explanation?: string;
}

export interface QuizStats {
  roundsSurvived: number;
  correctAnswers: number;
  xpEarned: number;
  wasEvacuated: boolean;
  hadFastAnswer: boolean;
}

export enum AppScreen {
  MENU,
  QUIZ,
  RESULTS,
  COLLECTION,
  FACTORY
}