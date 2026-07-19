/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { getHebrewDateInfo } from '../utils/hebrewCalendar';
import { CalendarEvent } from '../types';
import { CATEGORY_DETAILS } from '../utils/mockData';

interface WeeklyViewProps {
  currentDate: Date;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  events: CalendarEvent[];
  onAddEvent: (hour: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onScheduleTaskDrop: (taskId: string, hour: string, dateStr: string) => void;
  onSwipe: (direction: 'next' | 'prev') => void;
}

const DAYS_HEBREW_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const DAYS_HEBREW_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  currentDate,
  selectedDate,
  setSelectedDate,
  events,
  onAddEvent,
  onEditEvent,
  onScheduleTaskDrop,
  onSwipe
}) => {
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null);

  // Get Sunday of the current week
  const getDaysOfWeek = (date: Date): Date[] => {
    const d = new Date(date);
    const day = d.getDay(); // 0 is Sunday, 6 is Saturday
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - day);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(sunday);
      nextDay.setDate(sunday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  const weekDays = getDaysOfWeek(currentDate);

  // Check if dates are the same (ignoring time)
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  // Convert Date to YYYY-MM-DD for event filtering
  const toISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter events for a given day
  const getEventsForDay = (day: Date) => {
    const dateStr = toISODate(day);
    return events.filter(e => {
      if (e.isMultiDay && e.endDate) {
        return dateStr >= e.date && dateStr <= e.endDate;
      }
      return e.date === dateStr;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleAddEventForDay = (day: Date, hour: string = '10:00') => {
    setSelectedDate(day);
    onAddEvent(hour);
  };

  return (
    <div className="w-full flex-1 flex flex-col select-none p-2 sm:p-4 bg-[#FCFAF5]/30 font-serif" id="weekly-view-container">
      {/* Swipeable Grid Container - Strict 7 Columns on Mobile & Desktop */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={(_, info) => {
          const threshold = 50;
          if (info.offset.x > threshold) {
            onSwipe('next'); // Swipe right -> goes to next week
          } else if (info.offset.x < -threshold) {
            onSwipe('prev'); // Swipe left -> goes to previous week
          }
        }}
        className="active:cursor-grabbing cursor-grab flex-1 grid grid-cols-7 gap-1 sm:gap-3 overflow-y-auto"
        id="weekly-days-grid"
      >
        {weekDays.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const dateStr = toISODate(day);
          const dateInfo = getHebrewDateInfo(day);
          const dayEvents = getEventsForDay(day);
          const isBeingDraggedOver = draggedOverDate === dateStr;

          return (
            <div
              key={idx}
              id={`week-day-column-${idx}`}
              onClick={() => setSelectedDate(day)}
              onDragOver={(e) => {
                e.preventDefault();
                setDraggedOverDate(dateStr);
              }}
              onDragLeave={() => {
                setDraggedOverDate(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDraggedOverDate(null);
                const taskId = e.dataTransfer.getData('text/plain');
                if (taskId) {
                  onScheduleTaskDrop(taskId, '10:00', dateStr);
                }
              }}
              className={`flex flex-col rounded-xl sm:rounded-2xl border transition-all duration-200 p-1 sm:p-2.5 min-h-[140px] sm:min-h-[180px] select-none text-right relative group ${
                isSelected
                  ? 'border-[#9A6F75] bg-[#FFFFFF] shadow-xs ring-1 ring-[#9A6F75]/30'
                  : 'border-[#E4E2DB]/80 bg-[#FFFFFF] hover:border-[#9A6F75]/40'
              } ${isBeingDraggedOver ? 'bg-[#EDF6ED] border-[#D2EAD2] ring-2 ring-[#446F44]/20' : ''} ${
                day.getDay() === 6 ? 'bg-[#EDF6ED]/20 border-[#D2EAD2]/50' : ''
              }`}
            >
              {/* Day Header */}
              <div className="flex items-start justify-between border-b border-[#E4E2DB]/50 pb-1 mb-1.5">
                <div className="flex flex-col leading-none">
                  {/* Full day name on desktop, abbreviation on mobile */}
                  <span className={`text-[9px] sm:text-[11px] font-bold ${
                    isSelected ? 'text-[#9A6F75] font-black' : 'text-[#74726B]'
                  }`}>
                    <span className="hidden sm:inline">{DAYS_HEBREW_FULL[idx]}</span>
                    <span className="sm:hidden">{DAYS_HEBREW_SHORT[idx]}</span>
                  </span>
                  {/* Hebrew day representation */}
                  <span className="text-[7.5px] sm:text-[9px] font-bold text-[#74726B]/80 mt-0.5">
                    {dateInfo.hebrewDayStr}
                  </span>
                </div>

                {/* Gregorian Date Circle */}
                <div className="flex items-center gap-1">
                  <span className={`w-4.5 h-4.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black leading-none ${
                    isToday
                      ? 'bg-[#9A6F75] text-[#FFFFFF]'
                      : isSelected
                        ? 'bg-[#FDF0F2] text-[#9A6F75]'
                        : 'text-[#32312D]'
                  }`}>
                    {day.getDate()}
                  </span>

                  {/* Add Event Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddEventForDay(day);
                    }}
                    className="p-0.5 sm:p-1 hover:bg-[#F4F3EF] rounded-lg text-[#74726B] hover:text-[#9A6F75] transition-all duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:block"
                    title="הוספת אירוע ליום זה"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>

              {/* Special Shabbat Banner (only if Shabbat) */}
              {day.getDay() === 6 && (
                <div className="mb-1 p-0.5 sm:p-1 bg-[#EDF6ED] border border-[#D2EAD2] rounded-md sm:rounded-xl text-[7px] sm:text-[8.5px] font-bold text-[#446F44] text-center leading-tight flex flex-col gap-0.5">
                  <span>שבת</span>
                  {dateInfo.parasha && (
                    <span className="text-[6px] sm:text-[8px] font-black text-[#2E542E]">
                      {dateInfo.parasha}
                    </span>
                  )}
                </div>
              )}

              {/* Holiday Badge (if exists) */}
              {dateInfo.holiday && (
                <div className="mb-1 px-1 py-0.5 bg-[#FCECEE] text-[#8B4C56] font-black rounded-md text-[7px] sm:text-[8.5px] border border-[#F4D2D6] text-center truncate leading-none">
                  {dateInfo.holiday.slice(0, 8)}
                </div>
              )}

              {/* Events vertical list - styled to be extremely readable & compact */}
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[140px] sm:max-h-[220px]" id={`events-list-${dateStr}`}>
                {dayEvents.length > 0 ? (
                  dayEvents.map((e) => {
                    const details = CATEGORY_DETAILS[e.category] || CATEGORY_DETAILS.other;
                    return (
                      <div
                        key={e.id}
                        onClick={(evt) => {
                          evt.stopPropagation();
                          onEditEvent(e);
                        }}
                        className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl border text-right transition-all duration-150 cursor-pointer hover:shadow-2xs hover:scale-[1.01] ${details.bg} ${details.border} ${details.text} flex flex-col gap-0.5`}
                      >
                        <span className="font-mono text-[7px] sm:text-[8px] font-bold opacity-80 leading-none">
                          {e.startTime}
                        </span>
                        <p className="text-[7.5px] sm:text-[10px] font-black leading-tight line-clamp-2">
                          {e.title}
                        </p>
                      </div>
                    );
                  })
                ) : null}
              </div>

              {/* Tiny plus button on bottom for touch-friendly add on mobile */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddEventForDay(day);
                }}
                className="w-full mt-1.5 py-0.5 border border-dashed border-[#E4E2DB] hover:border-[#9A6F75]/40 rounded-lg text-[#74726B]/50 hover:text-[#9A6F75] transition-all duration-150 flex items-center justify-center sm:hidden"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
