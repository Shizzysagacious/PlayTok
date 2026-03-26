import React, { useState, useEffect } from 'react';

export default function TicTacToe({ isActive }: { isActive: boolean }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');

  const checkWinner = (squares: any[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'Draw';
    return null;
  };

  useEffect(() => {
    if (!isActive) {
      setGameState('start');
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setWinner(null);
    }
  }, [isActive]);

  // AI Move
  useEffect(() => {
    if (gameState === 'playing' && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
        if (emptyIndices.length > 0) {
          const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          const newBoard = [...board];
          newBoard[randomIdx] = 'O';
          setBoard(newBoard);
          setIsXNext(true);
          const w = checkWinner(newBoard);
          if (w) {
            setWinner(w);
            setTimeout(() => setGameState('gameover'), 500);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameState, board, winner]);

  const handleClick = (index: number) => {
    if (gameState !== 'playing' || board[index] || winner || !isXNext) return;
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
    
    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      setTimeout(() => setGameState('gameover'), 500);
    }
  };

  const startGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameState('playing');
  };

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative">
      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center z-20" onClick={startGame}>
          <div className="bg-slate-800 p-8 rounded-3xl text-center max-w-sm mx-4 border border-slate-700">
            <h2 className="text-3xl font-bold text-white mb-4">Tic Tac Toe</h2>
            <p className="text-slate-400 mb-6">Play against the AI. You are X.</p>
            <button className="bg-white text-black px-8 py-3 rounded-full font-bold w-full">
              Play Now
            </button>
          </div>
        </div>
      )}

      {gameState !== 'start' && (
        <div className="z-10 w-full max-w-xs">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              {winner ? (winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`) : (isXNext ? 'Your Turn (X)' : 'AI Thinking...')}
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-2 bg-slate-700 p-2 rounded-2xl">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className="aspect-square bg-slate-800 rounded-xl flex items-center justify-center text-5xl font-bold text-white transition-colors hover:bg-slate-700 active:bg-slate-600"
              >
                <span className={cell === 'X' ? 'text-blue-400' : 'text-red-400'}>{cell}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20" onClick={startGame}>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">Game Over</h2>
            <p className="text-slate-400 text-xl mb-8">{winner === 'Draw' ? 'Draw' : `${winner} won the game`}</p>
            <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
