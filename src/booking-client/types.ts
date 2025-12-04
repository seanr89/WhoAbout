export interface Location {
  id: string;
  name: string;
  city: string;
}

export enum DeskType {
  STANDARD = 'Standard',
  STANDING = 'Standing',
  HIGH_SEAT = 'High Seat',
  MEETING_ROOM = 'Meeting Room',
}

export interface Desk {
  id: string;
  locationId: string;
  label: string;
  type: DeskType;
  isReserved?: boolean;
  reservedForStaffMemberId?: string;
}

export enum BookingSlot {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  FULL_DAY = 'Full Day',
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  deskId: string;
  userId: string;
  staffMemberId: string;
  date: string; // YYYY-MM-DD
  slot: BookingSlot;
}

export interface DailyBookingCount {
  date: string;
  count: number;
}