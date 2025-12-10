import React, { useState, useEffect } from 'react';
import { Location, Desk, Booking, StaffMember } from '../types';
import { api } from '../services/api';
import Header from './Header';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthenticatedLayout: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [desks, setDesks] = useState<Desk[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser: authUser, staffMember: currentUser, logout } = useAuth(); // Firebase User & Staff Member Profile

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [locationsData, desksData, bookingsData, staffMembersData] = await Promise.all([
                api.fetchLocations(),
                api.fetchDesks(),
                api.fetchBookings(),
                api.fetchStaffMembers(),
            ]);
            setLocations(locationsData);
            setDesks(desksData);
            setBookings(bookingsData);
            setStaffMembers(staffMembersData);
        } catch (err) {
            setError('Failed to load data. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [authUser]);

    // Simple mapping from path to 'screen' name for Header styling props
    const getCurrentScreen = () => {
        const path = location.pathname;
        if (path === '/') return 'booking';
        if (path.startsWith('/history')) return 'history';
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/reserved')) return 'reserved';
        if (path.startsWith('/profile')) return 'profile';
        return 'booking';
    };

    const handleNavigate = (screen: 'booking' | 'history' | 'admin' | 'reserved' | 'profile') => {
        switch (screen) {
            case 'booking': navigate('/'); break;
            case 'history': navigate('/history'); break;
            case 'admin': navigate('/admin'); break;
            case 'reserved': navigate('/reserved'); break;
            case 'profile': navigate('/profile'); break;
        }
    };

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <Header
                currentScreen={getCurrentScreen()}
                onNavigate={handleNavigate}
                currentUser={currentUser}
                onLogout={logout}
            />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet context={{
                    locations, desks, bookings, staffMembers, currentUser, isLoading, error, onRefresh: fetchData
                }} />
            </main>
        </div>
    );
};

export default AuthenticatedLayout;
