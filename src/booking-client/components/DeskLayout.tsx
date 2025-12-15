import React from 'react';
import { Desk, Booking, BookingSlot } from '../types';
import ChairIcon from './icons/ChairIcon';
import DeskTypeIcon from './icons/DeskTypeIcon';

// ... (imports remain the same)

interface DeskCardProps {
  desk: Desk;
  selectedSlot: BookingSlot;
  morningBooking?: Booking;
  afternoonBooking?: Booking;
  onBook: (desk: Desk, slot?: BookingSlot) => void;
  currentUserId: string;
}

const DeskCard: React.FC<DeskCardProps> = ({ desk, selectedSlot, morningBooking, afternoonBooking, onBook, currentUserId }) => {
  if (desk.isReserved) {
    return (
      <div className="bg-slate-200 text-slate-500 rounded-lg p-3 text-center cursor-not-allowed relative">
        <div className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full" title="Fully booked or permanently reserved" aria-label="Fully booked or permanently reserved"></div>
        <p className="font-bold">{desk.label}</p>
        <div className="flex items-center justify-center text-xs text-slate-500 mt-1">
          <DeskTypeIcon type={desk.type} className="w-4 h-4 mr-1" />
          <span>{desk.type}</span>
        </div>
        <p className="text-xs mt-2">Permanently Reserved</p>
      </div>
    );
  }

  const isMorningBooked = !!morningBooking;
  const isAfternoonBooked = !!afternoonBooking;
  const isMorningBookedByMe = morningBooking?.userId === currentUserId || morningBooking?.staffMemberId === currentUserId;
  const isAfternoonBookedByMe = afternoonBooking?.userId === currentUserId || afternoonBooking?.staffMemberId === currentUserId;

  // Check if at least one slot is available for the card to be interactive
  const isBookable = !isMorningBooked || !isAfternoonBooked;

  const cardClasses = isBookable
    ? 'bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer'
    : 'bg-slate-100 text-slate-400 cursor-not-allowed';

  const getSlotClasses = (booked: boolean, byMe: boolean): string => {
    if (byMe) return 'bg-indigo-500 text-white border-indigo-500';
    if (booked) return 'bg-rose-500 text-white border-rose-500';
    return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
  }

  let availabilityStatus: 'available' | 'partially' | 'booked';
  let availabilityTitle: string;

  if (isMorningBooked && isAfternoonBooked) {
    availabilityStatus = 'booked';
    availabilityTitle = 'Fully booked for the day';
  } else if (isMorningBooked || isAfternoonBooked) {
    availabilityStatus = 'partially';
    availabilityTitle = 'Partially booked for the day';
  } else {
    availabilityStatus = 'available';
    availabilityTitle = 'Available all day';
  }

  const statusIndicatorClasses = {
    available: 'bg-green-500',
    partially: 'bg-orange-400',
    booked: 'bg-rose-500',
  };

  const handleCardClick = () => {
    if (!isBookable) return;

    // Determine the smart default slot if clicking the card body
    let slotToBook = selectedSlot;

    // If Full Day is selected but one slot is taken, default to the available one
    if (selectedSlot === BookingSlot.FULL_DAY) {
      if (isMorningBooked && !isAfternoonBooked) {
        slotToBook = BookingSlot.AFTERNOON;
      } else if (!isMorningBooked && isAfternoonBooked) {
        slotToBook = BookingSlot.MORNING;
      }
    }

    onBook(desk, slotToBook);
  };

  return (
    <div
      className={`rounded-lg p-4 flex flex-col items-center justify-center border relative ${cardClasses}`}
      onClick={handleCardClick}
    >
      <div
        className={`absolute top-2 right-2 w-3 h-3 rounded-full ${statusIndicatorClasses[availabilityStatus]}`}
        title={availabilityTitle}
        aria-label={availabilityTitle}
      ></div>
      <ChairIcon className={`w-8 h-8 mb-2 ${isBookable ? 'text-slate-600' : 'text-slate-400'}`} />
      <p className="font-bold text-lg">{desk.label}</p>
      <div className="flex items-center text-xs text-slate-500 mt-1">
        <DeskTypeIcon type={desk.type} className="w-4 h-4 mr-1" />
        <span>{desk.type}</span>
      </div>
      <div className="flex space-x-2 mt-3 text-xs font-semibold">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isMorningBooked) onBook(desk, BookingSlot.MORNING);
          }}
          disabled={isMorningBooked}
          className={`px-2 py-1 rounded border ${getSlotClasses(isMorningBooked, isMorningBookedByMe)} ${!isMorningBooked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        >
          AM
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isAfternoonBooked) onBook(desk, BookingSlot.AFTERNOON);
          }}
          disabled={isAfternoonBooked}
          className={`px-2 py-1 rounded border ${getSlotClasses(isAfternoonBooked, isAfternoonBookedByMe)} ${!isAfternoonBooked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        >
          PM
        </button>
      </div>
    </div>
  );
};

interface DeskLayoutProps {
  desks: Desk[];
  bookings: Booking[];
  selectedDate: string;
  selectedSlot: BookingSlot;
  onSelectDesk: (desk: Desk, slot?: BookingSlot) => void;
  currentUserId: string;
}

const DeskLayout: React.FC<DeskLayoutProps> = ({ desks, bookings, selectedDate, selectedSlot, onSelectDesk, currentUserId }) => {
  if (desks.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-slate-700">No Desks Found</h3>
        <p className="text-slate-500 mt-2">Try adjusting your filters or selecting a different location.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {desks.map((desk) => {
        const deskBookings = bookings.filter(b => b.deskId === desk.id && b.date === selectedDate);
        const morningBooking = deskBookings.find(b => b.slot === BookingSlot.MORNING || b.slot === BookingSlot.FULL_DAY);
        const afternoonBooking = deskBookings.find(b => b.slot === BookingSlot.AFTERNOON || b.slot === BookingSlot.FULL_DAY);

        return (
          <DeskCard
            key={desk.id}
            desk={desk}
            selectedSlot={selectedSlot}
            morningBooking={morningBooking}
            afternoonBooking={afternoonBooking}
            onBook={onSelectDesk}
            currentUserId={currentUserId}
          />
        );
      })}
    </div>
  );
};

export default DeskLayout;