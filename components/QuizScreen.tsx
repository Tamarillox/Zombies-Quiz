
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, Difficulty, UserInventory, PowerUp, PowerUpType, CollectibleItem, Rarity, KaugummiRarity } from '../types';
import { calculateXpGain } from '../utils/rewardLogic';
import { COLLECTION_ITEMS } from '../data/collectionItems';
import { GOBBLEGUMS } from '../data/gobblegums';
import Tooltip from './Tooltip';

interface QuizScreenProps {
  questions: Question[];
  inventory: UserInventory;
  onFinish: (stats: QuizStats, diviniumEarned: number, usedGums: Set<string>) => void;
  onQuit: (round: number, usedGums: Set<string>) => void;
}

export interface QuizStats {
  roundsSurvived: number;
  correctAnswers: number;
  xpEarned: number;
  wasEvacuated: boolean;
  hadFastAnswer: boolean;
}

const POWER_UPS: PowerUp[] = [
  { type: PowerUpType.NUKE, icon: '☢️' },
  { type: PowerUpType.DOUBLE_POINTS, icon: '2️⃣' },
  { type: PowerUpType.INSTA_KILL, icon: '💀' },
  { type: PowerUpType.MAX_AMMO, icon: '📦' },
];

type Notification = 
  | { type: 'unlock'; data: CollectibleItem }
  | { type: 'divinium' };

