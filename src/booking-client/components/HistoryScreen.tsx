import React, { useState, useMemo } from 'react';
import { Booking, Location, Desk, StaffMember, BookingSlot } from '../types';
import LocationIcon from './icons/LocationIcon';
import CalendarIcon from './icons/CalendarIcon';
import Calendar from './Calendar';
import TrashIcon from './icons/TrashIcon';
import { api } from '../services/api';

interface HistoryScreenProps {
    bookings: Booking[];
    locations: Location[];
    desks: Desk[];
    staffMembers: StaffMember[];
    onRefresh: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ bookings, locations, desks, staffMembers, onRefresh }) => {
    const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || '');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // Initialize selectedDate to today if not set
    if (!selectedDate) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        setSelectedDate(`${year}-${month}-${day}`);
    }

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const locationMatch = !selectedLocationId || desks.find(d => d.id === booking.deskId)?.locationId === selectedLocationId;
            const dateMatch = !selectedDate || booking.date === selectedDate;
            return locationMatch && dateMatch;
        });
    }, [bookings, selectedLocationId, selectedDate, desks]);

    const handleDeleteBooking = async (bookingId: number) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            setIsDeleting(bookingId);
            await api.deleteBooking(bookingId);
            onRefresh();
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            alert('Failed to cancel booking. Please try again.');
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

    return (
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
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
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
    );
};

export default HistoryScreen;
