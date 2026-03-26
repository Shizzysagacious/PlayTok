import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import GameContainer from '../components/GameContainer';
import FlappyCube from '../games/FlappyCube';
import AimTrainer from '../games/AimTrainer';
import MemoryMatch from '../games/MemoryMatch';
import ColorMatch from '../games/ColorMatch';
import TicTacToe from '../games/TicTacToe';
import Game2048 from '../games/Game2048';
import EarthDefender from '../games/EarthDefender';
import { increment } from 'firebase/firestore';

const BUILT_IN_GAMES = [
  {
    id: 'built-in-1',
    authorName: 'flappy_king',
    authorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=flappy_king',
    description: 'Can you beat my high score of 50? 🦅 #gaming #flappy',
    title: 'Flappy Cube',
    likesCount: 1200,
    commentsCount: 342,
    sharesCount: 89,
    Game: FlappyCube
  },
  {
    id: 'built-in-2',
    authorName: 'aim_god',
    authorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aim_god',
    description: 'POV: You have 1000 hours in FPS games 🎯',
    title: 'Aim Trainer',
    likesCount: 4500,
    commentsCount: 1100,
    sharesCount: 402,
    Game: AimTrainer
  },
  {
    id: 'built-in-3',
    authorName: 'brain_games',
    authorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=brain_games',
    description: 'Only 1% of people can solve this under 10 moves 🧠',
    title: 'Memory Match',
    likesCount: 890,
    commentsCount: 124,
    sharesCount: 12,
    Game: MemoryMatch
  },
  {
    id: 'built-in-4',
    authorName: 'color_blind',
    authorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=color_blind',
    description: 'This game will literally break your brain 🤯 #puzzle',
    title: 'Color Match',
    likesCount: 2100,
    commentsCount: 567,
    sharesCount: 210,
    Game: ColorMatch
  },
  {
    id: 'built-in-5',
    authorName: 'classic_gamer',
    authorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=classic_gamer',
    description: 'The ultimate classic. Can you beat the AI? ❌⭕',
    title: 'Tic Tac Toe',
    likesCount: 3200,
    commentsCount: 450,
    sharesCount: 120,
    Game: TicTacToe
  },
  {
    id: 'built-in-6',
    authorName: 'math_genius',
    authorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math_genius',
    description: 'Swipe to combine. Get to 2048! 🔢',
    title: '2048',
    likesCount: 5600,
    commentsCount: 890,
    sharesCount: 340,
    Game: Game2048
  },
  {
    id: 'built-in-7',
    authorName: 'space_ranger',
    authorPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=space_ranger',
    description: 'Defend Earth from the asteroid shower! 🌍☄️',
    title: 'Earth Defender',
    likesCount: 4100,
    commentsCount: 670,
    sharesCount: 280,
    Game: EarthDefender
  }
];

// We need a dynamic component renderer for AI games
const DynamicGame = ({ code, isActive }: { code: string, isActive: boolean }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    let cleanCode = code.replace(/```tsx?/g, '').replace(/```/g, '').trim();

    let processedCode = cleanCode
      .replace(/export\s+default\s+function\s+(\w+)/, 'window.App = function $1')
      .replace(/export\s+default\s+/, 'window.App = ');
    
    const safeCode = processedCode.replace(/<\/script>/g, '<\\/script>');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react@18.2.0",
              "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
              "lucide-react": "https://esm.sh/lucide-react@0.263.1"
            }
          }
        </script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          body { margin: 0; padding: 0; overflow: hidden; background-color: #000; color: #fff; }
          #root { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel" data-type="module">
          import * as __ReactDomClient from 'react-dom/client';
          import React from 'react';
          window.React = React;
          
          window.addEventListener('error', (event) => {
            document.getElementById('root').innerHTML = '<div style="color:red;padding:20px;font-family:monospace;word-wrap:break-word;overflow-y:auto;max-height:100vh;">Error rendering game:<br/>' + (event.error ? event.error.message : event.message) + '</div>';
          });

          ` + safeCode + `
          
          if (typeof window.App !== 'undefined') {
            const App = window.App;
            __ReactDomClient.createRoot(document.getElementById('root')).render(<App isActive={` + isActive + `} />);
          } else {
            document.getElementById('root').innerHTML = '<div style="color:red;padding:20px;font-family:monospace;word-wrap:break-word;">Error: Component default export not found in generated code.</div>';
          }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [code, isActive]);

  return (
    <div className="w-full h-full bg-black relative">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-none absolute inset-0"
        sandbox="allow-scripts allow-same-origin"
        title="AI Game"
      />
    </div>
  );
};

export default function Home() {
  const [feed, setFeed] = useState<any[]>(BUILT_IN_GAMES);

  useEffect(() => {
    const q = query(collection(db, 'games'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbGames = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        Game: (props: any) => <DynamicGame code={doc.data().code} {...props} />
      }));
      setFeed([...BUILT_IN_GAMES, ...dbGames]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'games');
    });
    return () => unsubscribe();
  }, []);

  const handleLike = async (gameId: string, currentLikes: number, isLiked: boolean) => {
    if (!auth.currentUser) {
      alert("Please sign in to like games!");
      return;
    }
    
    // Built-in games don't have real DB records in this prototype, so we skip DB update for them
    if (gameId.startsWith('built-in')) return;

    const likeRef = doc(db, 'likes', `${auth.currentUser.uid}_${gameId}`);
    const gameRef = doc(db, 'games', gameId);
    const batch = writeBatch(db);

    try {
      if (isLiked) {
        batch.delete(likeRef);
        batch.update(gameRef, { likesCount: increment(-1) });
      } else {
        batch.set(likeRef, {
          userId: auth.currentUser.uid,
          gameId: gameId,
          createdAt: serverTimestamp()
        });
        batch.update(gameRef, { likesCount: increment(1) });
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `likes/${auth.currentUser.uid}_${gameId}`);
    }
  };

  return (
    <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar relative">
      {/* Top Navigation Overlay */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-12 pointer-events-none">
        <div className="flex space-x-6 text-white/70 font-semibold text-lg drop-shadow-md">
          <span className="cursor-pointer pointer-events-auto">Following</span>
          <span className="text-white cursor-pointer pointer-events-auto relative">
            For You
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
          </span>
        </div>
      </div>

      {feed.map((item) => (
        <GameContainer
          key={item.id}
          id={item.id}
          author={item.authorName}
          authorPhoto={item.authorPhoto}
          description={item.description}
          song={`Original Sound - ${item.authorName}`}
          likes={item.likesCount}
          comments={item.commentsCount}
          shares={item.sharesCount}
          onLike={(isLiked) => handleLike(item.id, item.likesCount, isLiked)}
        >
          {(isActive) => <item.Game isActive={isActive} />}
        </GameContainer>
      ))}
    </div>
  );
}
