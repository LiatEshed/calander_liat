/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { getHebrewDateInfo } from '../utils/hebrewCalendar';
import { CalendarEvent } from '../types';
import { CATEGORY_DETAILS } from '../utils/mockData';

interface MonthlyViewProps {
  currentDate: Date;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  setView: (view: 'day' | 'week' | 'month' | 'year') => void;
  events: CalendarEvent[];
  onSwipe: (direction: 'next' | 'prev') => void;
}

const WEEKDAYS_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const WEEKDAYS_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate,
  selectedDate,
  setSelectedDate,
  setView,
  events,
  onSwipe
}) => {
  // Generate 42 grid days for the month (padded with prev/next month)
  const getGridDays = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    
    // Find Sunday of the first week
    const startDay = new Date(firstDay);
    const dayOffset = firstDay.getDay(); // 0 is Sunday
    startDay.setDate(firstDay.getDate() - dayOffset);
    
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const nextD = new Date(startDay);
      nextD.setDate(startDay.getDate() + i);
      days.push(nextD);
    }
    return days;
  };

  const gridDays = getGridDays(currentDate);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Convert Date to YYYY-MM-DD
  const toISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get events on a specific day
  const getEventsForDay = (day: Date) => {
    const dateStr = toISODate(day);
    return events.filter(e => {
      if (e.isMultiDay && e.endDate) {
        return dateStr >= e.date && dateStr <= e.endDate;
      }
      return e.date === dateStr;
    });
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setView('day'); // Zoom/Scale directly into detailed day view when tapped!
  };

  return (
    <div className="w-full flex-1 flex flex-col p-2 sm:p-4 bg-[#FFFFFF] select-none font-serif" id="monthly-view-container">
      {/* Month Days Header Grid */}
      <div className="grid grid-cols-7 gap-1 border-b border-[#E4E2DB] pb-1.5 sm:pb-2 mb-2 text-center" id="month-headers-grid">
        {WEEKDAYS_FULL.map((day, idx) => (
          <span
            key={idx}
            className="text-[10px] sm:text-[11px] font-bold text-[#74726B] select-none"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{WEEKDAYS_SHORT[idx]}</span>
          </span>
        ))}
      </div>

      {/* Swipeable Grid of days (42 cells) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={(_, info) => {
          const threshold = 50;
          if (info.offset.x > threshold) {
            onSwipe('next'); // Swipe right -> goes to next month
          } else if (info.offset.x < -threshold) {
            onSwipe('prev'); // Swipe left -> goes to previous month
          }
        }}
        className="active:cursor-grabbing cursor-grab grid grid-cols-7 gap-y-1 sm:gap-y-3 gap-x-0.5 sm:gap-x-1.5 flex-1 items-stretch"
        id="month-cells-grid"
      >
        {gridDays.map((day, idx) => {
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);
          const currentM = isCurrentMonth(day);
          const dateInfo = getHebrewDateInfo(day);
          const dayEvents = getEventsForDay(day);

          return (
            <div
              key={idx}
              id={`month-day-cell-${idx}`}
              onClick={() => handleDayClick(day)}
              className={`flex flex-col min-h-[50px] sm:min-h-[65px] p-0.5 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all duration-150 cursor-pointer relative justify-between select-none ${
                selected
                  ? 'border-[#9A6F75] bg-[#EAF4F8]/40 shadow-2xs'
                  : 'border-transparent hover:bg-[#F4F3EF]/20'
              } ${currentM ? '' : 'opacity-35'}`}
            >
              {/* Day numbers top row */}
              <div className="flex justify-between items-start leading-none">
                {/* Gregorian Date */}
                <span className={`text-[10px] sm:text-xs font-bold ${
                  today && !selected 
                    ? 'text-[#9A6F75] bg-[#FDF0F2] px-1 rounded' 
                    : selected 
                      ? 'text-[#9A6F75] font-black' 
                      : 'text-[#32312D]'
                }`}>
                  {day.getDate()}
                </span>

                {/* Hebrew Date Letter */}
                <span className={`text-[7.5px] sm:text-[9px] font-bold ${
                  selected ? 'text-[#9A6F75]' : 'text-[#74726B]'
                }`}>
                  {dateInfo.hebrewDayStr}
                </span>
              </div>

              {/* Friday Candle Lighting */}
              {day.getDay() === 5 && dateInfo.candleLighting && currentM && (
                <div className="text-[6px] sm:text-[7px] text-[#A15B21] bg-[#FFF9E6] rounded px-0.5 py-0.5 text-center mt-0.5 select-none leading-none border border-[#F5DFAB] flex items-center justify-center gap-0.5">
                  <span>🕯️ {dateInfo.candleLighting}</span>
                </div>
              )}

              {/* Special Shabbat label (greenish pastel) */}
              {day.getDay() === 6 && currentM && (
                <div className="text-[6.5px] sm:text-[7.5px] text-[#446F44] font-bold bg-[#EDF6ED] rounded px-0.5 py-0.5 text-center mt-0.5 select-none leading-tight border border-[#D2EAD2] flex flex-col gap-0.5">
                  <span>שבת</span>
                  {dateInfo.parasha && (
                    <span className="text-[5.5px] sm:text-[6.5px] text-[#2E542E] font-black truncate">
                      {dateInfo.parasha}
                    </span>
                  )}
                  {dateInfo.havdalah && (
                    <span className="text-[5.5px] sm:text-[6.5px] text-[#4F4F82] font-semibold truncate leading-none mt-0.5">
                      מוצ״ש: {dateInfo.havdalah}
                    </span>
                  )}
                </div>
              )}

              {/* Non-Friday Candle Lighting (Holiday Eve) */}
              {day.getDay() !== 5 && dateInfo.candleLighting && currentM && (
                <div className="text-[6px] sm:text-[7px] text-[#A15B21] bg-[#FFF9E6] rounded px-0.5 py-0.5 text-center mt-0.5 select-none leading-none border border-[#F5DFAB] flex items-center justify-center gap-0.5">
                  <span>🕯️ {dateInfo.candleLighting}</span>
                </div>
              )}

              {/* Non-Saturday Holiday Ends (Havdalah) */}
              {day.getDay() !== 6 && dateInfo.havdalah && currentM && (
                <div className="text-[6px] sm:text-[7px] text-[#4F4F82] bg-[#ECECF6] rounded px-0.5 py-0.5 text-center mt-0.5 select-none leading-none border border-[#D2D2E6] flex items-center justify-center gap-0.5">
                  <span>🌙 {dateInfo.havdalah}</span>
                </div>
              )}

              {/* Fast times in month cell */}
              {((dateInfo.fastStart || dateInfo.fastEnd) && currentM) && (
                <div className="text-[5.5px] sm:text-[6.5px] text-[#B1511B] bg-[#FFF2EA] rounded px-0.5 py-0.5 text-center mt-0.5 select-none leading-tight border border-[#F5DACB] flex flex-col gap-0.5">
                  {dateInfo.fastStart && (
                    <span className="truncate font-serif">צום: {dateInfo.fastStart}</span>
                  )}
                  {dateInfo.fastEnd && (
                    <span className="truncate font-serif">צאת: {dateInfo.fastEnd}</span>
                  )}
                </div>
              )}

              {/* Holiday label (pinkish pastel) */}
              {dateInfo.holiday && currentM && (
                <div className="text-[6.5px] sm:text-[7.5px] text-[#AA4A6F] font-bold bg-[#FDF1F5] rounded px-0.5 text-center truncate mt-0.5 select-none leading-none border border-[#FBD6E3]">
                  {dateInfo.holiday.slice(0, 8)}
                </div>
              )}

              {/* Event list (small text) */}
              <div className="flex flex-col gap-0.5 mt-1 overflow-hidden" id="month-day-events">
                {dayEvents.slice(0, 2).map((e) => {
                  const details = CATEGORY_DETAILS[e.category] || CATEGORY_DETAILS.other;
                  return (
                    <div
                      key={e.id}
                      className={`text-[7px] sm:text-[8.5px] font-sans font-bold px-0.5 sm:px-1 py-0.2 sm:py-0.5 rounded sm:rounded-md truncate border ${details.bg} ${details.border} ${details.text} leading-none`}
                      title={`${e.startTime} - ${e.title}`}
                    >
                      <span className="font-mono opacity-85 hidden sm:inline pl-0.5">{e.startTime}</span>
                      <span>{e.title}</span>
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <span className="text-[6.5px] sm:text-[8px] font-sans font-bold text-[#74726B] text-center block leading-none mt-0.5">
                    + עוד {dayEvents.length - 2}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
