import React, { useState, useMemo } from 'react';
import { Location, StaffMember, Booking, DailyBookingCount, Desk, BookingSlot, Role } from '../types';
import { api } from '../services/api';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/ChevronIcons';
import LocationIcon from './icons/LocationIcon';
import CalendarIcon from './icons/CalendarIcon';
import Calendar from './Calendar';
import TrashIcon from './icons/TrashIcon';

interface AdminScreenProps {
    locations: Location[];
    staffMembers: StaffMember[];
    bookings: Booking[];
    desks: Desk[];
    onDataRefresh: () => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ locations, staffMembers, bookings, desks, onDataRefresh }) => {
    const [activeTab, setActiveTab] = useState<'offices' | 'staff' | 'stats' | 'bookings'>('offices');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Office Form State
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationCity, setNewLocationCity] = useState('');
    const [isAddingLocation, setIsAddingLocation] = useState(false);

    // Staff Form State
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [isAddingStaff, setIsAddingStaff] = useState(false);

    // Stats State
    const [statsStaffId, setStatsStaffId] = useState<string>('');
    const [statsStartDate, setStatsStartDate] = useState<string>('');
    const [statsEndDate, setStatsEndDate] = useState<string>('');

    // Occupancy Stats State
    const [occupancyLocationId, setOccupancyLocationId] = useState<string>(locations[0]?.id || '');
    const [occupancyMonth, setOccupancyMonth] = useState<Date>(new Date());
    const [occupancyStats, setOccupancyStats] = useState<DailyBookingCount[]>([]);

    // History / Bookings State
    const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || '');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // Initialize selectedDate to today if not set
    React.useEffect(() => {
        if (!selectedDate) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            setSelectedDate(`${year}-${month}-${day}`);
        }
    }, [selectedDate]);

    React.useEffect(() => {
        if (activeTab === 'stats' && occupancyLocationId) {
            const startOfMonth = new Date(occupancyMonth.getFullYear(), occupancyMonth.getMonth(), 1);
            const endOfMonth = new Date(occupancyMonth.getFullYear(), occupancyMonth.getMonth() + 1, 0);

            const startStr = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-${String(startOfMonth.getDate()).padStart(2, '0')}`;
            const endStr = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;

            const fetchStats = async () => {
                try {
                    const stats = await api.fetchBookingStats(
                        occupancyLocationId,
                        startStr,
                        endStr
                    );
                    setOccupancyStats(stats);
                } catch (err) {
                    console.error("Failed to fetch occupancy stats", err);
                }
            };
            fetchStats();
        }
    }, [activeTab, occupancyLocationId, occupancyMonth]);

    const stats = useMemo(() => {
        if (!statsStaffId || !statsStartDate || !statsEndDate) return null;

        const start = new Date(statsStartDate);
        const end = new Date(statsEndDate);

        const filteredBookings = bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return b.staffMemberId === statsStaffId &&
                bookingDate >= start &&
                bookingDate <= end;
        });

        const totalBookings = filteredBookings.length;

        // Calculate weeks difference
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        const weeksDiff = Math.max(1, Math.ceil(daysDiff / 7));

        const avgBookingsPerWeek = totalBookings / weeksDiff;

        return {
            totalBookings,
            avgBookingsPerWeek: avgBookingsPerWeek.toFixed(1)
        };
    }, [bookings, statsStaffId, statsStartDate, statsEndDate]);

    const historyFilteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const locationMatch = !selectedLocationId || desks.find(d => d.id === booking.deskId)?.locationId === selectedLocationId;
            const dateMatch = !selectedDate || booking.date === selectedDate;
            return locationMatch && dateMatch;
        });
    }, [bookings, selectedLocationId, selectedDate, desks]);


    // --- Office Handlers ---

    const handleCreateLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await api.createLocation({ name: newLocationName, city: newLocationCity });
            setNewLocationName('');
            setNewLocationCity('');
            setIsAddingLocation(false);
            onDataRefresh();
        } catch (err) {
            setError('Failed to create location');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLocation) return;
        try {
            setIsLoading(true);
            await api.updateLocation(editingLocation);
            setEditingLocation(null);
            onDataRefresh();
        } catch (err) {
            setError('Failed to update location');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLocation = async (id: string) => {
        if (!confirm('Are you sure you want to delete this location?')) return;
        try {
            setIsLoading(true);
            await api.deleteLocation(id);
            onDataRefresh();
        } catch (err) {
            setError('Failed to delete location');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Staff Handlers ---

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await api.createStaffMember({ name: newStaffName, email: newStaffEmail, isActive: true, role: Role.Employee });
            setNewStaffName('');
            setNewStaffEmail('');
            setIsAddingStaff(false);
            onDataRefresh();
        } catch (err) {
            setError('Failed to create staff member');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaff) return;
        try {
            setIsLoading(true);
            await api.updateStaffMember(editingStaff);
            setEditingStaff(null);
            onDataRefresh();
        } catch (err) {
            setError('Failed to update staff member');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteStaff = async (id: string) => {
        if (!confirm('Are you sure you want to delete this staff member?')) return;
        try {
            setIsLoading(true);
            await api.deleteStaffMember(id);
            onDataRefresh();
        } catch (err) {
            setError('Failed to delete staff member');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- History / Bookings Handlers ---

    const handleDeleteBooking = async (bookingId: number) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            setIsDeleting(bookingId);
            await api.deleteBooking(bookingId);
            onDataRefresh();
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            setError('Failed to cancel booking. Please try again.');
        } finally {
            setIsDeleting(null);
        }
    };

    const getDeskName = (deskId: number) => desks.find(d => d.id === deskId)?.label || 'Unknown Desk';
    const getStaffName = (staffId: string) => staffMembers.find(s => s.id === staffId)?.name || 'Unknown Staff';
    const getLocationName = (deskId: number) => {
        const desk = desks.find(d => d.id === deskId);
        return locations.find(l => l.id === desk?.locationId)?.name || 'Unknown Location';
    };


    const renderOccupancyCalendar = () => {
        const year = occupancyMonth.getFullYear();
        const month = occupancyMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const leadingBlanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

        const handlePrevMonth = () => setOccupancyMonth(new Date(year, month - 1, 1));
        const handleNextMonth = () => setOccupancyMonth(new Date(year, month + 1, 1));

        return (
            <div className="bg-white rounded-lg border border-slate-200 p-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeftIcon className="w-5 h-5 text-slate-600" /></button>
                    <span className="font-bold text-lg text-slate-800">{occupancyMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRightIcon className="w-5 h-5 text-slate-600" /></button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-500 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {leadingBlanks.map(i => <div key={`blank-${i}`} className="h-24 bg-slate-50 rounded-lg"></div>)}
                    {days.map(day => {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const stat = occupancyStats.find(s => s.date === dateStr);
                        const count = stat ? stat.count : 0;

                        return (
                            <div key={day} className="h-24 border border-slate-100 rounded-lg p-2 flex flex-col justify-between hover:bg-slate-50 transition bg-white">
                                <span className="text-sm font-medium text-slate-700">{day}</span>
                                <div className="flex items-end justify-end">
                                    {count > 0 && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-slate-500 mb-1">Bookings</span>
                                            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">
                                                {count}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('offices')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'offices' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Offices
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'staff' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Staff
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Stats
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Bookings
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-sm font-bold">Dismiss</button>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Booking History & Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            {/* Location Selector */}
                            <div className="space-y-2">
                                <label htmlFor="history-location-select" className="flex items-center text-sm font-medium text-slate-600">
                                    <LocationIcon className="w-5 h-5 mr-2 text-slate-400" />
                                    Location
                                </label>
                                <select
                                    id="history-location-select"
                                    value={selectedLocationId}
                                    onChange={(e) => setSelectedLocationId(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                >
                                    {locations.map(location => (
                                        <option key={location.id} value={location.id}>{location.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Picker */}
                            <div className="space-y-2 relative">
                                <label htmlFor="history-date-picker" className="flex items-center text-sm font-medium text-slate-600">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />
                                    Date
                                </label>
                                <button
                                    id="history-date-picker"
                                    type="button"
                                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                    className="w-full text-left p-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                >
                                    {selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    }) : 'Select Date'}
                                </button>
                                {isCalendarOpen && (
                                    <div className="absolute top-full mt-2 z-10">
                                        <Calendar
                                            selectedDate={selectedDate}
                                            onDateSelect={(date) => {
                                                setSelectedDate(date);
                                                setIsCalendarOpen(false);
                                            }}
                                        // No minDate for history, we want to see past bookings too
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time Slot</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Desk</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Staff Member</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {historyFilteredBookings.length > 0 ? (
                                        historyFilteredBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                    {new Date(booking.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${booking.slot === BookingSlot.FULL_DAY ? 'bg-green-100 text-green-800' :
                                                            booking.slot === BookingSlot.MORNING ? 'bg-blue-100 text-blue-800' :
                                                                'bg-orange-100 text-orange-800'}`}>
                                                        {booking.slot}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {getLocationName(booking.deskId)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                    {getDeskName(booking.deskId)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {getStaffName(booking.staffMemberId)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDeleteBooking(booking.id)}
                                                        disabled={isDeleting === booking.id}
                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50 inline-flex items-center"
                                                    >
                                                        {isDeleting === booking.id ? (
                                                            'Cancelling...'
                                                        ) : (
                                                            <>
                                                                <TrashIcon className="w-4 h-4 mr-1" />
                                                                Cancel
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                                                No bookings found for the selected criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'offices' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-slate-800">Manage Offices</h3>
                        <button
                            onClick={() => setIsAddingLocation(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition"
                        >
                            Add Office
                        </button>
                    </div>

                    {isAddingLocation && (
                        <form onSubmit={handleCreateLocation} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">New Office</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Office Name"
                                    value={newLocationName}
                                    onChange={e => setNewLocationName(e.target.value)}
                                    className="p-2 border border-slate-300 rounded-md"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={newLocationCity}
                                    onChange={e => setNewLocationCity(e.target.value)}
                                    className="p-2 border border-slate-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingLocation(false)}
                                    className="px-3 py-1 text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">City</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {locations.map(location => (
                                    <tr key={location.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {editingLocation?.id === location.id ? (
                                                <input
                                                    type="text"
                                                    value={editingLocation.name}
                                                    onChange={e => setEditingLocation({ ...editingLocation, name: e.target.value })}
                                                    className="p-1 border border-slate-300 rounded w-full"
                                                />
                                            ) : (
                                                location.name
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {editingLocation?.id === location.id ? (
                                                <input
                                                    type="text"
                                                    value={editingLocation.city}
                                                    onChange={e => setEditingLocation({ ...editingLocation, city: e.target.value })}
                                                    className="p-1 border border-slate-300 rounded w-full"
                                                />
                                            ) : (
                                                location.city
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingLocation?.id === location.id ? (
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={handleUpdateLocation} className="text-green-600 hover:text-green-900">Save</button>
                                                    <button onClick={() => setEditingLocation(null)} className="text-slate-600 hover:text-slate-900">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => setEditingLocation(location)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                    <button onClick={() => handleDeleteLocation(location.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-slate-800">Manage Staff</h3>
                        <button
                            onClick={() => setIsAddingStaff(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition"
                        >
                            Add Staff
                        </button>
                    </div>

                    {isAddingStaff && (
                        <form onSubmit={handleCreateStaff} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">New Staff Member</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={newStaffName}
                                    onChange={e => setNewStaffName(e.target.value)}
                                    className="p-2 border border-slate-300 rounded-md"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={newStaffEmail}
                                    onChange={e => setNewStaffEmail(e.target.value)}
                                    className="p-2 border border-slate-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingStaff(false)}
                                    className="px-3 py-1 text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {staffMembers.map(staff => (
                                    <tr key={staff.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {editingStaff?.id === staff.id ? (
                                                <input
                                                    type="text"
                                                    value={editingStaff.name}
                                                    onChange={e => setEditingStaff({ ...editingStaff, name: e.target.value })}
                                                    className="p-1 border border-slate-300 rounded w-full"
                                                />
                                            ) : (
                                                staff.name
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {editingStaff?.id === staff.id ? (
                                                <input
                                                    type="email"
                                                    value={editingStaff.email}
                                                    onChange={e => setEditingStaff({ ...editingStaff, email: e.target.value })}
                                                    className="p-1 border border-slate-300 rounded w-full"
                                                />
                                            ) : (
                                                staff.email
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {editingStaff?.id === staff.id ? (
                                                <select
                                                    value={editingStaff.isActive ? 'active' : 'inactive'}
                                                    onChange={e => setEditingStaff({ ...editingStaff, isActive: e.target.value === 'active' })}
                                                    className="p-1 border border-slate-300 rounded"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {staff.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingStaff?.id === staff.id ? (
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={handleUpdateStaff} className="text-green-600 hover:text-green-900">Save</button>
                                                    <button onClick={() => setEditingStaff(null)} className="text-slate-600 hover:text-slate-900">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => setEditingStaff(staff)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                    <button onClick={() => handleDeleteStaff(staff.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="space-y-8">
                    {/* User Stats Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-6">User Booking Statistics</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Staff Member</label>
                                <select
                                    value={statsStaffId}
                                    onChange={(e) => setStatsStaffId(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md"
                                >
                                    <option value="">Select Staff Member</option>
                                    {staffMembers.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={statsStartDate}
                                    onChange={(e) => setStatsStartDate(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={statsEndDate}
                                    onChange={(e) => setStatsEndDate(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md"
                                />
                            </div>
                        </div>

                        {stats ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                                    <p className="text-sm font-medium text-indigo-600 mb-1">Total Bookings</p>
                                    <p className="text-3xl font-bold text-indigo-900">{stats.totalBookings}</p>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                                    <p className="text-sm font-medium text-green-600 mb-1">Average Bookings / Week</p>
                                    <p className="text-3xl font-bold text-green-900">{stats.avgBookingsPerWeek}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                <p className="text-slate-500">Select a staff member and date range to view statistics.</p>
                            </div>
                        )}
                    </div>

                    {/* Office Occupancy Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-slate-800">Office Occupancy</h3>
                            <div className="w-64">
                                <select
                                    value={occupancyLocationId}
                                    onChange={(e) => setOccupancyLocationId(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm"
                                >
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {renderOccupancyCalendar()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminScreen;
