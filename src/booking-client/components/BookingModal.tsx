import React, { useState, useEffect } from 'react';
import { Desk, BookingSlot, StaffMember } from '../types';
import ChairIcon from './icons/ChairIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';

interface BookingModalProps {
  desk: Desk | null;
  selectedDate: string;
  selectedSlot: BookingSlot;
  availableSlots: BookingSlot[];
  staffMembers: StaffMember[];
  onClose: () => void;
  onConfirm: (slotToBook: BookingSlot, staffMemberId: string) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ desk, selectedDate, selectedSlot, availableSlots, staffMembers, onClose, onConfirm }) => {
  if (!desk) return null;

  const [modalSlot, setModalSlot] = useState<BookingSlot>(selectedSlot);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  useEffect(() => {
    // When the modal is re-opened for a new desk or with a new initial slot,
    // reset its internal state to match the prop.
    setModalSlot(selectedSlot);
    if (staffMembers.length > 0) {
      setSelectedStaffId(staffMembers[0].id);
    }
  }, [selectedSlot, desk, staffMembers]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-11/12 max-w-md m-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-slate-800">Confirm Booking</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none" aria-label="Close modal">&times;</button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center p-4 bg-slate-50 rounded-lg">
            <ChairIcon className="w-6 h-6 text-indigo-500 mr-4" />
            <div>
              <p className="text-sm text-slate-500">Desk</p>
              <p className="font-semibold text-slate-700">{desk.label}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-slate-50 rounded-lg">
            <CalendarIcon className="w-6 h-6 text-indigo-500 mr-4" />
            <div>
              <p className="text-sm text-slate-500">Date</p>
              <p className="font-semibold text-slate-700">{new Date(selectedDate + 'T00:00:00').toDateString()}</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <label htmlFor="slot-select" className="flex items-center text-sm text-slate-500 mb-2">
              <ClockIcon className="w-5 h-5 mr-2 text-indigo-500" />
              Time
            </label>
            <select
              id="slot-select"
              value={modalSlot}
              onChange={(e) => setModalSlot(e.target.value as BookingSlot)}
              className="bg-white w-full p-2 border border-slate-300 rounded-md font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <label htmlFor="staff-select" className="flex items-center text-sm text-slate-500 mb-2">
              <span className="w-5 h-5 mr-2 text-indigo-500 font-bold text-center">@</span>
              Staff Member
            </label>
            <select
              id="staff-select"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="bg-white w-full p-2 border border-slate-300 rounded-md font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              {staffMembers.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md font-semibold hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(modalSlot, selectedStaffId)}
            type="button"
            disabled={!selectedStaffId}
            className={`px-4 py-2 text-white rounded-md font-semibold transition-colors shadow-sm ${!selectedStaffId ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;