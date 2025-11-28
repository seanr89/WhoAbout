import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/ChevronIcons';

interface CalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  minDate: string; // YYYY-MM-DD
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, minDate }) => {
  const [displayDate, setDisplayDate] = useState(new Date(selectedDate + 'T00:00:00'));

  useEffect(() => {
    // Sync display date with the selectedDate prop to avoid inconsistencies.
    // We add time zone offset to avoid date shifting issues.
    setDisplayDate(new Date(selectedDate + 'T00:00:00'));
  }, [selectedDate]);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const formatDateToString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl p-4 border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100" aria-label="Previous month">
          <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
        </button>
        <div className="font-bold text-slate-800">
          {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100" aria-label="Next month">
          <ChevronRightIcon className="w-5 h-5 text-slate-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-slate-500 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {leadingBlanks.map(blank => <div key={`blank-${blank}`}></div>)}
        {days.map(day => {
          const dayDate = new Date(year, month, day);
          const dayString = formatDateToString(dayDate);
          const isSelected = dayString === selectedDate;
          const isDisabled = dayString < minDate;

          const buttonClasses = [
            'w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors',
            isSelected ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-700',
            isDisabled ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-indigo-100',
            !isSelected && !isDisabled ? 'font-medium' : '',
          ].join(' ');

          return (
            <button
              key={day}
              onClick={() => !isDisabled && onDateSelect(dayString)}
              className={buttonClasses}
              disabled={isDisabled}
              aria-pressed={isSelected}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;