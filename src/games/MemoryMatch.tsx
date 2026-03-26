import React, { useState, useEffect } from 'react';

const EMOJIS = ['🚀', '👾', '🍕', '🎸', '💎', '🔥'];

export default function MemoryMatch({ isActive }: { isActive: boolean }) {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [moves, setMoves] = useState(0);

  const initGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameState('playing');
  };

  useEffect(() => {
    if (!isActive) {
      setGameState('start');
    }
  }, [isActive]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first] === cards[second]) {
        setMatched(m => [...m, first, second]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setTimeout(() => setGameState('gameover'), 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }, [flipped, cards, matched.length]);

  const handleCardClick = (index: number) => {
    if (gameState !== 'playing') return;
    if (flipped.length >= 2) return;
    if (flipped.includes(index) || matched.includes(index)) return;

    setFlipped(f => [...f, index]);
    if (flipped.length === 0) {
      setMoves(m => m + 1);
    }
  };

  return (
    <div className="w-full h-full bg-indigo-950 flex flex-col items-center justify-center relative">
      
      {gameState === 'playing' && (
        <div className="absolute top-16 text-white text-xl font-bold bg-black/30 px-6 py-2 rounded-full">
          Moves: {moves}
        </div>
      )}

      {gameState === 'start' ? (
        <div className="text-center z-10" onClick={initGame}>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 cursor-pointer hover:bg-white/20 transition">
            <h2 className="text-4xl font-bold text-white mb-4">Memory Match</h2>
            <p className="text-indigo-200 mb-6">Find all the matching pairs</p>
            <button className="bg-indigo-500 text-white px-8 py-3 rounded-full font-bold text-lg w-full">
              Play Now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 p-6 w-full max-w-md mt-10 z-10">
          {cards.map((emoji, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index);
            return (
              <div 
                key={index}
                onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-4xl cursor-pointer transition-all duration-300 transform perspective-1000 ${isFlipped ? 'bg-white rotate-y-180' : 'bg-indigo-800 hover:bg-indigo-700'}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className={`transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                  {emoji}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20" onClick={initGame}>
          <div className="text-center bg-indigo-900 p-8 rounded-3xl border-2 border-indigo-400">
            <h2 className="text-4xl font-bold text-white mb-2">You Won!</h2>
            <p className="text-indigo-200 text-xl mb-6">Total Moves: {moves}</p>
            <button className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold text-lg">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
