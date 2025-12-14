import React from 'react';
import ChairIcon from './icons/ChairIcon';
import { StaffMember } from '../types';

interface HeaderProps {
  currentScreen: 'booking' | 'admin' | 'reserved' | 'profile';
  onNavigate: (screen: 'booking' | 'admin' | 'reserved' | 'profile') => void;
  currentUser: StaffMember | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate, currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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

            <div className="relative">
              <div
                className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                  {currentUser ? currentUser.name.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="text-sm font-medium text-slate-600 hidden sm:block">
                  {currentUser ? currentUser.name : 'Guest'}
                </span>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onNavigate('profile');
                    }}
                  >
                    Your Profile
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
