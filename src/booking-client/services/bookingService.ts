import { Booking, BookingSlot } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5191';

interface ApiBooking {
    id: string;
    startTime: string;
    endTime: string;
    bookingType: number;
    deskId: string;
}

export const bookingService = {
    async getAll(): Promise<Booking[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings`);
            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }
            const data: ApiBooking[] = await response.json();

            return data.map(mapApiBookingToClient);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    },

    async create(booking: Omit<Booking, 'id'>): Promise<Booking> {
        const apiBookingRequest = mapClientBookingToApiRequest(booking);

        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiBookingRequest),
        });

        if (!response.ok) {
            throw new Error('Failed to create booking');
        }

        const newBooking: ApiBooking = await response.json();
        return mapApiBookingToClient(newBooking);
    }
};

function mapApiBookingToClient(apiBooking: ApiBooking): Booking {
    return {
        id: apiBooking.id,
        deskId: apiBooking.deskId,
        userId: 'user-placeholder', // The API does not yet return the user ID
        date: apiBooking.startTime.split('T')[0],
        slot: mapBookingTypeToSlot(apiBooking.bookingType),
    };
}

function mapClientBookingToApiRequest(booking: Omit<Booking, 'id'>) {
    const date = new Date(booking.date);
    let startTime = new Date(date);
    let endTime = new Date(date);

    // Default hours based on slot
    if (booking.slot === BookingSlot.MORNING) {
        startTime.setHours(9, 0, 0);
        endTime.setHours(12, 0, 0);
    } else if (booking.slot === BookingSlot.AFTERNOON) {
        startTime.setHours(13, 0, 0);
        endTime.setHours(17, 0, 0);
    } else { // Full Day
        startTime.setHours(9, 0, 0);
        endTime.setHours(17, 0, 0);
    }

    return {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        bookingType: mapSlotToBookingType(booking.slot),
        deskId: booking.deskId,
    };
}

function mapBookingTypeToSlot(type: number): BookingSlot {
    switch (type) {
        case 0: return BookingSlot.MORNING;
        case 1: return BookingSlot.AFTERNOON;
        case 2: return BookingSlot.FULL_DAY;
        default: return BookingSlot.FULL_DAY;
    }
}

function mapSlotToBookingType(slot: BookingSlot): number {
    switch (slot) {
        case BookingSlot.MORNING: return 0;
        case BookingSlot.AFTERNOON: return 1;
        case BookingSlot.FULL_DAY: return 2;
        default: return 2;
    }
}
