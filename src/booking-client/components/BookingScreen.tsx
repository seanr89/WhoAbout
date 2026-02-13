import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Location, Desk, Booking, BookingSlot, DeskType, StaffMember } from '../types';
import { api } from '../services/api';
import DeskLayout from './DeskLayout';
import BookingModal from './BookingModal';
import LocationIcon from './icons/LocationIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';
import FilterIcon from './icons/FilterIcon';
import Calendar from './Calendar';
import RefreshCwIcon from './icons/RefreshCwIcon';

interface BookingScreenProps {
    locations: Location[];
    desks: Desk[];
    staffMembers: StaffMember[];
    currentUser: StaffMember | null;
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
}

function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const BookingScreen: React.FC<BookingScreenProps> = ({
    locations, desks, staffMembers, currentUser, isLoading: globalLoading, error: globalError, onRefresh
}) => {
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot>(BookingSlot.FULL_DAY);
    const [deskTypeFilter, setDeskTypeFilter] = useState<DeskType | 'all'>('all');
    const [selectedDeskForBooking, setSelectedDeskForBooking] = useState<Desk | null>(null);
    const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<BookingSlot>(BookingSlot.FULL_DAY);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [hideBookedDesks, setHideBookedDesks] = useState(false);
    const [isSeatMapModalOpen, setIsSeatMapModalOpen] = useState(false);

    // Local state for filtered bookings
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isBookingsLoading, setIsBookingsLoading] = useState(false);
    const [releasedDeskIds, setReleasedDeskIds] = useState<number[]>([]);

    const calendarRef = useRef<HTMLDivElement>(null);

    // Initialize selected location
    useEffect(() => {
        if (locations.length > 0 && !selectedLocationId) {
            setSelectedLocationId(locations[0].id);
        }
    }, [locations, selectedLocationId]);

    // Fetch bookings when filters change
    const fetchFilteredBookings = async () => {
        if (!selectedLocationId) return;

        setIsBookingsLoading(true);
        try {
            const [bookingsData, releasesData] = await Promise.all([
                api.fetchBookingsByDateAndLocation(selectedDate, selectedLocationId),
                api.fetchReleasesByDateAndLocation(selectedDate, selectedLocationId)
            ]);
            setBookings(bookingsData);
            setReleasedDeskIds(releasesData);
        } catch (err) {
            console.error("Failed to fetch filtered bookings", err);
        } finally {
            setIsBookingsLoading(false);
        }
    };

    useEffect(() => {
        fetchFilteredBookings();
    }, [selectedLocationId, selectedDate]);


    // Close calendar on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredDesks = useMemo(() => {
        if (!selectedLocationId) return [];
        return desks
            .map(desk => {
                 const isReleased = releasedDeskIds.includes(desk.id);
                 if (isReleased) {
                     return { ...desk, isReserved: false };
                 }
                 return desk;
            })
            .filter(desk => {
                const locationMatch = desk.locationId === selectedLocationId;
                const typeMatch = deskTypeFilter === 'all' || desk.type === deskTypeFilter;

                if (!locationMatch || !typeMatch) return false;

                if (hideBookedDesks) {
                    const deskBookings = bookings.filter(b => b.deskId === desk.id && b.date === selectedDate);
                    const isMorningBooked = deskBookings.some(b => b.slot === BookingSlot.MORNING || b.slot === BookingSlot.FULL_DAY);
                    const isAfternoonBooked = deskBookings.some(b => b.slot === BookingSlot.AFTERNOON || b.slot === BookingSlot.FULL_DAY);

                    if (selectedSlot === BookingSlot.FULL_DAY) {
                        if (isMorningBooked || isAfternoonBooked) return false;
                    } else if (selectedSlot === BookingSlot.MORNING) {
                        if (isMorningBooked) return false;
                    } else if (selectedSlot === BookingSlot.AFTERNOON) {
                        if (isAfternoonBooked) return false;
                    }
                    if (desk.isReserved) return false;
                }
                return true;
            });
    }, [desks, selectedLocationId, deskTypeFilter, hideBookedDesks, bookings, selectedDate, selectedSlot, releasedDeskIds]);

    const handleSelectDesk = (desk: Desk, slot?: BookingSlot) => {
        setSelectedDeskForBooking(desk);
        setSelectedSlotForBooking(slot || selectedSlot);
    };
    const handleCloseModal = () => setSelectedDeskForBooking(null);

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setIsCalendarOpen(false);
    };

    const handleConfirmBooking = async (slotToBook: BookingSlot, staffId: string) => {
        if (!selectedDeskForBooking) return;
        try {
            await api.createBooking(selectedDeskForBooking, selectedDate, slotToBook, staffId);
            // Refresh local bookings instead of global
            await fetchFilteredBookings();
            handleCloseModal();
        } catch (err: any) {
            alert(err.message || 'An unknown error occurred.');
        }
    };

    const handleClearFilters = () => {
        if (locations.length > 0) setSelectedLocationId(locations[0].id);
        setSelectedDate(getTodayString());
        setSelectedSlot(BookingSlot.FULL_DAY);
        setDeskTypeFilter('all');
        setHideBookedDesks(false);
    };

    const selectedLocation = locations.find(l => l.id === selectedLocationId);

    const availableSlotsForModal = useMemo(() => {
        if (!selectedDeskForBooking) return [];
        const deskBookings = bookings.filter(b => b.deskId === selectedDeskForBooking.id && b.date === selectedDate);

        const isMorningBooked = deskBookings.some(b => b.slot === BookingSlot.MORNING || b.slot === BookingSlot.FULL_DAY);
        const isAfternoonBooked = deskBookings.some(b => b.slot === BookingSlot.AFTERNOON || b.slot === BookingSlot.FULL_DAY);

        const slots: BookingSlot[] = [];
        if (!isMorningBooked) slots.push(BookingSlot.MORNING);
        if (!isAfternoonBooked) slots.push(BookingSlot.AFTERNOON);
        if (!isMorningBooked && !isAfternoonBooked) slots.push(BookingSlot.FULL_DAY);

        return slots;
    }, [selectedDeskForBooking, bookings, selectedDate]);

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 items-end">
                    {/* Location Selector */}
                    <div className="space-y-2">
                        <label htmlFor="location-select" className="flex items-center text-sm font-medium text-slate-600">
                            <LocationIcon className="w-5 h-5 mr-2 text-slate-400" />
                            Location
                        </label>
                        <select
                            id="location-select"
                            value={selectedLocationId ?? ''}
                            onChange={(e) => setSelectedLocationId(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            disabled={globalLoading || isBookingsLoading || locations.length === 0}
                        >
                            {selectedLocationId === null ? (
                                <option value="" disabled>
                                    {(globalLoading || isBookingsLoading) ? 'Loading locations...' : 'No locations available'}
                                </option>
                            ) : (
                                locations.map(location => (
                                    <option key={location.id} value={location.id}>{location.name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-2 relative lg:col-span-2" ref={calendarRef}>
                        <label htmlFor="date-picker-button" className="flex items-center text-sm font-medium text-slate-600">
                            <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />
                            Date
                        </label>
                        <button
                            id="date-picker-button"
                            type="button"
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className="w-full text-left p-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </button>
                        {isCalendarOpen && (
                            <div className="absolute top-full mt-2 z-10">
                                <Calendar
                                    selectedDate={selectedDate}
                                    onDateSelect={handleDateSelect}
                                    minDate={getTodayString()}
                                />
                            </div>
                        )}
                    </div>

                    {/* Slot Selector */}
                    <div className="space-y-2">
                        <label htmlFor="slot-select" className="flex items-center text-sm font-medium text-slate-600">
                            <ClockIcon className="w-5 h-5 mr-2 text-slate-400" />
                            Time Slot
                        </label>
                        <select
                            id="slot-select"
                            value={selectedSlot}
                            onChange={(e) => setSelectedSlot(e.target.value as BookingSlot)}
                            className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            {Object.values(BookingSlot).map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>

                    {/* Desk Type Filter */}
                    <div className="space-y-2">
                        <label htmlFor="type-filter" className="flex items-center text-sm font-medium text-slate-600">
                            <FilterIcon className="w-5 h-5 mr-2 text-slate-400" />
                            Desk Type
                        </label>
                        <select
                            id="type-filter"
                            value={deskTypeFilter}
                            onChange={(e) => setDeskTypeFilter(e.target.value as DeskType | 'all')}
                            className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <option value="all">All Types</option>
                            {Object.values(DeskType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Hide Booked */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-slate-600 invisible" aria-hidden="true">Hide</label>
                        <label className="flex items-center space-x-2 cursor-pointer text-slate-600 h-10">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-indigo-600 rounded bg-gray-100 border-gray-300 focus:ring-indigo-500"
                                checked={hideBookedDesks}
                                onChange={(e) => setHideBookedDesks(e.target.checked)}
                            />
                            <span className="text-sm font-medium">Hide Booked</span>
                        </label>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-slate-600 invisible" aria-hidden="true">Clear</label>
                        <button
                            onClick={handleClearFilters}
                            className="w-full flex items-center justify-center p-2 border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-medium"
                            aria-label="Clear all filters"
                        >
                            <RefreshCwIcon className="w-4 h-4 mr-2 text-slate-500" />
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {(globalLoading || isBookingsLoading) ? (
                <div className="text-center py-16">
                    <p className="text-lg font-semibold text-slate-700">Loading desks...</p>
                </div>
            ) : globalError ? (
                <div className="text-center py-16 bg-red-50 text-red-700 rounded-lg">
                    <p className="font-semibold">{globalError}</p>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-2xl font-bold text-slate-800">Available Desks</h2>
                        {selectedLocation?.seatMapUrl && (
                            <button
                                onClick={() => setIsSeatMapModalOpen(true)}
                                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-semibold hover:bg-indigo-100 transition flex items-center shadow-sm border border-indigo-200"
                            >
                                <img src={selectedLocation.seatMapUrl} className="w-4 h-4 mr-2 object-cover rounded-sm" />
                                Show Seat Map
                            </button>
                        )}
                    </div>
                    <p className="text-slate-600 mb-6">
                        Showing desks for {selectedLocation?.name} on {new Date(selectedDate + 'T00:00:00').toDateString()} for {selectedSlot}.
                    </p>

                    {/* Seat Map Modal */}
                    {isSeatMapModalOpen && selectedLocation?.seatMapUrl && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="text-lg font-bold text-slate-800">{selectedLocation.name} - Office Seat Map</h3>
                                    <div className="flex items-center space-x-4">
                                        <a
                                            href={selectedLocation.seatMapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center transition"
                                        >
                                            View Full Size
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                        <button
                                            onClick={() => setIsSeatMapModalOpen(false)}
                                            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-100/30 overflow-auto flex justify-center items-center" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                    <img
                                        src={selectedLocation.seatMapUrl}
                                        alt={`${selectedLocation.name} Seat Map`}
                                        className="max-w-full h-auto rounded-xl shadow-lg border border-white"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => setIsSeatMapModalOpen(false)}
                                        className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition shadow-lg shadow-slate-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <DeskLayout
                        desks={filteredDesks}
                        bookings={bookings}
                        selectedDate={selectedDate}
                        selectedSlot={selectedSlot}
                        onSelectDesk={handleSelectDesk}
                        currentUserId={currentUser?.id || ''}
                    />
                </div>
            )}

            <BookingModal
                desk={selectedDeskForBooking}
                selectedDate={selectedDate}
                selectedSlot={selectedSlotForBooking}
                availableSlots={availableSlotsForModal}
                staffMembers={staffMembers}
                onClose={handleCloseModal}
                onConfirm={handleConfirmBooking}
            />
        </>
    );
};

export default BookingScreen;
