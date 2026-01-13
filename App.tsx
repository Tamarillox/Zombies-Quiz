// Anleitung modal content
const AnleitungContent = () => (
  <div className="space-y-4 text-left text-base text-gray-200 max-w-md mx-auto">
    <h2 className="font-horror text-2xl text-bloodRed mb-2">Wie funktioniert das Spiel?</h2>
    <p>
      Willkommen beim Zombies Quiz! Ziel ist es, möglichst viele Fragen rund um Call of Duty Zombies richtig zu beantworten. Für jede richtige Antwort erhältst du Punkte und kannst neue Visitenkarten (Calling Cards) freischalten.
    </p>
    <h3 className="font-bold text-lg text-yellow-400 mt-4">Powerups</h3>
    <p>
      Während des Quiz erscheinen zufällig Powerups. Diese bringen dir Vorteile wie z.B. mehr Zeit, doppelte Punkte oder das Entfernen einer falschen Antwort.
    </p>
    <h3 className="font-bold text-lg text-blue-300 mt-4">Kaugummipaket</h3>
    <p>
      Vor dem Quiz kannst du bis zu 3 Kaugummis auswählen. Jeder Kaugummi hat einen besonderen Effekt, der dir im Spiel helfen kann – z.B. zusätzliche Leben. Überlege dir eine gute Kombination!
    </p>
    <h3 className="font-bold text-lg text-pink-300 mt-4">Dr. Montys Fabrik</h3>
    <p>
      In Dr. Montys Fabrik kannst du mit gesammeltem Divinium neue Kaugummis freischalten. Je mehr du spielst, desto mehr Divinium erhältst du. Probiere verschiedene Kaugummis aus, um deine Strategie zu verbessern!
    </p>
    <h3 className="font-bold text-lg text-green-300 mt-4">Noch nie Call of Duty Zombies gespielt?</h3>
    <p>
      Kein Problem! Das Quiz ist so gestaltet, dass du auch als Neuling Spaß hast. Lies die Fragen aufmerksam und nutze Powerups und Kaugummis zu deinem Vorteil. Viel Erfolg!
    </p>
  </div>
);
import React, { useState, useEffect, useCallback } from 'react';
import './global.css';
import { AppScreen, Question, UserInventory } from './types';
import QuizScreen, { QuizStats } from './components/QuizScreen';
import CollectionScreen from './components/CollectionScreen';
import FactoryScreen from './components/FactoryScreen';
import { ZOMBIES_QUESTIONS as DEFAULT_QUESTIONS } from './data/questions';
import { COLLECTION_ITEMS } from './data/collectionItems';
import { calculateEvacuationBonus, processLevelUps, calculateXpForNextLevel, MAX_LEVEL } from './utils/rewardLogic';
import { checkAndAwardCallingCards } from './utils/unlocks';
import { saveToLocalStorage } from './utils/storage';
import { spinVat } from './utils/gacha';

const INVENTORY_STORAGE_KEY = 'cod_zombies_inventory_v5';

const initialInventory: UserInventory = {
  level: 1,
  xp: 0,
  items: {},
  divinium: 0,
  gobblegums: {
    'gg_double_points': 0,
    'gg_random_powerup': 3,
    'gg_instakill': 0,
    'gg_max_ammo': 0,
    'gg_nuke': 0,
    'gg_freeze_time': 0,
    'gg_powerup_rain': 0,
    'gg_second_chance': 0,
  },
  gobblegumPack: [],
};

interface XPBarProps {
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  className?: string;
  isAnimated?: boolean;
  earnedXp?: number;
}

