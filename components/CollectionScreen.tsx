
import React, { useState, useEffect } from 'react';
import { UserInventory, Rarity, ItemType, CollectibleItem, KaugummiRarity } from '../types';
import { COLLECTION_ITEMS } from '../data/collectionItems';
import { GOBBLEGUMS } from '../data/gobblegums';
import ItemMedia from './ItemMedia';
import Tooltip from './Tooltip';

interface CollectionScreenProps {
  inventory: UserInventory;
  onClose: () => void;
  onSetPack: (pack: string[]) => void;
  // devMode entfernt
}

const CollectionScreen: React.FC<CollectionScreenProps> = ({ 
  inventory, 
  onClose,
  onSetPack,
  // devMode entfernt
}) => {
  const [currentPack, setCurrentPack] = useState(inventory.gobblegumPack);
  const [activeTab, setActiveTab] = useState<'cards' | 'gums'>('cards');
  const [selectedCard, setSelectedCard] = useState<CollectibleItem | null>(null);

  useEffect(() => {
    onSetPack(currentPack);
  }, [currentPack, onSetPack]);

  const handlePackSelect = (gumId: string) => {
    const isEquipped = currentPack.includes(gumId);
    if (isEquipped) {
      setCurrentPack(currentPack.filter(id => id !== gumId));
    } else if (currentPack.length < 3) {
      setCurrentPack([...currentPack, gumId]);
    }
  };

  const cards = COLLECTION_ITEMS.filter(item => item.type === ItemType.CARD);
  const normalCards = cards.filter(c => !c.isSecret);
  const secretCards = cards.filter(c => c.isSecret);

  const rarityStyles = {
    [Rarity.COMMON]: { border: 'border-gray-600', shadow: '' },
    [Rarity.RARE]: { border: 'border-perkBlue/70', shadow: 'shadow-[0_0_15px_rgba(0,255,255,0.4)]' },
    [Rarity.DARK_OPS]: { border: 'border-purple-500/80', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]' },
    [Rarity.EVENT]: { border: 'border-orange-500/80', shadow: 'shadow-[0_0_20px_rgba(255,170,0,0.6)] animate-pulse' }
  };
  
  const gumRarityColor: Record<KaugummiRarity, string> = {
    [KaugummiRarity.SELTEN]: 'border-gray-500 text-gray-300',
    [KaugummiRarity.EPISCH]: 'border-purple-500 text-purple-400',
    [KaugummiRarity.LEGENDÄR]: 'border-yellow-500 text-yellow-400',
    [KaugummiRarity.ULTRA]: 'border-red-600 text-red-500',
  };

  const renderCard = (item: CollectibleItem) => {
    const isUnlocked = (inventory.items[item.id] || 0) > 0;
    if (item.isSecret && !isUnlocked) {
      return (
        <div key={item.id} className="aspect-[10/7] rounded-md overflow-hidden border-2 border-gray-900 bg-black flex items-center justify-center p-4">
          <div className="text-center"><p className="text-gray-700 text-2xl font-horror tracking-tighter uppercase italic opacity-50">Geheim</p><div className="w-12 h-0.5 bg-gray-800 mx-auto mt-1"></div></div>
        </div>
      );
    }
    return (
      <Tooltip
        key={item.id}
        content={
          <div className="text-left w-56">
            <h4 className="font-bold uppercase text-base tracking-widest text-white">{item.name}</h4>
            <p className="text-xs text-gray-400 mt-1">{item.description}</p>
            {item.xpReward && (isUnlocked || !item.isSecret) && (<p className="text-sm font-mono text-perkBlue mt-2 pt-2 border-t border-gray-700">+{item.xpReward.toLocaleString()} XP</p>)}
          </div>
        }
      >
        <button onClick={() => isUnlocked && setSelectedCard(item)} style={{ backgroundColor: item.color }} className={`aspect-[10/7] rounded-md overflow-hidden border-2 transition-all duration-300 group relative w-full ${isUnlocked ? `${rarityStyles[item.rarity].border} ${rarityStyles[item.rarity].shadow} hover:scale-105 cursor-pointer` : 'border-gray-900 opacity-30 grayscale'}`}>
          <ItemMedia source={item.imageUrl} className="w-full h-full" alt={item.name} fit={item.imageFit} />
          {isUnlocked && <div className={`absolute inset-0 ring-2 ring-inset ${rarityStyles[item.rarity].border} opacity-50`}></div>}
        </button>
      </Tooltip>
    );
  };
  
  const renderGums = () => (
    <div className="space-y-8">
      <div>
        <h4 className="text-center font-bold text-gray-400 uppercase text-xs mb-4">Aktives Kaugummi-Paket</h4>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto p-4 bg-black/30 border border-gray-800 rounded-lg">
          {Array.from({ length: 3 }).map((_, i) => {
            const gumId = currentPack[i];
            const gum = gumId ? GOBBLEGUMS.find(g => g.id === gumId) : null;
            return (
              <div key={i} onClick={() => gumId && handlePackSelect(gumId)} className={`aspect-square rounded-full flex items-center justify-center text-5xl cursor-pointer transition-all ${gum ? `bg-grungeGray border-4 ${gumRarityColor[gum.rarity]}` : 'bg-gray-900 border-4 border-dashed border-gray-700'}`}>
                {gum ? gum.icon : <span className="text-gray-600 text-3xl">+</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h4 className="text-center font-bold text-gray-400 uppercase text-xs mb-4">Inventar</h4>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {GOBBLEGUMS.map(gum => {
            const count = inventory.gobblegums[gum.id] || 0;
            const isInPack = currentPack.includes(gum.id);
            const canSelect = count > 0 && !isInPack;
            return (
              <Tooltip
                key={gum.id}
                content={
                  <div className="text-left space-y-1 w-48"><div className="flex items-baseline gap-2"><span className="text-lg">{gum.icon}</span><p className="font-bold text-sm text-white">{gum.name}</p></div><p className={`text-xs font-bold uppercase ${gumRarityColor[gum.rarity]}`}>{gum.rarity}</p><p className="text-gray-300 text-xs pt-1 border-t border-gray-700/50 mt-1">{gum.description}</p></div>
                }
              >
                <div onClick={() => canSelect && handlePackSelect(gum.id)} className={`p-3 rounded border h-full transition-all relative overflow-hidden ${isInPack ? 'bg-perkBlue/20 border-perkBlue' : canSelect ? 'bg-gray-800/50 border-gray-700 hover:border-perkBlue hover:bg-perkBlue/10 cursor-pointer' : 'border-gray-800/50 bg-black/20 opacity-40'}`}>
                  <div className="flex justify-between items-start"><span className="text-3xl">{gum.icon}</span><span className="font-mono text-xl font-bold">x{count}</span></div>
                  <p className="text-sm font-bold uppercase mt-2 truncate">{gum.name}</p>
                  <p className={`text-[10px] uppercase font-bold ${gumRarityColor[gum.rarity]}`}>{gum.rarity}</p>
                  {isInPack && <div className="absolute inset-0 bg-perkBlue/30 backdrop-blur-sm flex items-center justify-center font-bold text-perkBlue uppercase text-sm">Ausgerüstet</div>}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-darkSlate p-4 md:p-6 flex flex-col font-sans overflow-y-auto pb-32">
       <header className="border-b-2 border-bloodRed/50 pb-4 mb-6 sticky top-0 bg-darkSlate/80 backdrop-blur-sm z-30 -mx-4 -mt-4 px-4 pt-4">
        <h2 className="font-horror text-5xl text-bloodRed tracking-tighter uppercase italic">Kaserne</h2>
      </header>
      
      <div className="mb-8 flex justify-center border-b border-gray-800">
        <button onClick={() => setActiveTab('cards')} className={`px-6 py-2 font-bold uppercase tracking-widest transition-colors ${activeTab === 'cards' ? 'text-white border-b-2 border-bloodRed bg-bloodRed/10' : 'text-gray-500 hover:text-white'}`}>Calling Cards</button>
        <button onClick={() => setActiveTab('gums')} className={`px-6 py-2 font-bold uppercase tracking-widest transition-colors ${activeTab === 'gums' ? 'text-white border-b-2 border-bloodRed bg-bloodRed/10' : 'text-gray-500 hover:text-white'}`}>Kaugummi-Paket</button>
      </div>

      <main className="flex-1">
        {activeTab === 'cards' ? (
          <div className="space-y-12">
            <section><h3 className="text-gray-400 text-sm font-bold uppercase mb-4 flex items-center gap-2"><span className="w-1 h-4 bg-bloodRed"></span> Standard-Herausforderungen</h3><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{normalCards.map(renderCard)}</div></section>
            <section><h3 className="text-purple-400 text-sm font-bold uppercase mb-4 flex items-center gap-2"><span className="w-1 h-4 bg-purple-600"></span> Dark Ops-Herausforderungen</h3><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{secretCards.map(renderCard)}</div></section>
            
          </div>
        ) : (
          renderGums()
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-darkSlate via-darkSlate/80 to-transparent pointer-events-none z-30"><button onClick={onClose} className="pointer-events-auto mx-auto block px-12 py-3 text-2xl font-horror text-white uppercase tracking-widest transform skew-x-[-15deg] bg-bloodRed hover:bg-red-700 hover:shadow-[0_0_20px_#8B0000] transition-all"><span className="inline-block transform skew-x-[15deg]">Zurück</span></button></footer>

      {selectedCard && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-2 z-50 animate-fade-in" onClick={() => setSelectedCard(null)}>
          <div className="w-full max-w-lg flex flex-col items-center" onClick={e => e.stopPropagation()} style={{maxHeight: '98vh'}}>
            <div className="w-full aspect-[10/7] rounded-lg overflow-hidden border-2 mb-4" style={{ borderColor: selectedCard.rarity === Rarity.DARK_OPS ? '#a855f7' : selectedCard.rarity === Rarity.RARE ? '#00ffff' : '#666', maxHeight: '38vh' }}>
              <ItemMedia source={selectedCard.imageUrl} className="w-full h-full" alt={selectedCard.name} fit={selectedCard.imageFit} />
            </div>
            <h2 className="font-horror text-3xl md:text-4xl text-bloodRed tracking-tighter uppercase italic mb-2 text-center" style={{fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'}}>{selectedCard.name}</h2>
            {selectedCard.quote && (
              <p className="text-center text-base md:text-xl text-gray-300 italic mb-2 max-w-md">{selectedCard.quote}</p>
            )}
            <p className="text-center text-gray-400 text-xs md:text-sm mb-2">{selectedCard.description}</p>
            {selectedCard.xpReward && (
              <p className="font-mono text-perkBlue font-bold mb-2">+{selectedCard.xpReward.toLocaleString()} XP</p>
            )}
            <button 
              onClick={() => setSelectedCard(null)}
              className="mt-2 px-6 py-2 font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 rounded transition-colors"
              style={{fontSize: 'clamp(1rem, 2vw, 1.2rem)'}}
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionScreen;
