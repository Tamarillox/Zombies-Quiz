
import { GobbleGum, KaugummiRarity } from '../types';

export const GOBBLEGUMS: GobbleGum[] = [
  // Selten
  {
    id: 'gg_double_points',
    name: 'Wer zählt die Punkte?',
    rarity: KaugummiRarity.SELTEN,
    description: 'Aktiviert das Powerup "Doppelte Punkte".',
    icon: '2️⃣',
  },
  {
    id: 'gg_random_powerup',
    name: 'Was ist denn hier los?',
    rarity: KaugummiRarity.SELTEN,
    description: 'Aktiviert ein zufälliges Powerup.',
    icon: '❓',
    count: 3,
  },
  // Episch
  {
    id: 'gg_instakill',
    name: 'Freude am Töten',
    rarity: KaugummiRarity.EPISCH,
    description: 'Aktiviert das Powerup "Instakill".',
    icon: '💀',
  },
  {
    id: 'gg_max_ammo',
    name: 'Lagerkoller',
    rarity: KaugummiRarity.EPISCH,
    description: 'Aktiviert das Powerup "Maximale Munition".',
    icon: '📦',
  },
  // Legendär
  {
    id: 'gg_nuke',
    name: 'Kaboom',
    rarity: KaugummiRarity.LEGENDÄR,
    description: 'Aktiviert das Powerup "Atombombe".',
    icon: '☢️',
  },
  {
    id: 'gg_freeze_time',
    name: 'Starre Augen',
    rarity: KaugummiRarity.LEGENDÄR,
    description: 'Deaktiviert das Zeitlimit für die aktuelle Frage.',
    icon: '⏱️',
  },
  // Ultra
  {
    id: 'gg_powerup_rain',
    name: 'Regent-Tropfen',
    rarity: KaugummiRarity.ULTRA,
    description: 'Aktiviert "Doppelte Punkte", "Atombombe", "Instakill" und "Maximale Munition" nacheinander.',
    icon: '💧',
  },
  {
    id: 'gg_second_chance',
    name: 'Schildbürger',
    rarity: KaugummiRarity.ULTRA,
    description: 'Zweite Chance für die nächste Frage, die falsch beantwortet wird.',
    icon: '🛡️',
  },
];
