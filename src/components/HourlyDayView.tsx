/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Clock } from 'lucide-react';
import { CalendarEvent } from '../types';
import { CATEGORY_DETAILS } from '../utils/mockData';
import { getHebrewDateInfo } from '../utils/hebrewCalendar';

interface HourlyDayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onAddEvent: (hour: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onScheduleTaskDrop: (taskId: string, hour: string) => void;
  isDraggingTask?: boolean;
}

const HOUR_ROW_HEIGHT = 68; // px

export const HourlyDayView: React.FC<HourlyDayViewProps> = ({
  selectedDate,
  events,
  onAddEvent,
  onEditEvent,
  onScheduleTaskDrop,
  isDraggingTask = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);

  // Custom list of hours: from 08:00 (8 AM) to 01:00 (1 AM)
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1];

  // Helper to map hour and minute to vertical offset in our customized hours timeline
  const getHourOffset = (h: number, m: number): number => {
    if (h >= 8 && h <= 23) {
      return (h - 8) + m / 60;
    }
    if (h === 0) {
      return 16 + m / 60;
    }
    if (h === 1) {
      return 17 + m / 60;
    }
    // Clamp hours outside the display range (2 AM to 7 AM)
    if (h >= 2 && h <= 7) {
      if (h >= 5) {
        return 0; // Clamp morning hours to 8 AM
      } else {
        return 17.99; // Clamp late night hours to 1:59 AM
      }
    }
    return 0;
  };

  // Keep track of current time for the live indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  // Check if selected day is today
  const isTodaySelected = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  // Convert Date to ISO date string "YYYY-MM-DD"
  const getISODateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateStr = getISODateString(selectedDate);

  // Separate multi-day events and standard events for this day
  const dayEvents = events.filter(e => {
    if (e.isMultiDay && e.endDate) {
      return selectedDateStr >= e.date && selectedDateStr <= e.endDate;
    }
    return e.date === selectedDateStr;
  });

  const multiDayEvents = dayEvents.filter(e => e.isMultiDay);
  const hourlyEvents = dayEvents.filter(e => !e.isMultiDay);

  // Scroll to current hour or first event on load
  useEffect(() => {
    if (containerRef.current) {
      let scrollToOffset = 0; // Default morning scroll (8 AM)
      
      if (isTodaySelected()) {
        const currentH = new Date().getHours();
        if (currentH >= 8 || currentH <= 1) {
          scrollToOffset = Math.max(0, getHourOffset(currentH, 0) - 2);
        }
      } else if (hourlyEvents.length > 0) {
        // find earliest event hour
        const earliestOffset = hourlyEvents.reduce((min, e) => {
          const [h, m] = e.startTime.split(':').map(Number);
          const offset = getHourOffset(h, m);
          return offset < min ? offset : min;
        }, 18);
        scrollToOffset = Math.max(0, earliestOffset - 1);
      }

      containerRef.current.scrollTop = scrollToOffset * HOUR_ROW_HEIGHT;
    }
  }, [selectedDateStr]);

  // Calculate current time line top position
  const calculateCurrentTimeTop = () => {
    const hrs = currentTime.getHours();
    const mins = currentTime.getMinutes();
    return getHourOffset(hrs, mins) * HOUR_ROW_HEIGHT;
  };

  // Calculate top and height for event block
  const getEventPosition = (event: CalendarEvent) => {
    const [startH, startM] = event.startTime.split(':').map(Number);
    const [endH, endM] = event.endTime.split(':').map(Number);
    
    const startOffset = getHourOffset(startH, startM);
    let endOffset = getHourOffset(endH, endM);
    
    if (endOffset < startOffset) {
      endOffset = startOffset + 1; // Fallback to 1 hour duration if values are crossed or clamped
    }

    const durationHrs = endOffset - startOffset;

    const top = startOffset * HOUR_ROW_HEIGHT;
    const height = Math.max(34, durationHrs * HOUR_ROW_HEIGHT); // Min 34px height

    return { top, height };
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    setDragOverHour(hour);
  };

  const handleDragLeave = () => {
    setDragOverHour(null);
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    setDragOverHour(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const hourStr = `${String(hour).padStart(2, '0')}:00`;
      onScheduleTaskDrop(taskId, hourStr);
    }
  };

  const selectedDateInfo = getHebrewDateInfo(selectedDate);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FCFAF5]" id="hourly-day-container">
      {/* Day Overview / Hebrew Details */}
      <div className="px-4 py-3 bg-[#FAF3E3] border-b border-[#E6DCBF] flex items-center justify-between" id="day-overview-bar">
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-2">
            <span className="text-base font-serif font-bold text-[#3E3228]" id="overview-day-name">
              {selectedDate.toLocaleDateString('he-IL', { weekday: 'long' })}
            </span>
            <span className="text-xs text-[#736253] font-serif font-semibold" id="overview-gregorian-date">
              ({selectedDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })})
            </span>
          </div>
          <span className="text-xs font-serif font-bold text-[#9A3B26] mt-0.5" id="overview-hebrew-date">
            {selectedDateInfo.hebrewDateStr}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedDateInfo.parasha && (
            <div className="px-2.5 py-1 bg-[#EDF6ED] text-[#446F44] text-xs font-serif font-bold rounded-lg border border-[#D2EAD2]" id="overview-parasha-badge">
              {selectedDateInfo.parasha} 📖
            </div>
          )}
          {selectedDateInfo.holiday && (
            <div className="px-2.5 py-1 bg-[#FCECEE] text-[#8B4C56] text-xs font-serif font-bold rounded-lg border border-[#F4D2D6]" id="overview-holiday-badge">
              {selectedDateInfo.holiday}
            </div>
          )}
        </div>
      </div>

      {/* Multi-day Event Shelf */}
      {multiDayEvents.length > 0 && (
        <div className="px-4 py-2 bg-[#FAF3E3]/60 border-b border-[#E6DCBF] flex flex-col gap-1.5" id="multi-day-events-shelf">
          <span className="text-[10px] font-serif font-bold text-[#736253] tracking-wide uppercase">אירועים מתמשכים וחופשות:</span>
          {multiDayEvents.map(e => {
            const cat = CATEGORY_DETAILS[e.category] || CATEGORY_DETAILS.other;
            return (
              <div
                key={e.id}
                id={`multi-day-${e.id}`}
                onClick={() => onEditEvent(e)}
                className={`py-1.5 px-3 rounded-lg border ${cat.bg} ${cat.border} ${cat.text} text-xs font-serif font-bold shadow-xs cursor-pointer hover:brightness-95 transition-all duration-150 flex items-center justify-between`}
              >
                <span className="truncate">{e.title}</span>
                <span className="text-[10px] font-serif opacity-80">רב-יומי</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Hourly Timeline Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto relative scroll-smooth select-none scrollbar-thin"
        id="hourly-timeline"
      >
        {/* Real-time Indicator Line */}
        {isTodaySelected() && (currentTime.getHours() >= 8 || currentTime.getHours() <= 1) && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: `${calculateCurrentTimeTop()}px` }}
            id="current-time-indicator"
          >
            {/* The Dot on the right in RTL */}
            <div className="w-2.5 h-2.5 bg-[#9A3B26] rounded-full border border-white -mr-1 shadow-xs" />
            {/* The Line stretching to the left */}
            <div className="flex-1 h-0.5 bg-[#9A3B26]/80" />
            <div className="pl-2 bg-[#9A3B26] text-white font-serif font-bold text-[9px] px-1 py-0.5 rounded-l shadow-xs">
              {currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}

        {/* Hour Grid Rows */}
        <div className="w-full relative" id="hour-rows-grid">
          {hours.map((hour) => {
            const hourStr = `${String(hour).padStart(2, '0')}:00`;
            const isDraggingOver = dragOverHour === hour;

            return (
              <div
                key={hour}
                id={`hour-row-${hour}`}
                onDragOver={(e) => handleDragOver(e, hour)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, hour)}
                onClick={() => onAddEvent(hourStr)}
                className={`flex border-b border-[#E6DCBF]/40 cursor-pointer transition-colors duration-150 relative h-[68px] ${
                  isDraggingOver ? 'bg-[#EAECE0]' : 'hover:bg-[#FAF3E3]/20'
                }`}
              >
                {/* Time Column (Right aligned) */}
                <div className="w-14 min-w-14 flex items-start justify-end pr-3 pt-1.5 border-l border-[#E6DCBF]/40 bg-[#FAF6EE]/40 select-none pointer-events-none">
                  <span className="text-xs font-serif font-bold text-[#736253]/80">
                    {hourStr}
                  </span>
                </div>

                {/* Event Area Column - Now cleanly overlays drop targets */}
                <div className="flex-1 relative">
                  {isDraggingOver && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-[#EAECE0]/60 text-[#536042] font-serif font-bold text-xs gap-1.5 border-2 border-dashed border-[#758467] rounded-sm m-0.5 z-10">
                      <Plus className="w-4 h-4 animate-bounce shrink-0" />
                      <span>שחרר כאן לשבוץ ב-{hourStr}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Absolute positioned Events inside the grid */}
          <div className="absolute inset-y-0 right-14 left-0 pointer-events-none" id="timeline-events-container">
            {hourlyEvents.map((event) => {
              const { top, height } = getEventPosition(event);
              const cat = CATEGORY_DETAILS[event.category] || CATEGORY_DETAILS.other;

              return (
                <div
                  key={event.id}
                  id={`event-block-${event.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEvent(event);
                  }}
                  className={`absolute right-1 left-2 rounded-xl border p-2 flex flex-col justify-between shadow-xs cursor-pointer hover:brightness-95 active:scale-[0.99] transition-all duration-150 text-right ${cat.bg} ${cat.border} ${cat.text} ${
                    isDraggingTask ? 'pointer-events-none' : 'pointer-events-auto'
                  }`}
                  style={{
                    top: `${top + 4}px`,
                    height: `${height - 8}px`,
                  }}
                >
                  <div className="flex flex-col gap-0.5 truncate h-full justify-start">
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="font-serif font-bold text-xs truncate leading-tight select-none">
                        {event.title}
                        {event.category === 'other' && event.customCategory && (
                          <span className="text-[10px] font-semibold block opacity-80 font-serif">({event.customCategory})</span>
                        )}
                      </span>
                      <span className="text-[9px] font-bold bg-white/60 px-1 py-0.2 rounded font-mono">
                        {event.startTime}
                      </span>
                    </div>
                    {event.description && height > 55 && (
                      <p className="text-[10px] opacity-90 truncate mt-0.5 font-serif font-medium">
                        {event.description}
                      </p>
                    )}
                  </div>
                  
                  {height > 60 && (
                    <div className="flex items-center gap-1 opacity-80 mt-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px] font-serif leading-none">
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
