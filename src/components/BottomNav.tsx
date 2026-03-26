import React from 'react';
import { Home, PlusSquare, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/create', icon: PlusSquare, label: 'Create' },
    { path: '/friends', icon: Users, label: 'Friends' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pt-2 pointer-events-none">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex justify-between items-center px-6 py-3 pointer-events-auto shadow-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive ? 'bg-white/20 text-white scale-110' : 'text-white/50 hover:text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
