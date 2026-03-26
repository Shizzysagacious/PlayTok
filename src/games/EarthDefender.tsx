import React, { useState, useEffect, useRef } from 'react';

export default function EarthDefender({ isActive }: { isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);

  const reqRef = useRef<number>();
  const player = useRef({ angle: 0, radius: 40 });
  const bullets = useRef<{x: number, y: number, angle: number, speed: number}[]>([]);
  const enemies = useRef<{x: number, y: number, speed: number, size: number, angle: number}[]>([]);
  const frameCount = useRef(0);

  const resetGame = () => {
    bullets.current = [];
    enemies.current = [];
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

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const loop = () => {
      if (gameState !== 'playing') {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         // Draw Earth
         ctx.beginPath();
         ctx.arc(cx, cy, player.current.radius, 0, Math.PI * 2);
         ctx.fillStyle = '#3b82f6';
         ctx.fill();
         ctx.closePath();
         reqRef.current = requestAnimationFrame(loop);
         return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Earth
      ctx.beginPath();
      ctx.arc(cx, cy, player.current.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.closePath();

      // Draw Player Turret
      const turretX = cx + Math.cos(player.current.angle) * (player.current.radius + 15);
      const turretY = cy + Math.sin(player.current.angle) * (player.current.radius + 15);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(turretX, turretY);
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.closePath();

      // Update and Draw Bullets
      ctx.fillStyle = '#fef08a';
      for (let i = bullets.current.length - 1; i >= 0; i--) {
        const b = bullets.current[i];
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;
        
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
          bullets.current.splice(i, 1);
        }
      }

      // Spawn Enemies
      frameCount.current++;
      if (frameCount.current % Math.max(20, 60 - Math.floor(score / 5)) === 0) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(canvas.width, canvas.height);
        enemies.current.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          speed: 2 + Math.random() * 2 + (score / 20),
          size: 15 + Math.random() * 15,
          angle: angle + Math.PI // Point towards center
        });
      }

      // Update and Draw Enemies
      ctx.fillStyle = '#9ca3af';
      for (let i = enemies.current.length - 1; i >= 0; i--) {
        const e = enemies.current[i];
        e.x += Math.cos(e.angle) * e.speed;
        e.y += Math.sin(e.angle) * e.speed;

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Collision with Earth
        const distToEarth = Math.hypot(e.x - cx, e.y - cy);
        if (distToEarth < player.current.radius + e.size) {
          setGameState('gameover');
        }

        // Collision with bullets
        for (let j = bullets.current.length - 1; j >= 0; j--) {
          const b = bullets.current[j];
          const dist = Math.hypot(e.x - b.x, e.y - b.y);
          if (dist < e.size + 4) {
            enemies.current.splice(i, 1);
            bullets.current.splice(j, 1);
            setScore(s => s + 10);
            break;
          }
        }
      }

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isActive, gameState, score]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    player.current.angle = Math.atan2(y, x);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState === 'start') {
      setGameState('playing');
      return;
    }
    if (gameState === 'gameover') {
      resetGame();
      return;
    }
    if (gameState === 'playing') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      bullets.current.push({
        x: cx + Math.cos(player.current.angle) * (player.current.radius + 20),
        y: cy + Math.sin(player.current.angle) * (player.current.radius + 20),
        angle: player.current.angle,
        speed: 10
      });
    }
  };

  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden touch-none">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
      />
      
      <div className="absolute top-16 left-0 w-full text-center pointer-events-none z-10">
        <h2 className="text-4xl font-mono font-bold text-white drop-shadow-lg">Score: {score}</h2>
      </div>

      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-black/60 text-white px-8 py-6 rounded-3xl text-center backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl font-bold mb-2 text-blue-400">Earth Defender</h2>
            <p className="text-gray-300 mb-6">Drag to aim, tap to shoot asteroids!</p>
            <div className="bg-blue-500 text-white px-8 py-3 rounded-full font-bold inline-block animate-pulse">
              Tap anywhere to Start
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-black/80 text-white p-8 rounded-3xl text-center backdrop-blur-md border border-white/20">
            <h2 className="text-3xl font-bold mb-2 text-red-500">Earth Destroyed</h2>
            <p className="text-2xl mb-6 text-gray-300">Final Score: {score}</p>
            <div className="bg-white text-black px-8 py-3 rounded-full font-bold inline-block">
              Tap to Restart
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
