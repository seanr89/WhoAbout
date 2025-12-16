import React, { useState, useEffect } from 'react';
import { Booking, Desk, StaffMember, BookingSlot, DeskType, Location } from '../types';
import { bookingService } from '../services/bookingService';
import BookingDetailsModal from './BookingDetailsModal';
import ChairIcon from './icons/ChairIcon';

// Helper to get start of current week (Monday)
const getStartOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
};

const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

const MyBookingsScreen: React.FC = () => {
    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [myBookings, setMyBookings] = useState<Booking[]>([]);
    const [myReservedDesks, setMyReservedDesks] = useState<Desk[]>([]);
    const [allDesks, setAllDesks] = useState<Desk[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [currentWeekStart]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [bookings, desks, me, locs] = await Promise.all([
                bookingService.getMyBookings(),
                bookingService.getDesks(),
                bookingService.getMe(),
                bookingService.getLocations()
            ]);

            setMyBookings(bookings);
            setAllDesks(desks);
            setLocations(locs);

            if (me) {
                const reserved = desks.filter(d => d.reservedForStaffMemberId === me.id);
                setMyReservedDesks(reserved);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load bookings data.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreviousWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const handleCurrentWeek = () => {
        setCurrentWeekStart(getStartOfWeek(new Date()));
    }

    const weekDays = Array.from({ length: 5 }).map((_, i) => {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        return date;
    });

    const getBookingsForDate = (date: Date) => {
        const dateStr = formatDate(date);
        return myBookings.filter(b => b.date === dateStr);
    };

    const handleBookingClick = (booking: Booking) => {
        setSelectedBooking(booking);
    };

    const handleCancelBooking = async (bookingId: number) => {
        try {
            const success = await bookingService.deleteBooking(bookingId);
            if (success) {
                // Refresh data
                await fetchData();
            } else {
                throw new Error('Failed to delete booking');
            }
        } catch (err) {
            console.error('Error cancelling booking:', err);
            alert('Failed to cancel booking. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">My Bookings</h2>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handlePreviousWeek}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                        aria-label="Previous week"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-lg font-medium text-slate-700 min-w-[140px] text-center">
                        {formatDisplayDate(currentWeekStart)} - {formatDisplayDate(weekDays[4])}
                    </span>
                    <button
                        onClick={handleNextWeek}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                        aria-label="Next week"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button
                        onClick={handleCurrentWeek}
                        className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors ml-2"
                    >
                        Today
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                    <p className="mt-2 text-slate-500">Loading your schedule...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {weekDays.map(date => {
                        const dateBookings = getBookingsForDate(date);
                        const isToday = formatDate(date) === formatDate(new Date());

                        return (
                            <div
                                key={formatDate(date)}
                                className={`flex flex-col h-full min-h-[300px] rounded-xl border ${isToday ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10' : 'border-slate-200 bg-white'} overflow-hidden transition-all hover:shadow-md`}
                            >
                                <div className={`p-3 border-b ${isToday ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-700'}`}>
                                    <p className="font-bold text-lg">{date.toLocaleDateString('en-GB', { weekday: 'long' })}</p>
                                    <p className="text-sm opacity-75">{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</p>
                                </div>

                                <div className="p-3 space-y-3 flex-1">
                                    {/* Reserved Desks Section */}
                                    {myReservedDesks.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reserved</p>
                                            {myReservedDesks.map(desk => (
                                                <div key={`reserved-${desk.id}`} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <ChairIcon className="w-4 h-4 text-amber-600" />
                                                        <span className="font-bold text-amber-800 text-sm">{desk.label}</span>
                                                    </div>
                                                    <p className="text-xs text-amber-700">Permanent Reservation</p>
                                                    <p className="text-xs text-amber-600 mt-1">{desk.type}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bookings Section */}
                                    {dateBookings.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Booked</p>
                                            {dateBookings.map(booking => {
                                                const desk = allDesks.find(d => d.id === booking.deskId);
                                                const location = desk ? locations.find(l => l.id === desk.locationId) : null;

                                                return (
                                                    <div
                                                        key={booking.id}
                                                        onClick={() => handleBookingClick(booking)}
                                                        className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 relative group cursor-pointer hover:bg-indigo-100 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <span className="font-bold text-indigo-800 text-sm block">
                                                                    {desk ? desk.label : `Desk ${booking.deskId}`}
                                                                </span>
                                                                {location && (
                                                                    <span className="text-xs text-indigo-600 block mb-1 font-medium">
                                                                        {location.name}, {location.city}
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-indigo-600 font-medium inline-block bg-indigo-100 px-2 py-0.5 rounded-full mt-1">
                                                                    {booking.slot}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {myReservedDesks.length === 0 && dateBookings.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                                            <p className="text-sm italic">No bookings</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Booking Details Modal */}
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    desk={allDesks.find(d => d.id === selectedBooking.deskId) || null}
                    location={(() => {
                        const desk = allDesks.find(d => d.id === selectedBooking.deskId);
                        return desk ? locations.find(l => l.id === desk.locationId) || null : null;
                    })()}
                    onClose={() => setSelectedBooking(null)}
                    onCancel={handleCancelBooking}
                />
            )}
        </div>
    );
};

export default MyBookingsScreen;
