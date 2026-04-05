import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const OwnerScreen: React.FC = () => {
  const { staffMember, claims, isAdmin } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Owner Dashboard</h2>
        <p className="text-slate-500 mt-1">This is a temporary screen for Owners.</p>
      </div>
      <div className="p-6">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p className="text-amber-700">
            <strong>Restricted Access:</strong> Only users with the Owner role or owner claims can see this screen.
          </p>
        </div>
        
        <h3 className="font-semibold text-slate-700 mb-2">Your Details:</h3>
        <ul className="list-disc pl-5 text-slate-600 mb-6 space-y-1">
          <li><strong>Role ID:</strong> {staffMember?.role}</li>
          <li><strong>Is Admin Claim:</strong> {isAdmin ? 'Yes' : 'No'}</li>
        </ul>

        <h3 className="font-semibold text-slate-700 mb-2">Raw Claims:</h3>
        <pre className="bg-slate-100 p-4 rounded-md overflow-x-auto text-sm text-slate-800">
          {claims ? JSON.stringify(claims, null, 2) : 'No claims found.'}
        </pre>
      </div>
    </div>
  );
};

export default OwnerScreen;
