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
    bookings: Booking[];
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
    locations, desks, bookings, staffMembers, currentUser, isLoading, error, onRefresh
}) => {
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot>(BookingSlot.FULL_DAY);
    const [deskTypeFilter, setDeskTypeFilter] = useState<DeskType | 'all'>('all');
    const [selectedDeskForBooking, setSelectedDeskForBooking] = useState<Desk | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [hideBookedDesks, setHideBookedDesks] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Initialize selected location
    useEffect(() => {
        if (locations.length > 0 && !selectedLocationId) {
            setSelectedLocationId(locations[0].id);
        }
    }, [locations, selectedLocationId]);

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
        return desks.filter(desk => {
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
    }, [desks, selectedLocationId, deskTypeFilter, hideBookedDesks, bookings, selectedDate, selectedSlot]);

    const handleSelectDesk = (desk: Desk) => setSelectedDeskForBooking(desk);
    const handleCloseModal = () => setSelectedDeskForBooking(null);

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setIsCalendarOpen(false);
    };

    const handleConfirmBooking = async (slotToBook: BookingSlot, staffId: string) => {
        if (!selectedDeskForBooking) return;
        try {
            await api.createBooking(selectedDeskForBooking, selectedDate, slotToBook, staffId);
            onRefresh(); // Refresh parent data
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
    };

    const selectedLocation = locations.find(l => l.id === selectedLocationId);

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
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
                            disabled={isLoading || locations.length === 0}
                        >
                            {selectedLocationId === null ? (
                                <option value="" disabled>
                                    {isLoading ? 'Loading locations...' : 'No locations available'}
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

            {isLoading ? (
                <div className="text-center py-16">
                    <p className="text-lg font-semibold text-slate-700">Loading desks...</p>
                </div>
            ) : error ? (
                <div className="text-center py-16 bg-red-50 text-red-700 rounded-lg">
                    <p className="font-semibold">{error}</p>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-2xl font-bold text-slate-800">Available Desks</h2>
                        <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-indigo-600 rounded bg-gray-100 border-gray-300 focus:ring-indigo-500"
                                checked={hideBookedDesks}
                                onChange={(e) => setHideBookedDesks(e.target.checked)}
                            />
                            <span className="text-sm font-medium">Hide Booked</span>
                        </label>
                    </div>
                    <p className="text-slate-600 mb-6">
                        Showing desks for {selectedLocation?.name} on {new Date(selectedDate + 'T00:00:00').toDateString()} for {selectedSlot}.
                    </p>
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
                selectedSlot={selectedSlot}
                staffMembers={staffMembers}
                onClose={handleCloseModal}
                onConfirm={handleConfirmBooking}
            />
        </>
    );
};

export default BookingScreen;
