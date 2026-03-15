import React from 'react';
import { Link } from 'react-router-dom';

const HomeScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-6xl">
            Welcome to NoteForge
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            The modern office desk booking system designed to streamline your hybrid work experience.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-12 text-left">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Why NoteForge?
          </h2>
          <ul className="space-y-4 text-slate-600 mb-8">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-indigo-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Easily find and book available desks in your office locations.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-indigo-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Manage your bookings efficiently with a user-friendly dashboard.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-indigo-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Coordinate with colleagues and view shared resources in real-time.</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
            <Link
              to="/login"
              className="w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto flex justify-center py-3 px-8 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          NoteForge - Making office coordination seamless.
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
