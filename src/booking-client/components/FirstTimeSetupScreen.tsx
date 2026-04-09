import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';

const FirstTimeSetupScreen: React.FC = () => {
  const { currentUser, staffMember, setStaffMember, logout } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err: any) {
      setError('Failed to log out.');
    }
  };

  useEffect(() => {
    // If they already have a complete profile with a first login date, skip this screen
    if (staffMember && staffMember.firstLoginDate) {
      navigate('/');
      return;
    }

    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Pre-fill name if we have one
    if (staffMember?.name) {
      setName(staffMember.name);
    } else if (currentUser.displayName) {
      setName(currentUser.displayName);
    } else if (currentUser.email) {
      setName(currentUser.email.split('@')[0]);
    }
  }, [currentUser, staffMember, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!name.trim()) {
        throw new Error('Please enter your name.');
      }

      // Complete setup via API
      const updatedStaff = await bookingService.completeSetup(name);
      
      // Update local context so protected routes allow them through
      setStaffMember(updatedStaff);
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent flashing content if we are about to redirect
  if (!currentUser || (staffMember && staffMember.firstLoginDate)) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <span className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full shadow-sm mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to WhoAbout!
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            It looks like this is your first time logging in. Let's finish setting up your profile so you can start booking desks.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g. Jane Doe"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
              >
                {isSubmitting ? 'Saving...' : 'Get Started'}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-sm text-slate-500">Not your account? </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none underline transition duration-150 ease-in-out"
              >
                Sign out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeSetupScreen;
