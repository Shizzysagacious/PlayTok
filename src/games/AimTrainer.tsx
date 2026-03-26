import React, { useState, useEffect, useRef } from 'react';

export default function AimTrainer({ isActive }: { isActive: boolean }) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [target, setTarget] = useState({ x: 50, y: 50 }); // percentages
  const timerRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setGameState('start');
    setScore(0);
    setTimeLeft(15);
    moveTarget();
  };

  useEffect(() => {
    if (!isActive) {
      resetGame();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isActive]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setGameState('gameover');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const moveTarget = () => {
    // Keep within 10% to 90% to avoid edges
    const x = Math.floor(Math.random() * 80) + 10;
    // Keep upper y bounded to avoid TikTok UI overlay at bottom (max 60%)
    const y = Math.floor(Math.random() * 50) + 15;
    setTarget({ x, y });
  };

  const handleStart = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(15);
    moveTarget();
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gameState === 'playing') {
      setScore(s => s + 1);
      moveTarget();
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 relative" onClick={gameState !== 'playing' ? handleStart : undefined}>
      {/* Header */}
      <div className="absolute top-12 left-0 w-full px-8 flex justify-between items-center pointer-events-none">
        <div className="bg-black/40 px-4 py-2 rounded-xl text-white font-mono text-xl">
          Time: {timeLeft}s
        </div>
        <div className="bg-black/40 px-4 py-2 rounded-xl text-white font-mono text-xl">
          Score: {score}
        </div>
      </div>

      {gameState === 'playing' && (
        <div 
          onClick={handleTargetClick}
          className="absolute w-16 h-16 bg-red-500 rounded-full border-4 border-white shadow-[0_0_15px_rgba(239,68,68,0.6)] cursor-crosshair transform -translate-x-1/2 -translate-y-1/2 active:scale-90 transition-transform"
          style={{ left: `${target.x}%`, top: `${target.y}%` }}
        >
          <div className="absolute inset-2 bg-white rounded-full pointer-events-none"></div>
          <div className="absolute inset-4 bg-red-500 rounded-full pointer-events-none"></div>
        </div>
      )}

      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 text-white px-8 py-6 rounded-3xl text-center backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl font-bold mb-2 text-red-400">Aim Trainer</h2>
            <p className="text-gray-300 mb-6">Hit as many targets as you can in 15s!</p>
            <div className="bg-red-500 text-white px-8 py-3 rounded-full font-bold inline-block">
              Tap anywhere to Start
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 text-white p-8 rounded-3xl text-center backdrop-blur-md border border-white/20">
            <h2 className="text-3xl font-bold mb-2">Time's Up!</h2>
            <p className="text-2xl mb-6 text-red-400">Final Score: {score}</p>
            <div className="bg-white text-black px-8 py-3 rounded-full font-bold inline-block">
              Tap to Play Again
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
