import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

import { StaffMember } from '../types';
import { bookingService } from '../services/bookingService';

interface AuthContextType {
  currentUser: User | null;
  staffMember: StaffMember | null;
  claims: Record<string, any> | null;
  isAdmin: boolean;
  setStaffMember: (staff: StaffMember | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  staffMember: null,
  claims: null,
  isAdmin: false,
  setStaffMember: () => {},
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null);
  const [claims, setClaims] = useState<Record<string, any> | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult(true);
          const userClaims = tokenResult.claims;
          setClaims(userClaims);
          
          // Determine admin status based on claim or matching role string
          const hasAdminClaim = userClaims?.admin === true || 
                                userClaims?.role === 'Admin' || 
                                userClaims?.role === 'Owner';
          setIsAdmin(hasAdminClaim);
        } catch (error) {
          console.error("Error fetching custom claims", error);
          setClaims({});
          setIsAdmin(false);
        }

        // Fetch staff member profile
        const staff = await bookingService.getMe();
        setStaffMember(staff);
      } else {
        setStaffMember(null);
        setClaims(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await auth.signOut();
    setStaffMember(null);
    setClaims(null);
    setIsAdmin(false);
  };

  const value = {
    currentUser,
    staffMember,
    claims,
    isAdmin,
    setStaffMember,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
