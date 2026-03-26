import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [userGames, setUserGames] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) {
        navigate('/auth');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser.uid}`);
      }

      try {
        const q = query(collection(db, 'games'), where('authorId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const games = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserGames(games);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'games');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/auth');
  };

  if (!userData) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-24">
      <div className="max-w-md mx-auto mt-12">
        <div className="flex items-center space-x-6 mb-8">
          <img src={userData.photoURL} alt="Profile" className="w-24 h-24 rounded-full border-4 border-zinc-800" />
          <div>
            <h1 className="text-3xl font-bold">{userData.displayName}</h1>
            <p className="text-zinc-400">@{userData.displayName.toLowerCase().replace(/\s+/g, '')}</p>
            <div className="mt-2 flex items-center space-x-4">
              <span className="text-sm"><strong className="text-white">{userGames.length}</strong> Games</span>
              <span className="text-sm"><strong className="text-white">1.2K</strong> Followers</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 mb-8 flex justify-between items-center shadow-xl">
          <div>
            <p className="text-zinc-400 text-sm">Token Balance</p>
            <p className="text-2xl font-bold text-green-400">₦{userData.tokens}</p>
          </div>
          <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            Top Up
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Your Games</h2>
        {userGames.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
            <p className="text-zinc-500 mb-4">You haven't created any games yet.</p>
            <button onClick={() => navigate('/create')} className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create your first game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {userGames.map(game => (
              <div key={game.id} className="aspect-[3/4] bg-zinc-800 rounded-xl overflow-hidden relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                  <span className="text-xs font-medium truncate">{game.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={handleSignOut}
          className="w-full mt-12 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-4 rounded-2xl transition-colors border border-red-500/20"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
