import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { useNavigate } from 'react-router-dom';

export default function Friends() {
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth.currentUser) {
        navigate('/auth');
        return;
      }

      try {
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        const allUsers = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== auth.currentUser?.uid);
        setUsers(allUsers);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    };
    fetchUsers();
  }, [navigate]);

  if (!auth.currentUser) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-24">
      <div className="max-w-md mx-auto mt-12">
        <h1 className="text-3xl font-bold mb-2">Friends & DMs</h1>
        <p className="text-zinc-400 mb-8">Connect with other players.</p>

        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-center space-x-4">
                <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full bg-zinc-800" />
                <div>
                  <h3 className="font-bold">{user.displayName}</h3>
                  <p className="text-xs text-zinc-500">@{user.displayName.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                Message
              </button>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              No other users found yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
