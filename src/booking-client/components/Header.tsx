import React from 'react';
import ChairIcon from './icons/ChairIcon';
import { StaffMember } from '../types';

interface HeaderProps {
  currentScreen: 'booking' | 'history' | 'admin' | 'reserved' | 'profile';
  onNavigate: (screen: 'booking' | 'history' | 'admin' | 'reserved' | 'profile') => void;
  currentUser: StaffMember | null;
}

const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate, currentUser }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('booking')}>
              <ChairIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Office Desk Booker
              </h1>
            </div>

            <nav className="hidden md:flex space-x-4">
              <button
                onClick={() => onNavigate('booking')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentScreen === 'booking'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Book a Desk
              </button>
              <button
                onClick={() => onNavigate('history')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentScreen === 'history'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                History
              </button>
              <button
                onClick={() => onNavigate('reserved')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentScreen === 'reserved'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Reserved
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentScreen === 'admin'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Admin
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Navigation (simplified) */}
            <div className="md:hidden flex space-x-2 mr-2">
              <button
                onClick={() => onNavigate('booking')}
                className={`p-2 rounded-md ${currentScreen === 'booking' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
              >
                Book
              </button>
              <button
                onClick={() => onNavigate('history')}
                className={`p-2 rounded-md ${currentScreen === 'history' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
              >
                History
              </button>
              <button
                onClick={() => onNavigate('reserved')}
                className={`p-2 rounded-md ${currentScreen === 'reserved' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
              >
                Reserved
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className={`p-2 rounded-md ${currentScreen === 'admin' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
              >
                Admin
              </button>
            </div>

            <div
              className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
              onClick={() => onNavigate('profile')}
            >
              <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="text-sm font-medium text-slate-600 hidden sm:block">
                {currentUser ? currentUser.name : 'Guest'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
