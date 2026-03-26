import React, { useState, useEffect, useRef } from 'react';

export default function Game2048({ isActive }: { isActive: boolean }) {
  const [board, setBoard] = useState<number[][]>(Array(4).fill(Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const touchStart = useRef<{ x: number, y: number } | null>(null);

  const initGame = () => {
    let newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameState('playing');
  };

  const addRandomTile = (currentBoard: number[][]) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const move = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameState !== 'playing') return;

    let newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const slideAndMerge = (row: number[]) => {
      let filtered = row.filter(val => val !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          newScore += filtered[i];
          filtered.splice(i + 1, 1);
        }
      }
      while (filtered.length < 4) filtered.push(0);
      return filtered;
    };

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        let row = newBoard[r];
        if (direction === 'RIGHT') row.reverse();
        const newRow = slideAndMerge(row);
        if (direction === 'RIGHT') newRow.reverse();
        if (newBoard[r].join(',') !== newRow.join(',')) moved = true;
        newBoard[r] = newRow;
      }
    } else {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        if (direction === 'DOWN') col.reverse();
        const newCol = slideAndMerge(col);
        if (direction === 'DOWN') newCol.reverse();
        for (let r = 0; r < 4; r++) {
          if (newBoard[r][c] !== newCol[r]) moved = true;
          newBoard[r][c] = newCol[r];
        }
      }
    }

    if (moved) {
      newBoard = addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      
      // Check game over
      let isOver = true;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (newBoard[r][c] === 0) isOver = false;
          if (c < 3 && newBoard[r][c] === newBoard[r][c + 1]) isOver = false;
          if (r < 3 && newBoard[r][c] === newBoard[r + 1][c]) isOver = false;
        }
      }
      if (isOver) setGameState('gameover');
    }
  };

  useEffect(() => {
    if (!isActive) setGameState('start');
  }, [isActive]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.current.x;
    const dy = touchEnd.y - touchStart.current.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) move(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      if (Math.abs(dy) > 30) move(dy > 0 ? 'DOWN' : 'UP');
    }
    touchStart.current = null;
  };

  const getColor = (val: number) => {
    const colors: Record<number, string> = {
      0: 'bg-amber-900/40',
      2: 'bg-amber-100 text-amber-900',
      4: 'bg-amber-200 text-amber-900',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-orange-500 text-white',
      64: 'bg-red-500 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-yellow-700 text-white',
      2048: 'bg-yellow-800 text-white',
    };
    return colors[val] || 'bg-zinc-800 text-white';
  };

  return (
    <div 
      className="w-full h-full bg-amber-950 flex flex-col items-center justify-center relative touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center z-20" onClick={initGame}>
          <div className="bg-amber-900/80 p-8 rounded-3xl text-center max-w-sm mx-4 border border-amber-700 backdrop-blur-md">
            <h2 className="text-4xl font-bold text-white mb-4">2048</h2>
            <p className="text-amber-200 mb-6">Swipe to combine matching numbers and reach 2048!</p>
            <button className="bg-white text-amber-900 px-8 py-3 rounded-full font-bold w-full text-lg">
              Start Game
            </button>
          </div>
        </div>
      )}

      {gameState !== 'start' && (
        <div className="z-10 w-full max-w-sm px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">2048</h1>
            <div className="bg-amber-900/80 px-4 py-2 rounded-xl text-center">
              <div className="text-amber-200 text-xs font-bold uppercase">Score</div>
              <div className="text-white font-bold text-xl">{score}</div>
            </div>
          </div>
          
          <div className="bg-amber-900/60 p-3 rounded-2xl grid grid-cols-4 gap-3 aspect-square">
            {board.map((row, r) => 
              row.map((cell, c) => (
                <div 
                  key={`${r}-${c}`}
                  className={`rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-150 ${getColor(cell)}`}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20" onClick={initGame}>
          <div className="text-center bg-amber-900 p-8 rounded-3xl border-2 border-amber-500">
            <h2 className="text-4xl font-bold text-white mb-2">Game Over</h2>
            <p className="text-amber-200 text-xl mb-8">Final Score: {score}</p>
            <button className="bg-white text-amber-900 px-8 py-3 rounded-full font-bold text-lg">
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
