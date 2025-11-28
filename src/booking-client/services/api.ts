import { Location, Desk, Booking, BookingSlot } from '../types';
import { LOCATIONS, DESKS, INITIAL_BOOKINGS, CURRENT_USER_ID } from '../constants';

// Simulate a database/backend store
let bookingsStore: Booking[] = [...INITIAL_BOOKINGS];

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

  fetchBookings: (): Promise<Booking[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(bookingsStore);
      }, SIMULATED_DELAY);
    });
  },

  createBooking: (desk: Desk, date: string, slot: BookingSlot): Promise<Booking> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 1. Check for desk conflicts
        const isDeskConflict = bookingsStore.some(b => 
            b.deskId === desk.id &&
            b.date === date &&
            (
                b.slot === BookingSlot.FULL_DAY ||
                slot === BookingSlot.FULL_DAY ||
                b.slot === slot
            )
        );

        if (isDeskConflict) {
            return reject(new Error('This desk is already booked for the selected time.'));
        }

        // 2. Check for user conflicts (double booking)
        const isUserConflict = bookingsStore.some(b => 
            b.userId === CURRENT_USER_ID &&
            b.date === date &&
            (
                b.slot === BookingSlot.FULL_DAY || // User already has a full-day booking
                slot === BookingSlot.FULL_DAY ||   // User is trying to book a full day over another booking
                b.slot === slot                     // User already has a booking in the same slot
            )
        );
        
        if (isUserConflict) {
            return reject(new Error('You already have a booking for this time slot on this day.'));
        }

        const newBooking: Booking = {
          id: `b${bookingsStore.length + 1}-${Date.now()}`,
          deskId: desk.id,
          userId: CURRENT_USER_ID,
          date: date,
          slot: slot,
        };

        bookingsStore = [...bookingsStore, newBooking];
        resolve(newBooking);
      }, SIMULATED_DELAY);
    });
  },
};