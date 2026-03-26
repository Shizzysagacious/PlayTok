import React, { useEffect, useRef, useState } from 'react';

export default function FlappyCube({ isActive }: { isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);

  // Physics and game loop refs
  const reqRef = useRef<number>();
  const bird = useRef({ y: 300, velocity: 0, size: 30, x: 100 });
  const pipes = useRef<{x: number, topHeight: number, passed: boolean}[]>([]);
  const frameCount = useRef(0);

  const resetGame = () => {
    bird.current = { y: window.innerHeight / 2, velocity: 0, size: 30, x: window.innerWidth / 3 };
    pipes.current = [];
    frameCount.current = 0;
    setScore(0);
    setGameState('start');
  };

  useEffect(() => {
    if (!isActive) {
      resetGame();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const gravity = 0.6;
    const pipeWidth = 60;
    const pipeGap = 200;
    const speed = 4;

    const loop = () => {
      if (gameState !== 'playing') {
         // Draw start/gameover screen
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         
         // Draw bird
         ctx.fillStyle = '#facc15'; // yellow-400
         ctx.fillRect(bird.current.x, bird.current.y, bird.current.size, bird.current.size);
         
         reqRef.current = requestAnimationFrame(loop);
         return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update bird
      bird.current.velocity += gravity;
      bird.current.y += bird.current.velocity;

      // Draw bird
      ctx.fillStyle = '#facc15';
      ctx.fillRect(bird.current.x, bird.current.y, bird.current.size, bird.current.size);

      // Spawn pipes
      frameCount.current++;
      if (frameCount.current % 100 === 0) {
        const minHeight = 50;
        const maxHeight = canvas.height - pipeGap - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        pipes.current.push({ x: canvas.width, topHeight, passed: false });
      }

      // Update and draw pipes
      ctx.fillStyle = '#4ade80'; // green-400
      for (let i = pipes.current.length - 1; i >= 0; i--) {
        const p = pipes.current[i];
        p.x -= speed;

        // Draw top pipe
        ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
        // Draw bottom pipe
        ctx.fillRect(p.x, p.topHeight + pipeGap, pipeWidth, canvas.height - p.topHeight - pipeGap);

        // Collision detection
        const birdRect = { left: bird.current.x, right: bird.current.x + bird.current.size, top: bird.current.y, bottom: bird.current.y + bird.current.size };
        const topPipeRect = { left: p.x, right: p.x + pipeWidth, top: 0, bottom: p.topHeight };
        const bottomPipeRect = { left: p.x, right: p.x + pipeWidth, top: p.topHeight + pipeGap, bottom: canvas.height };

        if (
          birdRect.right > topPipeRect.left && birdRect.left < topPipeRect.right &&
          (birdRect.top < topPipeRect.bottom || birdRect.bottom > bottomPipeRect.top)
        ) {
          setGameState('gameover');
        }

        // Score
        if (p.x + pipeWidth < bird.current.x && !p.passed) {
          p.passed = true;
          setScore(s => s + 1);
        }

        // Remove offscreen pipes
        if (p.x + pipeWidth < 0) {
          pipes.current.splice(i, 1);
        }
      }

      // Floor/Ceiling collision
      if (bird.current.y > canvas.height || bird.current.y < 0) {
        setGameState('gameover');
      }

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isActive, gameState]);

  const handleTap = () => {
    if (!isActive) return;
    if (gameState === 'start') {
      setGameState('playing');
      bird.current.velocity = -10;
    } else if (gameState === 'playing') {
      bird.current.velocity = -10;
    } else if (gameState === 'gameover') {
      resetGame();
    }
  };

  return (
    <div className="w-full h-full relative bg-sky-900" onClick={handleTap}>
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      <div className="absolute top-20 left-0 w-full text-center pointer-events-none">
        <h2 className="text-6xl font-bold text-white drop-shadow-lg">{score}</h2>
      </div>

      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 text-white px-6 py-3 rounded-full font-bold text-xl animate-pulse">
            Tap to Fly
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 text-white p-8 rounded-2xl text-center border-2 border-white/20">
            <h2 className="text-3xl font-bold mb-2">Game Over</h2>
            <p className="text-xl mb-4">Score: {score}</p>
            <div className="bg-white text-black px-6 py-2 rounded-full font-bold">
              Tap to Restart
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
