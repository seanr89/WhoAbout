import { Location, Desk, Booking, BookingSlot, DeskType } from './types';

export const LOCATIONS: Location[] = [
  { id: 1, name: 'Quantum Headquarters', city: 'San Francisco' },
  { id: 2, name: 'Synergy Tower', city: 'New York' },
  { id: 3, name: 'Innovate Hub', city: 'London' },
];

export const DESKS: Desk[] = [
  // San Francisco
  { id: 'SF-A1', locationId: 1, label: 'A1', type: DeskType.STANDARD },
  { id: 'SF-A2', locationId: 1, label: 'A2', type: DeskType.STANDING },
  { id: 'SF-A3', locationId: 1, label: 'A3', isReserved: true, type: DeskType.STANDARD },
  { id: 'SF-A4', locationId: 1, label: 'A4', type: DeskType.STANDARD },
  { id: 'SF-B1', locationId: 1, label: 'B1', type: DeskType.HIGH_SEAT },
  { id: 'SF-B2', locationId: 1, label: 'B2', type: DeskType.STANDING },
  { id: 'SF-B3', locationId: 1, label: 'B3', type: DeskType.STANDARD },
  { id: 'SF-B4', locationId: 1, label: 'B4', isReserved: true, type: DeskType.STANDING },
  { id: 'SF-C1', locationId: 1, label: 'C1', type: DeskType.MEETING_ROOM },
  { id: 'SF-C2', locationId: 1, label: 'C2', type: DeskType.STANDARD },
  { id: 'SF-C3', locationId: 1, label: 'C3', type: DeskType.STANDING },
  { id: 'SF-C4', locationId: 1, label: 'C4', type: DeskType.HIGH_SEAT },

  // New York
  { id: 'NY-A1', locationId: 2, label: 'A1', type: DeskType.STANDARD },
  { id: 'NY-A2', locationId: 2, label: 'A2', type: DeskType.STANDING },
  { id: 'NY-A3', locationId: 2, label: 'A3', type: DeskType.STANDARD },
  { id: 'NY-B1', locationId: 2, label: 'B1', isReserved: true, type: DeskType.HIGH_SEAT },
  { id: 'NY-B2', locationId: 2, label: 'B2', type: DeskType.STANDARD },
  { id: 'NY-B3', locationId: 2, label: 'B3', type: DeskType.STANDING },
  { id: 'NY-C1', locationId: 2, label: 'C1', type: DeskType.MEETING_ROOM },
  { id: 'NY-C2', locationId: 2, label: 'C2', isReserved: true, type: DeskType.STANDARD },
  { id: 'NY-C3', locationId: 2, label: 'C3', type: DeskType.HIGH_SEAT },

  // London
  { id: 'LDN-1A', locationId: 3, label: '1A', type: DeskType.STANDARD },
  { id: 'LDN-1B', locationId: 3, label: '1B', type: DeskType.STANDING },
  { id: 'LDN-1C', locationId: 3, label: '1C', isReserved: true, type: DeskType.STANDARD },
  { id: 'LDN-2A', locationId: 3, label: '2A', type: DeskType.MEETING_ROOM },
  { id: 'LDN-2B', locationId: 3, label: '2B', type: DeskType.HIGH_SEAT },
  { id: 'LDN-2C', locationId: 3, label: '2C', type: DeskType.STANDING },
];


const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayString = `${year}-${month}-${day}`;

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', deskId: 'SF-A1', userId: 'user2', date: todayString, slot: BookingSlot.MORNING },
  { id: 'b2', deskId: 'SF-B2', userId: 'user3', date: todayString, slot: BookingSlot.FULL_DAY },
  { id: 'b3', deskId: 'NY-A2', userId: 'user4', date: todayString, slot: BookingSlot.AFTERNOON },
];

export const CURRENT_USER_ID = 'user1';