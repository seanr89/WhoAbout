import { Location, Desk, Booking, BookingSlot } from '../types';
import { LOCATIONS, DESKS } from '../constants';
import { bookingService } from './bookingService';

const SIMULATED_DELAY = 500; // ms

export const api = {
  fetchLocations: (): Promise<Location[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(LOCATIONS);
      }, SIMULATED_DELAY);
    });
  },

  fetchDesks: (): Promise<Desk[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(DESKS);
      }, SIMULATED_DELAY);
    });
  },

  fetchBookings: async (): Promise<Booking[]> => {
    return await bookingService.getAll();
  },

  createBooking: async (desk: Desk, date: string, slot: BookingSlot): Promise<Booking> => {
    // We don't have the user ID here easily to pass to the service if it needed it,
    // but the service handles the mapping.
    // The API will handle validation.
    return await bookingService.create({
      deskId: desk.id,
      userId: 'current-user', // Placeholder, API might ignore or use context
      date: date,
      slot: slot
    });
  },
};