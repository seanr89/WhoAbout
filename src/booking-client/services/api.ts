import { Location, Desk, Booking, BookingSlot, StaffMember } from '../types';
import { LOCATIONS, DESKS } from '../constants';
import { bookingService } from './bookingService';

const SIMULATED_DELAY = 500; // ms

export const api = {
  fetchLocations: async (): Promise<Location[]> => {
    return await bookingService.getLocations();
  },

  fetchDesks: async (): Promise<Desk[]> => {
    return await bookingService.getDesks();
  },

  fetchBookings: async (): Promise<Booking[]> => {
    return await bookingService.getAll();
  },

  fetchStaffMembers: async (): Promise<StaffMember[]> => {
    return await bookingService.getStaffMembers();
  },

  createBooking: async (desk: Desk, date: string, slot: BookingSlot, staffMemberId: string): Promise<Booking> => {
    // We don't have the user ID here easily to pass to the service if it needed it,
    // but the service handles the mapping.
    // The API will handle validation.
    return await bookingService.create({
      deskId: desk.id,
      userId: 'current-user', // Placeholder, API might ignore or use context
      staffMemberId: staffMemberId,
      date: date,
      slot: slot
    });
  },
};