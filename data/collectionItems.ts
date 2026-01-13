
import { CollectibleItem, Rarity, ItemType } from '../types';

export const COLLECTION_ITEMS: CollectibleItem[] = [
  // --- ÜBERARBEITETE CALLING CARDS ---
  
  // Common Cards
  { 
    id: 'card_first_contact', 
    name: 'Erster Kontakt', 
    rarity: Rarity.COMMON, 
    type: ItemType.CARD, 
    description: 'Beantworte eine Frage richtig.', 
    imageUrl: 'calling-cards/erster-kontakt.png',
    imageFit: 'contain',
    xpReward: 100,
    quote: '"Ich lebe noch... Das bedeutet, dass ich richtig lag."'
  },
  { 
    id: 'card_survivor_10', 
    name: 'Überlebensinstinkt', 
    rarity: Rarity.COMMON, 
    type: ItemType.CARD, 
    description: 'Erreiche Runde 10.', 
    imageUrl: 'calling-cards/ueberlebensinstinkt.png',
    imageFit: 'contain',
    xpReward: 1000,
    quote: '"10 Runden voller Fragen... und ich weiß immer noch nicht, was ich tue."'
  },
  
  // Rare Cards
  { 
    id: 'card_evacuated', 
    name: 'Letzter Ausweg', 
    rarity: Rarity.RARE, 
    type: ItemType.CARD, 
    description: 'Evakuiere zum ersten Mal erfolgreich.', 
    imageUrl: 'calling-cards/letzter-ausweg.png',
    xpReward: 2500,
    quote: '"Ich bin raus. Das Wissen bleibt, aber die Zombies können auf mich warten."'
  },
  { 
    id: 'card_veteran_20', 
    name: 'Kaltes Fleisch', 
    rarity: Rarity.RARE, 
    type: ItemType.CARD, 
    description: 'Erreiche Runde 20.', 
    imageUrl: 'calling-cards/kaltes-fleisch.png',
    imageFit: 'contain',
    xpReward: 2500,
    quote: '"20 Runden später und ich bin immer noch ein Nerv-Quiz-Opfer."'
  },
  { 
    id: 'card_elite_30', 
    name: 'Meister der Horde', 
    rarity: Rarity.RARE, 
    type: ItemType.CARD, 
    description: 'Erreiche Runde 30.', 
    imageUrl: 'calling-cards/meister-der-horde.png',
    xpReward: 2500,
    quote: '"30 Runden. Mein Gehirn ist Matsch, aber mein Wissen wächst."'
  },
  { 
    id: 'card_high_roller', 
    name: 'Wissensdurst', 
    rarity: Rarity.RARE, 
    type: ItemType.CARD, 
    description: 'Verdiene über 10.000 XP in einem einzigen Spiel.', 
    imageUrl: 'calling-cards/wissensdurst.png',
    xpReward: 2500,
    quote: '"10.000 XP... Mein Hirn verdient Urlaub."'
  },

  // Dark Ops Cards
  { 
    id: 'do_numbers', 
    name: 'Elementare Präzision', 
    rarity: Rarity.DARK_OPS, 
    type: ItemType.CARD, 
    description: 'Geheim: Beende das Spiel mit exakt 115 XP.', 
    imageUrl: 'calling-cards/elementare-praezision.png', 
    isSecret: true,
    xpReward: 10000,
    quote: '"115... Die Zahl, die alles erklärt."'
  },
  { 
    id: 'do_lightning_reflex', 
    name: 'Reflex des Jägers', 
    rarity: Rarity.DARK_OPS, 
    type: ItemType.CARD, 
    description: 'Geheim: Beantworte eine Frage in weniger als einer Sekunde korrekt.', 
    imageUrl: 'calling-cards/reflex-des-jaegers.png', 
    isSecret: true,
    xpReward: 10000,
    quote: '"Mein Finger war schneller als mein Gehirn. Das sollte nicht möglich sein."'
  },
  { 
    id: 'do_close_call', 
    name: 'Frühzeitiger Abzug', 
    rarity: Rarity.DARK_OPS, 
    type: ItemType.CARD, 
    description: 'Geheim: Starte die Evakuierung in Runde 6 und schließe sie erfolgreich ab.', 
    imageUrl: 'calling-cards/fruehzeitiger-abzug.png',
    isSecret: true,
    xpReward: 10000,
    quote: '"Evakuierung in Runde 6? Das war entweder Mut oder Wahnsinn."'
  },
  { 
    id: 'do_betrayal', 
    name: 'Kapitulation der Verzweiflung', 
    rarity: Rarity.DARK_OPS, 
    type: ItemType.CARD, 
    description: 'Geheim: Gib das Spiel in Runde 20 oder später auf.', 
    imageUrl: 'calling-cards/kapitulation-der-verzweiflung.png', 
    isSecret: true,
    xpReward: 10000,
    quote: '"Ich gebe auf... Aber nicht, bevor ich einen Achievement freischalte."'
  },
  { 
    id: 'do_round_100', 
    name: 'Die ultimative Antwort', 
    rarity: Rarity.DARK_OPS, 
    type: ItemType.CARD, 
    description: 'Geheim: Erreiche Runde 55 und beantworte die letzte Frage korrekt.', 
    imageUrl: 'calling-cards/die-ultimative-antwort.png', 
    isSecret: true,
    xpReward: 10000,
    quote: '"55 Runden... Die Antwort auf alles war dieses Quiz."'
  },
  { 
    id: 'do_legacy', 
    name: 'Prestige-Gott', 
    rarity: Rarity.DARK_OPS, 
    type: ItemType.CARD, 
    description: 'Geheim: Erreiche den maximalen Level.', 
    imageUrl: 'calling-cards/prestige-gott.png', 
    isSecret: true,
    xpReward: 0,
    quote: '"Ich bin maximal geprestiged. Gibt es noch etwas zu tun? Ich bin verloren."'
  },
  { 
    id: 'do_teddys_revenge', 
    name: 'Zuckerschock', 
    rarity: Rarity.DARK_OPS, 
    type: ItemType.CARD, 
    description: 'Geheim: Nutze 3 verschiedene Kaugummis in einem Spiel.', 
    imageUrl: 'calling-cards/zuckerschock.png', 
    isSecret: true,
    xpReward: 10000,
    quote: '"Drei Kaugummis in einem Spiel? Mein Gehirn ist ein Sugar-Rush-Monster."'
  }
];
