/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import CreateGame from './pages/Create';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import AuthPage from './pages/Auth';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <Router>
      <div className="h-screen w-full bg-black relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={user ? <CreateGame /> : <Navigate to="/auth" />} />
          <Route path="/friends" element={user ? <Friends /> : <Navigate to="/auth" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}
