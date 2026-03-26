import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Share2, Music, Plus } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface GameContainerProps {
  key?: React.Key;
  id: string;
  author: string;
  authorPhoto?: string;
  description: string;
  song: string;
  likes: number;
  comments: number;
  shares: number;
  onLike?: (isLiked: boolean) => void;
  children: (isActive: boolean) => React.ReactNode;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export default function GameContainer({ id, author, authorPhoto, description, song, likes, comments, shares, onLike, children }: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);

  useEffect(() => {
    setLocalLikes(likes);
  }, [likes]);

  useEffect(() => {
    const checkLike = async () => {
      if (auth.currentUser && !id.startsWith('built-in')) {
        try {
          const likeRef = doc(db, 'likes', `${auth.currentUser.uid}_${id}`);
          const likeSnap = await getDoc(likeRef);
          setIsLiked(likeSnap.exists());
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `likes/${auth.currentUser.uid}_${id}`);
        }
      }
    };
    checkLike();
  }, [id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLikeClick = () => {
    if (!auth.currentUser) {
      alert("Please sign in to like games!");
      return;
    }
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLocalLikes(prev => newLikedState ? prev + 1 : prev - 1);
    if (onLike) onLike(isLiked);
  };

  const avatarUrl = authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`;

  return (
    <div ref={containerRef} className="h-screen w-full snap-start relative bg-black overflow-hidden flex items-center justify-center">
      {/* Game Area */}
      <div className="absolute inset-0 z-0">
        {children(isActive)}
      </div>

      {/* TikTok UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end pb-24 px-4">
        <div className="flex justify-between items-end">
          {/* Left Info */}
          <div className="flex flex-col text-white max-w-[75%] space-y-3 pointer-events-auto drop-shadow-md">
            <h3 className="font-bold text-lg">@{author}</h3>
            <p className="text-sm">{description}</p>
            <div className="flex items-center space-x-2">
              <Music className="w-4 h-4 animate-spin-slow" />
              <div className="overflow-hidden w-48">
                <p className="text-sm animate-marquee whitespace-nowrap">{song}</p>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex flex-col items-center space-y-5 pointer-events-auto pb-4 pr-2 drop-shadow-md">
            <div className="relative w-12 h-12 mb-2">
              <div className="w-12 h-12 bg-zinc-800 rounded-full border-2 border-white overflow-hidden flex items-center justify-center">
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <button className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 rounded-full p-0.5">
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
            
            <button onClick={handleLikeClick} className="flex flex-col items-center space-y-1 group">
              <Heart className={`w-8 h-8 transition-all duration-300 group-active:scale-75 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              <span className="text-white text-xs font-semibold">{formatNumber(localLikes)}</span>
            </button>

            <button className="flex flex-col items-center space-y-1 group">
              <MessageCircle className="w-8 h-8 text-white fill-white/20 transition-transform group-active:scale-75" />
              <span className="text-white text-xs font-semibold">{formatNumber(comments)}</span>
            </button>

            <button className="flex flex-col items-center space-y-1 group">
              <Share2 className="w-8 h-8 text-white fill-white/20 transition-transform group-active:scale-75" />
              <span className="text-white text-xs font-semibold">{formatNumber(shares)}</span>
            </button>
            
            <div className="w-10 h-10 rounded-full bg-zinc-800 border-[10px] border-zinc-900 animate-spin-slow mt-4 flex items-center justify-center overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}song`} alt="album" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
