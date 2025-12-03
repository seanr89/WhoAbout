import React, { useState, useMemo } from 'react';
import { Location, Booking, Desk, StaffMember } from '../types';
import { api } from '../services/api';
import LocationIcon from './icons/LocationIcon';
import CalendarIcon from './icons/CalendarIcon';
import TrashIcon from './icons/TrashIcon';

interface CancellationScreenProps {
    locations: Location[];
    bookings: Booking[];
    desks: Desk[];
    staffMembers: StaffMember[];
    onRefresh: () => void;
}

const CancellationScreen: React.FC<CancellationScreenProps> = ({
    locations,
    bookings,
    desks,
    staffMembers,
    onRefresh,
}) => {
    const [selectedLocationId, setSelectedLocationId] = useState<string>(
        locations.length > 0 ? locations[0].id : ''
    );
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const desk = desks.find((d) => d.id === booking.deskId);
            if (!desk) return false;

            const isLocationMatch = desk.locationId === selectedLocationId;
            const isDateMatch = booking.date === selectedDate;

            return isLocationMatch && isDateMatch;
        });
    }, [bookings, desks, selectedLocationId, selectedDate]);

    const handleDeleteBooking = async (bookingId: string) => {
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

    const getDeskLabel = (deskId: string) => {
        const desk = desks.find((d) => d.id === deskId);
        return desk ? desk.label : 'Unknown Desk';
    };

    const getStaffName = (staffId: string) => {
        const staff = staffMembers.find((s) => s.id === staffId);
        return staff ? staff.name : 'Unknown Staff';
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Cancel Bookings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location Selector */}
                    <div className="space-y-2">
                        <label
                            htmlFor="cancel-location-select"
                            className="flex items-center text-sm font-medium text-slate-600"
                        >
                            <LocationIcon className="w-5 h-5 mr-2 text-slate-400" />
                            Location
                        </label>
                        <select
                            id="cancel-location-select"
                            value={selectedLocationId}
                            onChange={(e) => setSelectedLocationId(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-2">
                        <label
                            htmlFor="cancel-date-picker"
                            className="flex items-center text-sm font-medium text-slate-600"
                        >
                            <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />
                            Date
                        </label>
                        <input
                            id="cancel-date-picker"
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800">
                        Bookings for {selectedDate}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-medium">
                            <tr>
                                <th className="px-6 py-3">Desk</th>
                                <th className="px-6 py-3">Staff Member</th>
                                <th className="px-6 py-3">Time Slot</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No bookings found for this date and location.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {getDeskLabel(booking.deskId)}
                                        </td>
                                        <td className="px-6 py-4">{getStaffName(booking.staffMemberId)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {booking.slot}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteBooking(booking.id)}
                                                disabled={isDeleting === booking.id}
                                                className="text-red-600 hover:text-red-800 font-medium transition disabled:opacity-50 flex items-center justify-end ml-auto"
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
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CancellationScreen;