const XPBar: React.FC<XPBarProps> = ({ level, currentXp, xpForNextLevel, className, isAnimated = false, earnedXp = 0 }) => {
  const [displayLevel, setDisplayLevel] = useState(level);
  const [progress, setProgress] = useState(0);
  const [displayXp, setDisplayXp] = useState(currentXp);
  const [displayXpForNext, setDisplayXpForNext] = useState(xpForNextLevel);
  
  const isMaxLevel = level >= MAX_LEVEL;

  useEffect(() => {
    let startXp: number, endXp: number, startLevel: number;
    
    if (isAnimated) {
        const levelUpInfo = processLevelUps(level, currentXp, -earnedXp);
        startLevel = levelUpInfo.newLevel;
        startXp = levelUpInfo.newXp;
        endXp = currentXp;

        setDisplayLevel(startLevel);
        setDisplayXp(startXp);
        const startXpForNext = calculateXpForNextLevel(startLevel);
        setDisplayXpForNext(startXpForNext);
        setProgress(startXpForNext > 0 ? (startXp / startXpForNext) * 100 : 0);

        setTimeout(() => {
           if (isMaxLevel) {
               setDisplayLevel(MAX_LEVEL);
               setDisplayXp(0);
               setDisplayXpForNext(0);
               setProgress(100);
           } else {
               const finalProgress = xpForNextLevel > 0 ? (endXp / xpForNextLevel) * 100 : 0;
               setDisplayLevel(level);
               setDisplayXp(endXp);
               setDisplayXpForNext(xpForNextLevel);
               setProgress(finalProgress);
           }
        }, 100);
    } else {
        if (isMaxLevel) {
            setDisplayLevel(MAX_LEVEL);
            setProgress(100);
            setDisplayXp(0);
            setDisplayXpForNext(0);
        } else {
            setProgress(xpForNextLevel > 0 ? (currentXp / xpForNextLevel) * 100 : 0);
            setDisplayLevel(level);
            setDisplayXp(currentXp);
            setDisplayXpForNext(xpForNextLevel);
        }
    }
  }, [level, currentXp, xpForNextLevel, isAnimated, earnedXp, isMaxLevel]);


  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1 text-xs font-mono">
        <span className="font-bold text-perkBlue">{isMaxLevel ? 'Level MAX' : `Level ${displayLevel}`}</span>
        <span className="text-gray-400">{isMaxLevel ? 'MAX XP' : `${displayXp.toLocaleString()} / ${displayXpForNext.toLocaleString()} XP`}</span>
      </div>
      <div className="w-full bg-black/50 rounded-sm h-2.5 border border-gray-700 overflow-hidden">
        <div 
          className="bg-perkBlue h-full" 
          style={{ width: `${progress}%`, boxShadow: '0 0 10px #00FFFF', transition: 'width 1.5s ease-out' }}
        ></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.MENU);
  const [lastGameResult, setLastGameResult] = useState<(QuizStats & { unlockBonus?: number, diviniumEarned?: number }) | null>(null);
  const [showNoEventsModal, setShowNoEventsModal] = useState(false);
  const [questions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAnleitung, setShowAnleitung] = useState(false);

  const [inventory, setInventory] = useState<UserInventory>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration für bestehende Speicherstände
        return {
          ...initialInventory,
          ...parsed,
          divinium: parsed.divinium || 0,
          gobblegums: parsed.gobblegums || { 'gg_random_powerup': 3 },
          gobblegumPack: parsed.gobblegumPack || [],
        };
      }
      return initialInventory;
    } catch (e) {
      return initialInventory;
    }
  });

  const [postGameNotifications, setPostGameNotifications] = useState<{ type: 'unlock'; data: typeof COLLECTION_ITEMS[0] }[]>([]);
  const [showingPostGameNotification, setShowingPostGameNotification] = useState(false);
  const [lastUnlockedCards, setLastUnlockedCards] = useState<typeof COLLECTION_ITEMS>([]);

  useEffect(() => {
    saveToLocalStorage(INVENTORY_STORAGE_KEY, inventory);
  }, [inventory]);

  // Post-Game Notification Overlay (auto, wie im Spiel)
  useEffect(() => {
    if (showingPostGameNotification && postGameNotifications.length > 0) {
      const timer = setTimeout(() => {
        setPostGameNotifications(n => n.slice(1));
        if (postGameNotifications.length <= 1) setShowingPostGameNotification(false);
      }, 1200); // kürzere Anzeigedauer
      return () => clearTimeout(timer);
    }
  }, [showingPostGameNotification, postGameNotifications]);

  const handleQuit = (round: number, usedGums: Set<string>) => {
    setInventory(prev => {
      const newItems = { ...prev.items };
      const newGobblegums = { ...prev.gobblegums };
      let xp = prev.xp;
      let level = prev.level;

      for (const gumId of usedGums) {
        if (newGobblegums[gumId] > 0) {
          newGobblegums[gumId]--;
        }
      }

      const newGobblegumPack = prev.gobblegumPack.filter(gumId => (newGobblegums[gumId] || 0) > 0);

      if (round >= 20 && !newItems['do_betrayal']) {
        newItems['do_betrayal'] = 1;
        const betrayalCard = COLLECTION_ITEMS.find(c => c.id === 'do_betrayal');
        const xpReward = betrayalCard?.xpReward || 0;
        
        if (xpReward > 0) {
          const levelUpResult = processLevelUps(prev.level, prev.xp, xpReward);
          level = levelUpResult.newLevel;
          xp = levelUpResult.newXp;
        }
      }
      
      return {
        ...prev,
        level,
        xp,
        items: newItems,
        gobblegums: newGobblegums,
        gobblegumPack: newGobblegumPack,
      };
    });
    setScreen(AppScreen.MENU);
  };

  const handleFinish = (stats: QuizStats, diviniumEarned: number, usedGums: Set<string>) => {
    setInventory(prev => {
      const { newItems: initialNewItems, xpFromUnlocks } = checkAndAwardCallingCards(stats, prev, usedGums);
      const evacBonus = stats.wasEvacuated ? calculateEvacuationBonus(stats.roundsSurvived) : 0;
      const totalXpEarned = stats.xpEarned + evacBonus + xpFromUnlocks;

      // Finde alle neuen Calling Cards, die jetzt freigeschaltet wurden
      const unlockedNow = Object.keys(initialNewItems)
        .filter(id => !prev.items[id])
        .map(id => COLLECTION_ITEMS.find(c => c.id === id))
        .filter(Boolean) as typeof COLLECTION_ITEMS;
      // Erzeuge Notification-Objekte
      const unlockNotifs = unlockedNow.map(card => ({ type: 'unlock', data: card! }));
      setPostGameNotifications(unlockNotifs);
      setShowingPostGameNotification(unlockNotifs.length > 0);
      setLastUnlockedCards(unlockedNow);

      setLastGameResult({...stats, xpEarned: totalXpEarned, unlockBonus: xpFromUnlocks, diviniumEarned});

      const levelUpResult = processLevelUps(prev.level, prev.xp, totalXpEarned);
      const finalNewItems = {...initialNewItems};
      if (levelUpResult.newLevel === MAX_LEVEL && !finalNewItems['do_legacy']) {
          finalNewItems['do_legacy'] = 1;
      }

      const newGobblegums = { ...prev.gobblegums };
      for (const gumId of usedGums) {
        if (newGobblegums[gumId] > 0) {
          newGobblegums[gumId]--;
        }
      }

      const newGobblegumPack = prev.gobblegumPack.filter(gumId => (newGobblegums[gumId] || 0) > 0);

      return {
        ...prev,
        level: levelUpResult.newLevel,
        xp: levelUpResult.newXp,
        items: finalNewItems,
        divinium: prev.divinium + diviniumEarned,
        gobblegums: newGobblegums,
        gobblegumPack: newGobblegumPack,
      };
    });
    setScreen(AppScreen.RESULTS);
  };

  const handleResetProgress = useCallback(() => {
    localStorage.removeItem(INVENTORY_STORAGE_KEY);
    setInventory(initialInventory);
    setShowResetConfirm(false);
    setScreen(AppScreen.MENU);
  }, []);
  
  const handleSpendDivinium = (): string => {
    if (inventory.divinium < 1) return "";
    
    const receivedGumId = spinVat();
    setInventory(prev => ({
      ...prev,
      divinium: prev.divinium - 1,
      gobblegums: {
        ...prev.gobblegums,
        [receivedGumId]: (prev.gobblegums[receivedGumId] || 0) + 1,
      }
    }));
    return receivedGumId;
  };

  const handleSetGobblegumPack = (pack: string[]) => {
    setInventory(prev => ({...prev, gobblegumPack: pack}));
  };

  const renderContent = () => {
    switch (screen) {
      case AppScreen.MENU:
        return (
          <div className="flex flex-col min-h-screen p-4 relative overflow-hidden start-mobile-center" style={{overflow: 'hidden', touchAction: 'none'}}>
            {/* XPBar: more visible and lower on mobile */}
            <header className="w-full max-w-sm mx-auto z-20 bg-black/30 p-2 border-b border-gray-800 rounded-t-lg" style={{marginTop: 'clamp(16px, 4vw, 40px)'}}>
              <XPBar level={inventory.level} currentXp={inventory.xp} xpForNextLevel={calculateXpForNextLevel(inventory.level)} />
            </header>
            <main className="flex-1 flex flex-col items-center justify-start text-center" style={{marginTop: 'clamp(12px, 4vw, 40px)'}}>
              <div className="relative mb-12" style={{marginTop: 'clamp(12px, 4vw, 40px)'}}>
                <h1 className="font-horror text-[3.5rem] md:text-[7rem] text-bloodRed blood-shadow animate-title-glow" style={{fontSize: 'clamp(3.2rem, 10vw, 7.5rem)'}}>ZOMBIES QUIZ</h1>
              </div>
              <div className="max-w-xs w-full space-y-4">
                <button onClick={() => setScreen(AppScreen.QUIZ)} className="w-full py-3 text-lg font-bold text-white uppercase tracking-widest transform skew-x-[-15deg] bg-bloodRed/80 border-2 border-bloodRed hover:bg-bloodRed hover:shadow-[0_0_20px_#8B0000] transition-all">
                  <span className="inline-block transform skew-x-[15deg]">Quiz Starten</span>
                </button>
                <button onClick={() => setScreen(AppScreen.COLLECTION)} className="w-full py-3 text-lg font-bold text-gray-300 uppercase tracking-widest transform skew-x-[-15deg] bg-gray-800/80 border-2 border-gray-700 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all">
                  <span className="inline-block transform skew-x-[15deg]">Kaserne</span>
                </button>
                <button onClick={() => setScreen(AppScreen.FACTORY)} className="w-full py-3 text-lg font-bold text-yellow-500 uppercase tracking-widest transform skew-x-[-15deg] bg-yellow-900/80 border-2 border-yellow-700 hover:bg-yellow-800 hover:border-yellow-600 hover:text-yellow-400 transition-all">
                  <span className="inline-block transform skew-x-[15deg]">Dr. Montys Fabrik</span>
                </button>
                <button onClick={() => setShowAnleitung(true)} className="w-full py-3 text-lg font-bold text-blue-200 uppercase tracking-widest transform skew-x-[-15deg] bg-blue-900/80 border-2 border-blue-700 hover:bg-blue-800 hover:border-blue-400 hover:text-white transition-all">
                  <span className="inline-block transform skew-x-[15deg]">Anleitung</span>
                </button>
              </div>
            </main>
            {showAnleitung && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-grungeGray border-2 border-blue-700 p-8 rounded-lg text-center space-y-6 max-w-lg w-full relative animate-fade-in">
                  <button onClick={() => setShowAnleitung(false)} className="absolute top-2 right-2 text-blue-300 hover:text-white text-2xl font-bold">×</button>
                  <AnleitungContent />
                </div>
              </div>
            )}
            {showNoEventsModal && (
              <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-grungeGray border-2 border-bloodRed p-8 rounded-lg text-center space-y-6 max-w-sm w-full">
                  <h3 className="font-horror text-3xl text-white">Events</h3>
                  <p className="text-gray-400 text-sm">
                    Aktuell sind keine Events verfügbar. Schau bald wieder vorbei!
                  </p>
                  <button onClick={() => setShowNoEventsModal(false)} className="w-full py-3 bg-bloodRed text-white font-bold uppercase hover:bg-red-700 transition-colors mt-4">
                    Schließen
                  </button>
                </div>
              </div>
            )}
            {/* Spielstand löschen Button ganz unten, immer sichtbar */}
            <footer className="fixed bottom-0 left-0 w-full flex items-center justify-center gap-4 z-50 bg-black/60 p-2 border-t border-bloodRed/70">
              <button onClick={() => setShowResetConfirm(true)} className="text-bloodRed/70 text-xs font-mono uppercase cursor-pointer hover:text-white hover:bg-bloodRed border border-bloodRed/70 px-2 py-1 rounded-sm transition-colors">Spielstand löschen</button>
            </footer>
          </div>
        );
      case AppScreen.QUIZ:
        return (
          <QuizScreen 
            questions={questions}
            inventory={inventory}
            onFinish={handleFinish} 
            onQuit={handleQuit} 
          />
        );
       case AppScreen.COLLECTION:
        return (
          <CollectionScreen
            inventory={inventory}
            onClose={() => setScreen(AppScreen.MENU)}
            onSetPack={handleSetGobblegumPack}
            // devMode entfernt
          />
        );
      case AppScreen.FACTORY:
        return (
          <FactoryScreen
            inventory={inventory}
            onClose={() => setScreen(AppScreen.MENU)}
            onSpendDivinium={handleSpendDivinium}
          />
        );
      case AppScreen.RESULTS:
        if (!lastGameResult) {
            setScreen(AppScreen.MENU);
            return null;
        }
        const totalXpEarned = lastGameResult.xpEarned;
        const evacBonus = lastGameResult.wasEvacuated ? calculateEvacuationBonus(lastGameResult.roundsSurvived) : 0;
        const unlockBonus = lastGameResult.unlockBonus || 0;
        const answerXp = totalXpEarned - evacBonus - unlockBonus;
        const diviniumEarned = lastGameResult.diviniumEarned || 0;

        const { levelsGained } = processLevelUps(inventory.level, inventory.xp, -totalXpEarned);

        // Always show unlocked cards after the game, with heading and confirmation button
        // Only show overlay if notifications are still being shown
        if (showingPostGameNotification && postGameNotifications.length > 0) {
          const notif = postGameNotifications[0];
          const borderColor = notif.data.rarity === 'RARE' ? 'border-perkBlue' : notif.data.rarity === 'DARK_OPS' ? 'border-purple-500' : notif.data.rarity === 'EVENT' ? 'border-orange-500' : 'border-gray-500';
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
              <div className={`w-full max-w-sm p-3 bg-grungeGray border-b-4 rounded-b-lg shadow-2xl flex flex-col justify-center items-center text-center mx-auto animate-slide-in-down ${borderColor}`}> 
                <div className="flex items-center gap-3">
                  <img src={notif.data.imageUrl} alt={notif.data.name} className="w-12 h-12 object-contain" />
                  <div>
                    <p className="text-xs uppercase font-bold" style={{ color: 'white' }}>{notif.data.rarity} FREIGESCHALTET</p>
                    <p className="font-bold text-white text-sm">{notif.data.name}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-xs mt-2">{notif.data.description}</p>
              </div>
            </div>
          );
        }

        // After notifications, show unlocked cards with heading and confirmation
        // Use lastUnlockedCards for display
        const unlockedCards = postGameNotifications.length === 0 && lastGameResult && !showingPostGameNotification
          ? lastUnlockedCards
          : [];

        return (
          <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-black/90 p-4 text-center">
            <h2 className="font-horror text-6xl text-bloodRed blood-shadow">RUNDE ABGESCHLOSSEN</h2>
            <div className="bg-black/70 backdrop-blur-sm border-2 border-bloodRed/50 p-6 rounded-lg shadow-2xl space-y-6 w-full max-w-lg">
              <div className="font-mono text-base space-y-2">
                <div className="flex justify-between items-baseline"><p className="text-gray-400">Runde erreicht:</p><p className="text-white font-bold text-2xl">{lastGameResult.roundsSurvived}</p></div>
                <hr className="border-gray-800"/>
                <div className="flex justify-between"><p className="text-gray-400">Antworten-XP:</p><p className="text-white font-bold">{answerXp.toLocaleString()}</p></div>
                {lastGameResult.wasEvacuated && <div className="flex justify-between"><p className="text-gray-400">Evakuierungsbonus:</p><p className="text-green-400 font-bold">+{evacBonus.toLocaleString()}</p></div>}
                {unlockBonus > 0 && <div className="flex justify-between"><p className="text-gray-400">Freischaltbonus:</p><p className="text-purple-400 font-bold">+{unlockBonus.toLocaleString()}</p></div>}
                {diviniumEarned > 0 && <div className="flex justify-between"><p className="text-gray-400">Divinium gefunden:</p><p className="text-yellow-400 font-bold">{diviniumEarned}</p></div>}
                <hr className="border-gray-800"/>
                <div className="flex justify-between text-lg"><p className="text-white">Gesamt-XP:</p><p className="text-perkBlue font-bold">+{totalXpEarned.toLocaleString()}</p></div>
              </div>
              {levelsGained > 0 && (
                <div className="text-yellow-400 font-horror text-4xl animate-bounce pt-2">
                  LEVEL UP!
                </div>
              )}
              <XPBar 
                level={inventory.level} 
                currentXp={inventory.xp} 
                xpForNextLevel={calculateXpForNextLevel(inventory.level)}
                earnedXp={totalXpEarned}
                isAnimated={true} 
              />
              {/* Freigeschaltete Calling Cards */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Freigeschaltete Calling Cards</h3>
                {postGameNotifications.length === 0 && unlockedCards.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {unlockedCards.map(card => (
                      <div key={card.id} className={`flex items-center gap-3 bg-gray-800/60 rounded p-2 border-l-4 ${card.rarity === 'RARE' ? 'border-perkBlue' : card.rarity === 'DARK_OPS' ? 'border-purple-500' : card.rarity === 'EVENT' ? 'border-orange-500' : 'border-gray-500'}`}>
                        <img src={card.imageUrl} alt={card.name} className="w-10 h-10 object-contain" />
                        <div>
                          <p className="font-bold text-white text-sm">{card.name}</p>
                          <p className="text-xs text-gray-300">{card.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Keine neuen Calling Cards in dieser Runde freigeschaltet.</p>
                )}
              </div>
            </div>
            <button onClick={() => setScreen(AppScreen.MENU)} className="px-12 py-3 text-2xl font-horror text-white uppercase tracking-widest transform skew-x-[-15deg] bg-bloodRed hover:bg-red-700 hover:shadow-[0_0_20px_#8B0000] transition-all">
                <span className="inline-block transform skew-x-[15deg]">Weiter</span>
            </button>
          </div>
        );
      default: return <div className="flex flex-col items-center justify-center min-h-screen"><h1 className="font-horror text-4xl text-bloodRed">Fehler!</h1><button onClick={() => setScreen(AppScreen.MENU)}>Zurück</button></div>;
    }
  };
  return (
    <>
      {/* Landscape lock overlay for mobile portrait mode */}
      <div id="landscape-lock" style={{
        display: 'none',
        position: 'fixed',
        zIndex: 99999,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.97)',
        color: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
      }}>
        <div style={{fontSize: '2.2rem', fontWeight: 700, marginBottom: 16}}>Bitte drehe dein Gerät</div>
        <div style={{fontSize: '4rem', marginBottom: 24}}>🔄</div>
        <div style={{fontSize: '1.2rem'}}>Das Spiel ist nur im Querformat spielbar.</div>
      </div>
      <div id="app-root" className="min-h-screen text-white font-sans selection:bg-bloodRed selection:text-white">
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-grungeGray border-2 border-bloodRed p-8 rounded-lg text-center space-y-6 max-w-sm w-full">
              <h3 className="font-horror text-3xl text-white">SPIELSTAND LÖSCHEN?</h3>
              <p className="text-gray-400 text-sm">Dein gesamter Spielfortschritt, einschließlich Level, XP und aller freigeschalteten Calling Cards, wird DAUERHAFT gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleResetProgress} className="w-full py-3 bg-bloodRed text-white font-bold uppercase hover:bg-red-700 transition-colors">Ja, ALLES LÖSCHEN</button>
                <button onClick={() => setShowResetConfirm(false)} className="w-full py-3 bg-gray-600 text-white font-bold uppercase hover:bg-gray-700 transition-colors">Nein, abbrechen</button>
              </div>
            </div>
          </div>
        )}
        {renderContent()}
      </div>
    </>
  );
};
export default App;
