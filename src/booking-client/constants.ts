import { Location, Desk, Booking, BookingSlot, DeskType } from './types';

export const LOCATIONS: Location[] = [
  { id: '1', name: 'Quantum Headquarters', city: 'San Francisco' },
  { id: '2', name: 'Synergy Tower', city: 'New York' },
  { id: '3', name: 'Innovate Hub', city: 'London' },
];

export const DESKS: Desk[] = [
  // San Francisco
  { id: 1, locationId: '1', label: 'A1', type: DeskType.STANDARD },
  { id: 2, locationId: '1', label: 'A2', type: DeskType.STANDING },
  { id: 3, locationId: '1', label: 'A3', isReserved: true, type: DeskType.STANDARD },
  { id: 4, locationId: '1', label: 'A4', type: DeskType.STANDARD },
  { id: 5, locationId: '1', label: 'B1', type: DeskType.HIGH_SEAT },
  { id: 6, locationId: '1', label: 'B2', type: DeskType.STANDING },
  { id: 7, locationId: '1', label: 'B3', type: DeskType.STANDARD },
  { id: 8, locationId: '1', label: 'B4', isReserved: true, type: DeskType.STANDING },
  { id: 9, locationId: '1', label: 'C1', type: DeskType.MEETING_ROOM },
  { id: 10, locationId: '1', label: 'C2', type: DeskType.STANDARD },
  { id: 11, locationId: '1', label: 'C3', type: DeskType.STANDING },
  { id: 12, locationId: '1', label: 'C4', type: DeskType.HIGH_SEAT },

  // New York
  { id: 13, locationId: '2', label: 'A1', type: DeskType.STANDARD },
  { id: 14, locationId: '2', label: 'A2', type: DeskType.STANDING },
  { id: 15, locationId: '2', label: 'A3', type: DeskType.STANDARD },
  { id: 16, locationId: '2', label: 'B1', isReserved: true, type: DeskType.HIGH_SEAT },
  { id: 17, locationId: '2', label: 'B2', type: DeskType.STANDARD },
  { id: 18, locationId: '2', label: 'B3', type: DeskType.STANDING },
  { id: 19, locationId: '2', label: 'C1', type: DeskType.MEETING_ROOM },
  { id: 20, locationId: '2', label: 'C2', isReserved: true, type: DeskType.STANDARD },
  { id: 21, locationId: '2', label: 'C3', type: DeskType.HIGH_SEAT },

  // London
  { id: 22, locationId: '3', label: '1A', type: DeskType.STANDARD },
  { id: 23, locationId: '3', label: '1B', type: DeskType.STANDING },
  { id: 24, locationId: '3', label: '1C', isReserved: true, type: DeskType.STANDARD },
  { id: 25, locationId: '3', label: '2A', type: DeskType.MEETING_ROOM },
  { id: 26, locationId: '3', label: '2B', type: DeskType.HIGH_SEAT },
  { id: 27, locationId: '3', label: '2C', type: DeskType.STANDING },
];

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayString = `${year}-${month}-${day}`;

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 1, deskId: 1, userId: 'user2', staffMemberId: 'staff2', date: todayString, slot: BookingSlot.MORNING },
  { id: 2, deskId: 6, userId: 'user3', staffMemberId: 'staff3', date: todayString, slot: BookingSlot.FULL_DAY },
  { id: 3, deskId: 14, userId: 'user4', staffMemberId: 'staff4', date: todayString, slot: BookingSlot.AFTERNOON },
];
