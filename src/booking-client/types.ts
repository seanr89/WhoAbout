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
  id: number;
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

export interface StaffRole {
  id: number;
  name: string;
}

export enum Role {
  Employee = 0,
  Manager = 1,
  Admin = 2,
  Owner = 3,
}


export interface StaffMember {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: Role;
}

export interface Booking {
  id: number;
  deskId: number;
  userId: string;
  staffMemberId: string;
  date: string; // YYYY-MM-DD
  slot: BookingSlot;
}

export interface DailyBookingCount {
  date: string;
  count: number;
}