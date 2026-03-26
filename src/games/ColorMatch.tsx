import React, { useState, useEffect } from 'react';

const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' }
];

export default function ColorMatch({ isActive }: { isActive: boolean }) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  
  const [wordColor, setWordColor] = useState(COLORS[0]);
  const [textColor, setTextColor] = useState(COLORS[1]);
  const [options, setOptions] = useState<typeof COLORS>([]);

  const generateRound = () => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    let text = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // 50% chance the text color matches the word to make it tricky
    if (Math.random() > 0.5) {
      text = word;
    }

    setWordColor(word);
    setTextColor(text);

    // Generate 4 options including the correct answer (which is the TEXT color's name)
    const correctAns = text;
    const opts = [correctAns];
    while(opts.length < 4) {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (!opts.find(o => o.name === randomColor.name)) {
        opts.push(randomColor);
      }
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(15);
    generateRound();
  };

  useEffect(() => {
    if (!isActive) {
      setGameState('start');
    }
  }, [isActive]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('gameover');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const handleGuess = (colorName: string) => {
    if (gameState !== 'playing') return;
    
    if (colorName === textColor.name) {
      setScore(s => s + 1);
      generateRound();
    } else {
      setTimeLeft(t => Math.max(0, t - 2));
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center relative">
      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center z-20" onClick={startGame}>
          <div className="bg-zinc-800 p-8 rounded-3xl text-center max-w-sm mx-4 border border-zinc-700">
            <h2 className="text-3xl font-bold text-white mb-4">Brain Teaser</h2>
            <p className="text-zinc-400 mb-6">Select the color of the <strong className="text-white">INK</strong>, not the word!</p>
            <button className="bg-white text-black px-8 py-3 rounded-full font-bold w-full">
              Start
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-md px-6 flex flex-col items-center z-10">
          <div className="flex justify-between w-full mb-12 text-zinc-400 font-mono text-xl">
            <span>Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-white'}>{timeLeft}</span></span>
            <span>Score: <span className="text-white">{score}</span></span>
          </div>

          <div className="h-40 flex items-center justify-center mb-12">
            <h1 
              className="text-7xl font-black tracking-tighter uppercase"
              style={{ color: textColor.hex }}
            >
              {wordColor.name}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleGuess(opt.name)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-6 rounded-2xl text-xl font-bold transition-colors border border-zinc-700 active:scale-95"
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20" onClick={startGame}>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">Game Over</h2>
            <p className="text-zinc-400 text-xl mb-8">You scored {score} points</p>
            <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg">
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
