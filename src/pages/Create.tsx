import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function CreateGame() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<number | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTokens = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setTokens(userDoc.data().tokens);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser.uid}`);
        }
      } else {
        navigate('/auth');
      }
    };
    fetchTokens();
  }, [navigate]);

  const handleCreate = async () => {
    if (!auth.currentUser) return;
    if (tokens === null || tokens < 1000) {
      setError('Not enough tokens. You need 1000 Naira to create a game.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a description for your game.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Generate Game Code using Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Create a simple, single-file React component for a mini-game based on this prompt: "${prompt}". 
        The component must be the default export. It receives a prop { isActive: boolean }.
        Use Tailwind CSS for styling. Make it fit in a full-screen mobile container (w-full h-full).
        Do not use any external libraries other than React and lucide-react.
        Return ONLY the raw React code, no markdown formatting, no explanations.`,
      });

      const generatedCode = response.text?.replace(/```tsx?/g, '').replace(/```/g, '').trim() || '';

      if (!generatedCode) throw new Error("Failed to generate code.");

      // 2. Deduct Tokens
      const userRef = doc(db, 'users', auth.currentUser.uid);
      try {
        await updateDoc(userRef, { tokens: increment(-1000) });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
      setTokens(prev => prev !== null ? prev - 1000 : null);

      // 3. Save Game to Firestore
      let userData;
      try {
        const userDoc = await getDoc(userRef);
        userData = userDoc.data();
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser.uid}`);
      }

      try {
        await addDoc(collection(db, 'games'), {
          authorId: auth.currentUser.uid,
          authorName: userData?.displayName || 'Anonymous',
          authorPhoto: userData?.photoURL || '',
          title: prompt.substring(0, 20) + '...',
          description: prompt,
          code: generatedCode,
          likesCount: 0,
          commentsCount: 0,
          sharesCount: 0,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'games');
      }

      alert("Game created successfully! It's now in the feed.");
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the game.');
    } finally {
      setLoading(false);
    }
  };

  if (!auth.currentUser) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-24">
      <div className="max-w-md mx-auto mt-12">
        <h1 className="text-3xl font-bold mb-2">Create a Game</h1>
        <p className="text-zinc-400 mb-8">Describe a mini-game and our AI will build it instantly.</p>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 mb-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400 font-medium">Your Balance</span>
            <span className={`font-bold text-lg ${tokens !== null && tokens >= 1000 ? 'text-green-400' : 'text-red-400'}`}>
              ₦{tokens !== null ? tokens : '...'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-zinc-800 pt-4">
            <span className="text-zinc-500">Cost per generation</span>
            <span className="text-white font-medium">₦1000</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A game where you tap falling stars before they hit the ground..."
            className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 resize-none"
          />
          
          <button
            onClick={handleCreate}
            disabled={loading || tokens === null || tokens < 1000 || !prompt.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Magic...</span>
              </>
            ) : (
              <span>Generate Game</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
