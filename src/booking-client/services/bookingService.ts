import { Booking, BookingSlot, Location, Desk, DeskType, StaffMember } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface ApiBooking {
    id: string;
    bookingDate: string;
    bookingType: number;
    status: number;
    deskId: string;
    staffMemberId: string;
}

interface ApiOffice {
    id: string;
    name: string;
    location: string;
}

interface ApiDesk {
    id: string;
    name: string;
    type: number;
    officeId: string;
}

interface ApiStaffMember {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
}

export const bookingService = {
    async getLocations(): Promise<Location[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/offices`);
            if (!response.ok) throw new Error('Failed to fetch offices');
            const data: ApiOffice[] = await response.json();
            return data.map(mapApiOfficeToLocation);
        } catch (error) {
            console.error('Error fetching locations:', error);
            return [];
        }
    },

    async getDesks(): Promise<Desk[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/desks`);
            if (!response.ok) throw new Error('Failed to fetch desks');
            const data: ApiDesk[] = await response.json();
            return data.map(mapApiDeskToDesk);
        } catch (error) {
            console.error('Error fetching desks:', error);
            return [];
        }
    },

    async getStaffMembers(): Promise<StaffMember[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/staffmembers`);
            if (!response.ok) throw new Error('Failed to fetch staff members');
            const data: ApiStaffMember[] = await response.json();
            return data.map(mapApiStaffToStaff);
        } catch (error) {
            console.error('Error fetching staff members:', error);
            return [];
        }
    },

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
        staffMemberId: apiBooking.staffMemberId,
        date: apiBooking.bookingDate.split('T')[0],
        slot: mapBookingTypeToSlot(apiBooking.bookingType),
    };
}

function mapClientBookingToApiRequest(booking: Omit<Booking, 'id'>) {
    return {
        bookingDate: new Date(booking.date).toISOString(),
        bookingType: mapSlotToBookingType(booking.slot),
        status: 0, // Requested
        deskId: booking.deskId,
        staffMemberId: booking.staffMemberId,
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

function mapApiOfficeToLocation(apiOffice: ApiOffice): Location {
    return {
        id: apiOffice.id,
        name: apiOffice.name,
        city: apiOffice.location,
    };
}

function mapApiDeskToDesk(apiDesk: ApiDesk): Desk {
    return {
        id: apiDesk.id,
        locationId: apiDesk.officeId,
        label: apiDesk.name,
        type: mapIntToDeskType(apiDesk.type),
    };
}

function mapIntToDeskType(type: number): DeskType {
    switch (type) {
        case 0: return DeskType.STANDARD;
        case 1: return DeskType.STANDING;
        case 2: return DeskType.HIGH_SEAT;
        case 3: return DeskType.MEETING_ROOM;
        default: return DeskType.STANDARD;
    }
}

function mapApiStaffToStaff(apiStaff: ApiStaffMember): StaffMember {
    return {
        id: apiStaff.id,
        name: apiStaff.name,
        email: apiStaff.email,
        isActive: apiStaff.isActive,
    };
}