const QuizScreen: React.FC<QuizScreenProps> = ({ 
  questions: allQuestions,
  inventory,
  onFinish, 
  onQuit 
}) => {
  const [round, setRound] = useState(1);
  const [sessionXp, setSessionXp] = useState(0);
  const [diviniumEarned, setDiviniumEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isGameOver, setIsGameOver] = useState(false);
  const [cheated, setCheated] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [currentQuestionData, setCurrentQuestionData] = useState<any>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [hadFastAnswer, setHadFastAnswer] = useState(false);
  
  const [evacuationProgress, setEvacuationProgress] = useState<number | null>(null);
  const [evacuationStatus, setEvacuationStatus] = useState<'success' | 'failed' | null>(null);

  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  
  const [activePowerUp, setActivePowerUp] = useState<PowerUp | null>(null);
  const [nextPowerUpRound, setNextPowerUpRound] = useState(() => Math.floor(Math.random() * 4) + 2);
  const [showPowerUpDrop, setShowPowerUpDrop] = useState<PowerUp | null>(null);
  const [eliminatedOption, setEliminatedOption] = useState<number | null>(null);
  const [isNuking, setIsNuking] = useState(false);
  
  // Kaugummi-Status
  const [usedGums, setUsedGums] = useState(new Set<string>());
  const [hasSecondChance, setHasSecondChance] = useState(false);
  const [isTimerFrozen, setIsTimerFrozen] = useState(false);
  const [powerupQueue, setPowerupQueue] = useState<PowerUpType[]>([]);
  const [roundsSinceDiviniumDrop, setRoundsSinceDiviniumDrop] = useState(0);
  const [pendingPowerUps, setPendingPowerUps] = useState<PowerUpType[]>([]);
  
  // Benachrichtigungssystem
  const [notificationQueue, setNotificationQueue] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isExitingNotification, setIsExitingNotification] = useState(false);
  const sessionUnlocks = useRef(new Set<string>());
  const doublePointsRef = useRef(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartTimeRef = useRef<number>(0);

  const easyPool = useRef<Question[]>([]);
  const mediumPool = useRef<Question[]>([]);
  const hardPool = useRef<Question[]>([]);
  const insanePool = useRef<Question[]>([]);
  
  const isEvacPossible = round >= 6 && (round - 1) % 5 === 0;

  const triggerUnlockNotification = useCallback((cardId: string) => {
    if (inventory.items[cardId] || sessionUnlocks.current.has(cardId)) return;
    const card = COLLECTION_ITEMS.find(c => c.id === cardId);
    if (card) {
      setNotificationQueue(prev => [...prev, { type: 'unlock', data: card }]);
      sessionUnlocks.current.add(cardId);
    }
  }, [inventory.items]);

  useEffect(() => {
    if (round === 10) triggerUnlockNotification('card_survivor_10');
    if (round === 20) triggerUnlockNotification('card_veteran_20');
    if (round === 30) triggerUnlockNotification('card_elite_30');
  }, [round, triggerUnlockNotification]);

  // Effekt zur Verwaltung der Benachrichtigungswarteschlange
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const [nextNotification, ...rest] = notificationQueue;
      setCurrentNotification(nextNotification);
      setNotificationQueue(rest);
    }
  }, [notificationQueue, currentNotification]);

  // Effekt zur Steuerung der Anzeige- und Ausblenddauer von Benachrichtigungen
  useEffect(() => {
    if (currentNotification) {
      const displayTime = currentNotification.type === 'unlock' ? 2500 : 2000;
      const exitTimer = setTimeout(() => {
        setIsExitingNotification(true);
      }, displayTime);
      return () => clearTimeout(exitTimer);
    }
  }, [currentNotification]);

  // Effekt zum Aufräumen nach der Ausblendanimation
  useEffect(() => {
    if (isExitingNotification) {
      const cleanupTimer = setTimeout(() => {
        setCurrentNotification(null);
        setIsExitingNotification(false);
      }, 300); // Entspricht der Animationsdauer
      return () => clearTimeout(cleanupTimer);
    }
  }, [isExitingNotification]);

  // Effekt zur Aktivierung ausstehender Powerups nacheinander
  useEffect(() => {
    if (pendingPowerUps.length > 0 && !isGameOver) {
      const activateNextPowerUp = (index: number) => {
        if (index < pendingPowerUps.length) {
          const powerupType = pendingPowerUps[index];
          const powerup = POWER_UPS.find(p => p.type === powerupType);
          if (powerup) {
            setActivePowerUp(powerup);
            setShowPowerUpDrop(powerup);
            setTimeout(() => setShowPowerUpDrop(null), 2000);
            setTimeout(() => activateNextPowerUp(index + 1), 1000);
          }
        } else {
          setPendingPowerUps([]);
        }
      };
      activateNextPowerUp(0);
    }
  }, [pendingPowerUps, isGameOver]);

  // Automatisch NUKE ausführen wenn DOUBLE_POINTS von powerup_rain aktiviert wurde
  useEffect(() => {
    if (
      activePowerUp?.type === PowerUpType.DOUBLE_POINTS &&
      powerupQueue.length > 0 &&
      powerupQueue[0] === PowerUpType.NUKE &&
      doublePointsRef.current &&
      !isGameOver &&
      currentQuestionData
    ) {
      const timer = setTimeout(() => {
        setIsNuking(true);
        setTimeout(() => {
          let xp = calculateXpGain(currentQuestionData.difficulty, round);
          if (doublePointsRef.current) {
            xp *= 2;
            doublePointsRef.current = false;
          }
          setSessionXp(prev => prev + xp);
          setCorrectCount(prev => prev + 1);
          setIsNuking(false);
          // Extract remaining powerups and set as pending
          const [, ...remaining] = powerupQueue;
          if (remaining.length > 0) {
            setPendingPowerUps(remaining);
          }
          setPowerupQueue([]);
          setActivePowerUp(null);
          // Trigger next round
          setSelectedOption(null);
          setEliminatedOption(null);
          setIsTimerFrozen(false);
          setRoundsSinceDiviniumDrop(prev => prev + 1);
          setRound(round + 1);
          setCurrentQuestionData(prepareQuestion(getNextQuestion(round + 1)));
        }, 1000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activePowerUp, powerupQueue, isGameOver, currentQuestionData, round]);

  const getDifficultyForRound = (r: number): Difficulty => {
    if (r <= 5) return Difficulty.EASY;
    if (r <= 15) return Difficulty.MEDIUM;
    if (r <= 30) return Difficulty.HARD;
    return Difficulty.INSANE;
  };

  const getProgressColor = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.EASY: return 'bg-green-500';
      case Difficulty.MEDIUM: return 'bg-yellow-500';
      case Difficulty.HARD: return 'bg-orange-600';
      case Difficulty.INSANE: return 'bg-bloodRed animate-pulse shadow-[0_0_10px_#8B0000]';
      default: return 'bg-gray-500';
    }
  };

  const setupPools = useCallback(() => {
    const shuffle = (arr: Question[]) => [...arr].sort(() => Math.random() - 0.5);
    easyPool.current = shuffle(allQuestions.filter(q => q.difficulty === Difficulty.EASY));
    mediumPool.current = shuffle(allQuestions.filter(q => q.difficulty === Difficulty.MEDIUM));
    hardPool.current = shuffle(allQuestions.filter(q => q.difficulty === Difficulty.HARD));
    insanePool.current = shuffle(allQuestions.filter(q => q.difficulty === Difficulty.INSANE));
  }, [allQuestions]);

  const getNextQuestion = useCallback((currentRound: number): Question => {
    const difficulty = getDifficultyForRound(currentRound);
    let pool: React.MutableRefObject<Question[]>;
    let tier: Difficulty;

    switch(difficulty) {
        case Difficulty.EASY: pool = easyPool; tier = Difficulty.EASY; break;
        case Difficulty.MEDIUM: pool = mediumPool; tier = Difficulty.MEDIUM; break;
        case Difficulty.HARD: pool = hardPool; tier = Difficulty.HARD; break;
        case Difficulty.INSANE: pool = insanePool; tier = Difficulty.INSANE; break;
    }
    
    if (pool.current.length === 0) {
        pool.current = [...allQuestions.filter(q => q.difficulty === tier)].sort(() => Math.random() - 0.5);
    }
    return pool.current.pop()!;
  }, [allQuestions]);
  
  const prepareQuestion = (q: Question | null) => {
    if (!q) return null;
    const originalOptions = [...q.options];
    const correctAnswerText = originalOptions[q.correctAnswerIndex];
    const shuffled = originalOptions.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
    return { ...q, shuffledOptions: shuffled, shuffledCorrectIndex: shuffled.indexOf(correctAnswerText) };
  };
  
  useEffect(() => {
    setupPools();
    setCurrentQuestionData(prepareQuestion(getNextQuestion(1)));
  }, [setupPools, getNextQuestion]);

  useEffect(() => {
    if (currentQuestionData) {
      questionStartTimeRef.current = Date.now();
    }
  }, [currentQuestionData]);

  useEffect(() => {
    const handleVisibilityChange = () => { if (document.hidden) setCheated(true); };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const finishQuiz = useCallback((wasEvacuated: boolean = false, bonusDivinium: number = 0) => {
    if (isGameOver) return;
    
    if (wasEvacuated) {
      setEvacuationStatus('success');
      triggerUnlockNotification('card_evacuated');
      if (round === 8) triggerUnlockNotification('do_close_call');
    } else if (evacuationProgress !== null) {
      setEvacuationStatus('failed');
    }
    
    setIsGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const delay = evacuationStatus ? 2500 : 1500;
    setTimeout(() => {
        const stats: QuizStats = {
            roundsSurvived: round,
            correctAnswers: correctCount,
            xpEarned: cheated ? Math.floor(sessionXp / 2) : sessionXp,
            wasEvacuated: wasEvacuated,
            hadFastAnswer: hadFastAnswer,
        };
        onFinish(stats, diviniumEarned + bonusDivinium, usedGums);
    }, delay);
  }, [isGameOver, correctCount, round, onFinish, sessionXp, cheated, evacuationProgress, evacuationStatus, hadFastAnswer, triggerUnlockNotification, diviniumEarned, usedGums]);

  const nextRound = useCallback(() => {
    setSelectedOption(null);
    setEliminatedOption(null);
    setIsTimerFrozen(false);
    setRoundsSinceDiviniumDrop(prev => prev + 1);
    
    let currentPowerup = activePowerUp;
    if (powerupQueue.length > 0) {
      const [nextPowerupType, ...rest] = powerupQueue;
      const nextPowerup = POWER_UPS.find(p => p.type === nextPowerupType);
      if (nextPowerup) {
        currentPowerup = nextPowerup;
        setActivePowerUp(nextPowerup);
        // If the queued powerup is DOUBLE_POINTS, mark the multiplier so
        // it can be consumed later (e.g. by a following NUKE).
        if (nextPowerup.type === PowerUpType.DOUBLE_POINTS) doublePointsRef.current = true;
        setShowPowerUpDrop(nextPowerup);
        setTimeout(() => setShowPowerUpDrop(null), 3000);
      }
      setPowerupQueue(rest);
    } else {
      setActivePowerUp(null); // Reset after use, if not in queue
    }

    const nextR = round + 1;
    
    if (!currentPowerup && nextR === nextPowerUpRound) {
        const chosenPowerUp = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
        setActivePowerUp(chosenPowerUp);
        setShowPowerUpDrop(chosenPowerUp);
        setTimeout(() => setShowPowerUpDrop(null), 3000);
        setNextPowerUpRound(nextR + Math.floor(Math.random() * 4) + 3);
    }

    setRound(nextR);
    setCurrentQuestionData(prepareQuestion(getNextQuestion(nextR)));
  }, [round, getNextQuestion, nextPowerUpRound, activePowerUp, powerupQueue]);

  useEffect(() => {
    if (isGameOver || !currentQuestionData) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    
    if (activePowerUp) {
      switch (activePowerUp.type) {
        case PowerUpType.NUKE:
          setIsNuking(true);
          setTimeout(() => {
            let xp = calculateXpGain(currentQuestionData.difficulty, round);
            // If double-points was applied just before the nuke, award double XP.
            if (doublePointsRef.current) {
              xp *= 2;
              doublePointsRef.current = false;
            }
            setSessionXp(prev => prev + xp);
            setCorrectCount(prev => prev + 1);
            // Also reduce evacuation progress as if the question was answered correctly
            if (evacuationProgress !== null) {
              const nextProgress = evacuationProgress - 1;
              if (nextProgress === 0) { finishQuiz(true); return; }
              setEvacuationProgress(nextProgress);
            }
            setIsNuking(false);
            // Extract remaining powerups from queue and set as pending
            if (powerupQueue.length > 0) {
              setPendingPowerUps(powerupQueue);
              setPowerupQueue([]);
            }
            nextRound();
          }, 1000);
          return;
        case PowerUpType.INSTA_KILL:
          let incorrectIndex;
          do { incorrectIndex = Math.floor(Math.random() * currentQuestionData.shuffledOptions.length); } 
          while (incorrectIndex === currentQuestionData.shuffledCorrectIndex);
          setEliminatedOption(incorrectIndex);
          break;
      }
    }

    if (isTimerFrozen) return;

    const initialTime = activePowerUp?.type === PowerUpType.MAX_AMMO ? 20 : 10;
    setTimeLeft(initialTime);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (hasSecondChance) {
             setHasSecondChance(false);
             nextRound();
          } else {
            finishQuiz(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [round, currentQuestionData, activePowerUp, isGameOver, isTimerFrozen, hasSecondChance, finishQuiz, nextRound]);


  const handleAnswer = (idx: number) => {
    if (selectedOption !== null || !currentQuestionData) return;

    const answerTime = Date.now() - questionStartTimeRef.current;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(idx);
    const correct = currentQuestionData.shuffledCorrectIndex === idx;

    if (correct) {
      if (correctCount === 0) triggerUnlockNotification('card_first_contact');
      if (!hadFastAnswer && answerTime < 1000) {
        setHadFastAnswer(true);
        triggerUnlockNotification('do_lightning_reflex');
      }

      // Divinium-Chance mit Pity-Timer
      let diviniumAwardedThisTurn = false;
      if (roundsSinceDiviniumDrop >= 14) { // Pity-Timer: 15 Runden seit dem letzten Drop
        diviniumAwardedThisTurn = true;
      } else if (Math.random() < 0.15) { // Normale Chance
        diviniumAwardedThisTurn = true;
      }
  
      if (diviniumAwardedThisTurn) {
        setDiviniumEarned(prev => prev + 1);
        setNotificationQueue(prev => [...prev, { type: 'divinium' }]);
        setRoundsSinceDiviniumDrop(-1); // Wird in nextRound auf 0 gesetzt
      }

      let xp = calculateXpGain(currentQuestionData.difficulty, round);
      if (activePowerUp?.type === PowerUpType.DOUBLE_POINTS) {
        xp *= 2;
      }
      setSessionXp(prev => prev + xp);
      setCorrectCount(prev => prev + 1);

      if (round === 55) { 
        finishQuiz(false, 3); // Überlebensbonus
        return; 
      }
      if (evacuationProgress !== null) {
        const nextProgress = evacuationProgress - 1;
        if (nextProgress === 0) { finishQuiz(true); return; }
        setEvacuationProgress(nextProgress);
      }
      
      setTimeout(nextRound, 1200);
    } else {
      if (hasSecondChance) {
        setHasSecondChance(false);
        setEliminatedOption(idx);
        setSelectedOption(null);
      } else {
        finishQuiz(false);
      }
    }
  };

  const handleActivateGum = (gumId: string) => {
    if (usedGums.has(gumId)) return;
    
    setUsedGums(new Set(usedGums).add(gumId));
  
    const showAnimation = (powerUp: PowerUp | null | undefined) => {
      if (!powerUp) return;
      setShowPowerUpDrop(powerUp);
      setTimeout(() => setShowPowerUpDrop(null), 3000);
    };
  
    switch(gumId) {
      case 'gg_double_points': {
        const powerUp = POWER_UPS.find(p => p.type === PowerUpType.DOUBLE_POINTS)!;
        setActivePowerUp(powerUp);
        doublePointsRef.current = true;
        showAnimation(powerUp);
        break;
      }
      case 'gg_random_powerup': {
        const powerUp = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
        setActivePowerUp(powerUp);
        showAnimation(powerUp);
        break;
      }
      case 'gg_instakill': {
        const powerUp = POWER_UPS.find(p => p.type === PowerUpType.INSTA_KILL)!;
        setActivePowerUp(powerUp);
        showAnimation(powerUp);
        break;
      }
      case 'gg_max_ammo': {
        const powerUp = POWER_UPS.find(p => p.type === PowerUpType.MAX_AMMO)!;
        setActivePowerUp(powerUp);
        showAnimation(powerUp);
        break;
      }
      case 'gg_nuke': {
        const powerUp = POWER_UPS.find(p => p.type === PowerUpType.NUKE)!;
        setActivePowerUp(powerUp);
        showAnimation(powerUp);
        break;
      }
      case 'gg_freeze_time':
        setIsTimerFrozen(true);
        break;
      case 'gg_second_chance':
        setHasSecondChance(true);
        break;
      case 'gg_powerup_rain': {
        const rainTypes = [PowerUpType.NUKE, PowerUpType.INSTA_KILL, PowerUpType.MAX_AMMO];
        const firstPowerup = POWER_UPS.find(p => p.type === PowerUpType.DOUBLE_POINTS)!;
        
        // Activate DOUBLE_POINTS immediately
        setActivePowerUp(firstPowerup);
        doublePointsRef.current = true;
        showAnimation(firstPowerup);
        
        // Queue the remaining powerups (NUKE, INSTA_KILL, MAX_AMMO)
        setPowerupQueue(rainTypes);
        break;
      }
    }
  };

  const handleStartEvacuation = () => { if (isEvacPossible && evacuationProgress === null) setEvacuationProgress(3); };
  const handleQuitConfirm = () => { setShowQuitConfirm(false); onQuit(round, usedGums); };
  
  const getEvacButtonText = () => {
    if (evacuationProgress !== null) return 'EVAKUIERUNG LÄUFT';
    if (isEvacPossible) return 'Evakuierung starten';
    if (round < 6) return 'Evakuierung ab Runde 6';
    const nextEvacRound = Math.ceil((round - 1) / 5) * 5 + 1;
    return `Nächste Evak. in Rd. ${nextEvacRound}`;
  };

  if (!currentQuestionData) return <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center"><h2 className="font-horror text-4xl text-bloodRed mb-4 animate-pulse">LADE SEQUENZ 115...</h2></div>;

  const rarityBorderColor: Record<Rarity, string> = {
    [Rarity.COMMON]: 'border-gray-500', [Rarity.RARE]: 'border-perkBlue', [Rarity.DARK_OPS]: 'border-purple-500', [Rarity.EVENT]: 'border-orange-500'
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-between relative overflow-hidden" style={{overflow: 'hidden'}}>
      {isNuking && <div className="absolute inset-0 bg-white z-50 animate-nuke-flash pointer-events-none"></div>}

      {showQuitConfirm && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-grungeGray border-2 border-bloodRed p-8 rounded-lg text-center space-y-6 max-w-sm w-full">
            <h3 className="font-horror text-3xl text-white">Spiel Verlassen?</h3><p className="text-gray-400 text-sm">Bist du sicher? Dein gesamter Fortschritt in dieser Runde wird verworfen.</p><div className="flex flex-col gap-3"><button onClick={handleQuitConfirm} className="w-full py-3 bg-bloodRed text-white font-bold uppercase hover:bg-red-700 transition-colors">Ja, Verlassen</button><button onClick={() => setShowQuitConfirm(false)} className="w-full py-3 bg-gray-600 text-white font-bold uppercase hover:bg-gray-700 transition-colors">Nein, Weiterspielen</button></div>
          </div>
        </div>
      )}
      {evacuationStatus && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center text-center p-4 animate-pulse">
          <div><h3 className={`font-horror text-6xl ${evacuationStatus === 'success' ? 'text-green-500' : 'text-bloodRed'}`}>{evacuationStatus === 'success' ? 'Evakuierung Erfolgreich' : 'Evakuierung Gescheitert'}</h3></div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex flex-col items-center my-auto z-10 w-full max-w-2xl">
        {/* Fixed-height notification area to prevent layout shift */}
        <div style={{ minHeight: 80, marginBottom: 8, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          {currentNotification && (
            <div className={`w-full max-w-sm p-3 bg-grungeGray border-b-4 rounded-b-lg shadow-2xl z-50 flex flex-col justify-center items-center text-center mx-auto ${isExitingNotification ? 'animate-slide-out-up' : 'animate-slide-in-down'} 
              ${currentNotification.type === 'unlock' ? rarityBorderColor[currentNotification.data.rarity] : 'border-yellow-500'}`}>
                {currentNotification.type === 'unlock' && (
                  <div className="flex items-center gap-3">
                    {(() => {
                      const src = currentNotification.data.imageUrl;
                      const isImg = typeof src === 'string' && (src.startsWith('/') || src.startsWith('http') || /\.(png|jpg|jpeg|webp|gif|svg)$/.test(src));
                      return isImg ? <img src={src} alt={currentNotification.data.name} className="w-12 h-12 object-contain" /> : <p className="text-3xl">{src}</p>;
                    })()}
                    <div>
                      <p className={`text-xs uppercase font-bold`} style={{ color: rarityBorderColor[currentNotification.data.rarity].replace('border-', '') }}>{currentNotification.data.rarity} FREIGESCHALTET</p>
                      <p className="font-bold text-white text-sm">{currentNotification.data.name}</p>
                    </div>
                  </div>
                )}
                {currentNotification.type === 'divinium' && (
                  <div className="flex items-center gap-3">
                    <p className="text-3xl">🧪</p>
                    <div>
                      <p className="text-xs uppercase font-bold text-yellow-400">RESSOURCE GEFUNDEN</p>
                      <p className="font-bold text-white text-sm">+1 Divinium</p>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Main Content Area, moved lower for stability */}
        <div className="w-full bg-black/70 backdrop-blur-sm border-2 border-bloodRed/50 rounded-lg p-6 md:p-8 relative shadow-2xl mt-6">
          <div className="absolute -top-px -left-px -right-px h-4 bg-gradient-to-b from-bloodRed/30 to-transparent"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="text-perkBlue font-horror text-xl md:text-2xl">XP: <span className="text-white">{sessionXp.toLocaleString()}</span></div>
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-500 uppercase font-mono">Runde</div>
              <div className="text-4xl font-horror text-white leading-none">{round}</div>
            </div>
            <div className={`text-3xl font-bold ${isTimerFrozen ? 'text-gray-500' : timeLeft <= 3 ? 'text-bloodRed animate-ping' : 'text-perkBlue'}`}>{isTimerFrozen ? '∞' : `${timeLeft}s`}</div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4"><span className={`text-[10px] md:text-xs uppercase tracking-widest px-2 py-1 rounded text-white font-bold ${getProgressColor(currentQuestionData.difficulty)}`}>{currentQuestionData.difficulty}</span><span className="text-[10px] md:text-xs uppercase tracking-widest bg-perkBlue/10 border border-perkBlue/30 px-2 py-1 rounded text-perkBlue">{currentQuestionData.saga}</span></div>
          <h2 className="text-xl md:text-2xl font-bold mb-8 leading-tight min-h-[60px] text-center">{currentQuestionData.text}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestionData.shuffledOptions.map((opt: string, i: number) => (
              <button
                key={i}
                disabled={selectedOption !== null || i === eliminatedOption}
                onClick={() => handleAnswer(i)}
                className={`w-full py-4 px-6 text-left rounded border-2 transition-all duration-200 transform hover:scale-[1.02]
                  ${selectedOption === null
                    ? `bg-gray-900/50 border-gray-700 hover:border-perkBlue hover:bg-gray-800 ${i === eliminatedOption ? 'opacity-30 pointer-events-none line-through' : ''}`
                    : i === selectedOption
                      ? (i === currentQuestionData.shuffledCorrectIndex
                          ? 'border-green-500 bg-green-900/30'
                          : 'border-bloodRed bg-bloodRed/20')
                      : 'border-gray-800 opacity-50'}`}
              >
                <span className="font-horror mr-4 text-bloodRed">{i + 1}.</span> {opt}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center"><button onClick={() => setShowQuitConfirm(true)} className="text-gray-400 hover:text-white text-[10px] uppercase font-mono tracking-widest underline">Spiel Verlassen</button><button onClick={handleStartEvacuation} disabled={!isEvacPossible || evacuationProgress !== null} className="text-yellow-500 hover:text-white text-[10px] uppercase font-mono tracking-widest underline disabled:text-yellow-500/50 disabled:no-underline disabled:cursor-not-allowed">{getEvacButtonText()}</button></div>
          {evacuationProgress !== null && evacuationStatus === null && (<p className="text-center text-yellow-500 text-xs font-bold mt-4 animate-pulse">Evakuierung läuft: Noch {evacuationProgress} richtige Antworten benötigt.</p>)}
        </div>

        {/* Power-up Notification directly below question box */}
        <div className="relative h-24 w-full pointer-events-none flex justify-center items-start mt-2">
          {showPowerUpDrop && (
            <div className="z-40 text-center animate-powerup-drop w-full max-w-sm flex flex-col items-center justify-center">
                <p className="text-6xl">{showPowerUpDrop.icon}</p>
                <p className="font-horror text-4xl text-white" style={{textShadow: '2px 2px 8px #000'}}>{showPowerUpDrop.type}</p>
            </div>
          )}
        </div>
      </div>

      {/* Kaugummi-Hotbar */}
      <footer className="w-full bg-black/60 border-t-2 border-gray-700/50 p-2 z-20 mt-auto">
        {/* Mobile: Kaugummi-Hotbar rechts, Desktop: unten */}
        <div className="flex items-center justify-center gap-3 flex-wrap" style={{overflow: 'visible'}}>
          {/* Desktop: unten */}
          <div className="desktop-gumbar w-full items-center justify-center gap-3" style={{display: 'flex'}}>
            {inventory.gobblegumPack.map(gumId => {
              const gum = GOBBLEGUMS.find(g => g.id === gumId);
              if (!gum) return null;
              const isUsed = usedGums.has(gumId);
              return (
                <Tooltip
                  key={gumId}
                  content={
                    <div className="text-center w-40">
                      <p className="font-bold text-sm mb-1">{gum.name}</p>
                      <p className="text-gray-400 text-xs">{gum.description}</p>
                      {isUsed && <p className="text-bloodRed mt-2 font-bold uppercase text-xs">Benutzt</p>}
                    </div>
                  }
                >
                  <button onClick={() => handleActivateGum(gumId)} disabled={isUsed} className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${isUsed ? 'bg-gray-800 opacity-40 grayscale' : 'bg-grungeGray border-2 border-yellow-600 hover:bg-yellow-800'}`}>
                    {gum.icon}
                  </button>
                </Tooltip>
              )
            })}
            {inventory.gobblegumPack.length === 0 && <p className="text-xs text-gray-500 px-4 h-16 flex items-center">Kein Kaugummi-Paket ausgerüstet</p>}
          </div>
          {/* Mobile: sticky right side */}
          <div className="mobile-gumbar fixed top-1/2 right-0 z-40 flex flex-col gap-3 -translate-y-1/2 pr-2 pointer-events-auto" style={{display: 'none'}}>
            {inventory.gobblegumPack.map(gumId => {
              const gum = GOBBLEGUMS.find(g => g.id === gumId);
              if (!gum) return null;
              const isUsed = usedGums.has(gumId);
              return (
                <Tooltip
                  key={gumId}
                  content={
                    <div className="text-center w-40">
                      <p className="font-bold text-sm mb-1">{gum.name}</p>
                      <p className="text-gray-400 text-xs">{gum.description}</p>
                      {isUsed && <p className="text-bloodRed mt-2 font-bold uppercase text-xs">Benutzt</p>}
                    </div>
                  }
                >
                  <button onClick={() => handleActivateGum(gumId)} disabled={isUsed} className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-all duration-300 ${isUsed ? 'bg-gray-800 opacity-40 grayscale' : 'bg-grungeGray border-2 border-yellow-600 hover:bg-yellow-800'}`}>
                    {gum.icon}
                  </button>
                </Tooltip>
              )
            })}
            {inventory.gobblegumPack.length === 0 && <p className="text-xs text-gray-500 px-4 h-14 flex items-center">Kein Kaugummi-Paket ausgerüstet</p>}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QuizScreen;
