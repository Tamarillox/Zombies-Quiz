
import React, { useState } from 'react';
import { UserInventory, KaugummiRarity } from '../types';
import { GOBBLEGUMS } from '../data/gobblegums';

interface FactoryScreenProps {
  inventory: UserInventory;
  onClose: () => void;
  onSpendDivinium: () => string;
}

const FactoryScreen: React.FC<FactoryScreenProps> = ({
  inventory,
  onClose,
  onSpendDivinium,
}) => {
  const [lastResultId, setLastResultId] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    if (inventory.divinium < 1 || isSpinning) return;
    setIsSpinning(true);
    setLastResultId(null);

    setTimeout(() => {
      const resultId = onSpendDivinium();
      setLastResultId(resultId);
      setIsSpinning(false);
    }, 1500); // Dauer der Animation
  };

  const lastGum = lastResultId ? GOBBLEGUMS.find(g => g.id === lastResultId) : null;
  
  const gumRarityClasses: Record<KaugummiRarity, string> = {
    [KaugummiRarity.SELTEN]: 'text-gray-300 border-gray-500 shadow-gray-500/30',
    [KaugummiRarity.EPISCH]: 'text-purple-400 border-purple-500 shadow-purple-500/40',
    [KaugummiRarity.LEGENDÄR]: 'text-yellow-400 border-yellow-500 shadow-yellow-500/50',
    [KaugummiRarity.ULTRA]: 'text-red-500 border-red-600 shadow-red-500/60',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-grungeGray" style={{
      background: 'url(https://www.transparenttextures.com/patterns/subtle-carbon.png), #2A2A2A',
      color: '#e5e5e5',
      position: 'relative',
      transition: 'background 0.5s',
    }}>
      <div className="divinium-indicator" style={{
        position: 'fixed',
        top: 18,
        right: 18,
        zIndex: 2147483647,
        background: 'rgba(40,40,30,0.98)',
        border: '3px solid #ffe066',
        borderRadius: 16,
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{
          fontSize: 32,
          marginRight: 4,
        }}>🧪</span>
        <span style={{
          fontFamily: 'monospace',
          fontSize: 32,
          fontWeight: 900,
          color: '#ffe066',
          textShadow: '1px 1px 4px #222, 0 0 1px #000',
          letterSpacing: 1,
        }}> {inventory.divinium}</span>
      </div>

      <div className="relative mb-12">
        <h2 className="font-horror text-7xl md:text-9xl text-bloodRed blood-shadow animate-title-glow">Dr. Montys Fabrik</h2>
      </div>
      <div className="max-w-xs w-full space-y-4 mx-auto" style={{paddingBottom: '80px'}}>
        <div className="w-full bg-black/70 backdrop-blur-sm border-2 border-bloodRed rounded-lg flex items-center justify-center mb-8 relative overflow-hidden shadow-2xl p-8 min-h-[14rem]">
          {isSpinning && (
            <div className="text-5xl animate-spin">🌀</div>
          )}
          {lastGum && (
            <div className={`text-center p-4 rounded-lg border-2 bg-black/70 animate-powerup-drop ${gumRarityClasses[lastGum.rarity]}`} style={{boxShadow: '0 0 25px var(--tw-shadow-color)'}}>
              <p className="text-6xl">{lastGum.icon}</p>
              <p className="font-bold uppercase mt-2 text-gray-100">{lastGum.name}</p>
              <p className={`text-sm font-bold uppercase text-gray-300`}>{lastGum.rarity}</p>
            </div>
          )}
          {!isSpinning && !lastGum && (
            <p className="text-gray-400">Bereit zum Mischen...</p>
          )}
        </div>
        <button
          onClick={handleSpin}
          disabled={inventory.divinium < 1 || isSpinning}
          className="w-full py-3 text-lg font-bold text-white uppercase tracking-widest transform skew-x-[-15deg] bg-bloodRed/80 border-2 border-bloodRed hover:bg-bloodRed hover:shadow-[0_0_20px_#8B0000] transition-all disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span className="inline-block transform skew-x-[15deg]">{isSpinning ? 'Mischen...' : '1 Divinium verbrauchen'}</span>
        </button>
      </div>
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-grungeGray via-black/80 to-transparent z-50" style={{pointerEvents: 'auto'}}>
        <button
          onClick={onClose}
          className="mx-auto block px-12 py-3 text-2xl font-horror text-white uppercase tracking-widest transform skew-x-[-15deg] bg-bloodRed hover:bg-red-700 hover:shadow-[0_0_20px_#8B0000] transition-all"
          style={{marginBottom: 0, marginTop: 0, position: 'relative', zIndex: 100}}
        >
          <span className="inline-block transform skew-x-[15deg]">Zurück</span>
        </button>
      </div>
    </div>
  );
};

export default FactoryScreen;
