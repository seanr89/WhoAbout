import React, { useState } from 'react';
import { Booking, Desk, Location } from '../types';
import ChairIcon from './icons/ChairIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';

interface BookingDetailsModalProps {
    booking: Booking;
    desk: Desk | null;
    location: Location | null;
    onClose: () => void;
    onCancel: (bookingId: number) => Promise<void>;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
    booking,
    desk,
    location,
    onClose,
    onCancel
}) => {
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            setIsCancelling(true);
            try {
                await onCancel(booking.id);
                onClose();
            } catch (error) {
                console.error('Failed to cancel booking', error);
                setIsCancelling(false);
            }
        }
    };

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
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Booking Details</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                        <ChairIcon className="w-6 h-6 text-indigo-500 mr-4" />
                        <div>
                            <p className="text-sm text-slate-500">Desk</p>
                            <p className="font-semibold text-slate-700">
                                {desk ? desk.label : `Desk ${booking.deskId}`}
                            </p>
                            {desk && (
                                <p className="text-xs text-slate-500">{desk.type}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                        <svg className="w-6 h-6 text-indigo-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                            <p className="text-sm text-slate-500">Location</p>
                            <p className="font-semibold text-slate-700">
                                {location ? location.name : 'Unknown Location'}
                            </p>
                            {location && (
                                <p className="text-xs text-slate-500">{location.city}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                        <CalendarIcon className="w-6 h-6 text-indigo-500 mr-4" />
                        <div>
                            <p className="text-sm text-slate-500">Date</p>
                            <p className="font-semibold text-slate-700">
                                {new Date(booking.date).toLocaleDateString('en-GB', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                        <ClockIcon className="w-6 h-6 text-indigo-500 mr-4" />
                        <div>
                            <p className="text-sm text-slate-500">Time Slot</p>
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full mt-1">
                                {booking.slot}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold hover:bg-slate-200 transition-colors"
                        disabled={isCancelling}
                    >
                        Close
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md font-semibold hover:bg-red-100 transition-colors flex items-center"
                    >
                        {isCancelling ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cancelling...
                            </>
                        ) : (
                            'Cancel Booking'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsModal;
