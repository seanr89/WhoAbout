import React from 'react';
import { Routes, Route, useOutletContext } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ProtectedRoute from './components/ProtectedRoute';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import BookingScreen from './components/BookingScreen';

import AdminScreen from './components/AdminScreen';
import ReservedScreen from './components/ReservedScreen';
import ProfileScreen from './components/ProfileScreen';
import MyBookingsScreen from './components/MyBookingsScreen';
import { Location, Desk, Booking, StaffMember } from './types';

// Context interface for Outlet
interface AppContextType {
  locations: Location[];
  desks: Desk[];
  bookings: Booking[];
  staffMembers: StaffMember[];
  currentUser: StaffMember | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const BookingScreenWrapper = () => {
  const context = useOutletContext<AppContextType>();
  return <BookingScreen {...context} />;
}



const AdminScreenWrapper = () => {
  const context = useOutletContext<AppContextType>();
  return <AdminScreen
    locations={context.locations}
    staffMembers={context.staffMembers}
    bookings={context.bookings}
    desks={context.desks}
    onDataRefresh={context.onRefresh}
  />;
}

const ReservedScreenWrapper = () => {
  const context = useOutletContext<AppContextType>();
  return <ReservedScreen onRefresh={context.onRefresh} />;
}

const ProfileScreenWrapper = () => {
  const context = useOutletContext<AppContextType>();
  // ProfileScreen usage in original App passed: currentUser, onUpdateUser
  // onUpdateUser function needs to be handled? 
  // In original App it updated local state. AuthenticatedLayout manages that state now.
  // For now we might miss the onUpdateUser unless we hoist it.
  // But since fetching data refreshes everything, onRefresh might be enough if the update happens via API.
  // Let's pass a dummy for now or implement update.

  // Actually, ProfileScreen might need to re-fetch too.
  return <ProfileScreen currentUser={context.currentUser} onUpdateUser={() => context.onRefresh()} />;
}

const MyBookingsScreenWrapper = () => {
  // MyBookingsScreen fetches its own data, so we don't pass context data
  return <MyBookingsScreen />;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />

        <Route element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }>
          <Route index element={<BookingScreenWrapper />} />

          <Route path="admin" element={<AdminScreenWrapper />} />
          <Route path="reserved" element={<ReservedScreenWrapper />} />
          <Route path="profile" element={<ProfileScreenWrapper />} />
          <Route path="my-bookings" element={<MyBookingsScreenWrapper />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
