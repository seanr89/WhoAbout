
import React from 'react';
import ChairIcon from './icons/ChairIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <ChairIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Office Desk Booker
            </h1>
          </div>
          <div className="flex items-center space-x-2">
             <img src="https://picsum.photos/40/40" alt="User Avatar" className="h-10 w-10 rounded-full"/>
             <span className="text-sm font-medium text-slate-600 hidden sm:block">Jane Doe</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
