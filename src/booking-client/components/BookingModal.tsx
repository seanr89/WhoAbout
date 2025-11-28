import React, { useState, useEffect } from 'react';
import { Desk, BookingSlot } from '../types';
import ChairIcon from './icons/ChairIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';

interface BookingModalProps {
  desk: Desk | null;
  selectedDate: string;
  selectedSlot: BookingSlot;
  onClose: () => void;
  onConfirm: (slotToBook: BookingSlot) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ desk, selectedDate, selectedSlot, onClose, onConfirm }) => {
  if (!desk) return null;

  const [modalSlot, setModalSlot] = useState<BookingSlot>(selectedSlot);

  useEffect(() => {
    // When the modal is re-opened for a new desk or with a new initial slot,
    // reset its internal state to match the prop.
    setModalSlot(selectedSlot);
  }, [selectedSlot, desk]);

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
                <ChairIcon className="w-6 h-6 text-indigo-500 mr-4"/>
                <div>
                    <p className="text-sm text-slate-500">Desk</p>
                    <p className="font-semibold text-slate-700">{desk.label}</p>
                </div>
            </div>
            <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-indigo-500 mr-4"/>
                <div>
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-semibold text-slate-700">{new Date(selectedDate + 'T00:00:00').toDateString()}</p>
                </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
                <label htmlFor="slot-select" className="flex items-center text-sm text-slate-500 mb-2">
                    <ClockIcon className="w-5 h-5 mr-2 text-indigo-500"/>
                    Time
                </label>
                <select
                  id="slot-select"
                  value={modalSlot}
                  onChange={(e) => setModalSlot(e.target.value as BookingSlot)}
                  className="bg-white w-full p-2 border border-slate-300 rounded-md font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {Object.values(BookingSlot).map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
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
            onClick={() => onConfirm(modalSlot)}
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;