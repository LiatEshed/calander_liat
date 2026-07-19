/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { CalendarViewType } from '../types';
import { getHebrewYearNumeral } from '../utils/hebrewCalendar';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewType;
  setView: (view: CalendarViewType) => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  setView,
  onNavigate,
  onToday
}) => {
  // Format Gregorian Month
  const formatMonthGregorian = (date: Date) => {
    return date.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
  };

  // Switch labels for Hebrew view buttons
  const viewOptions: { value: CalendarViewType; label: string }[] = [
    { value: 'day', label: 'יום' },
    { value: 'week', label: 'שבוע' },
    { value: 'month', label: 'חודש' },
    { value: 'year', label: 'שנה' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E4E2DB] px-4 py-3 shadow-xs" id="app-header">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top bar: Month Title & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#F4F3EF] rounded-xl text-[#9A6F75] border border-[#E4E2DB]" id="header-logo-icon">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-right">
              <h1 className="text-xl font-serif font-bold text-[#32312D] tracking-tight" id="header-gregorian-title">
                {formatMonthGregorian(currentDate)}
              </h1>
              <span className="text-xs text-[#74726B] font-serif font-medium" id="header-hebrew-title">
                שנת {getHebrewYearNumeral(new Date(currentDate).getFullYear() + 3760)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Date Navigation */}
            <div className="flex items-center gap-1 bg-[#F4F3EF] p-0.5 rounded-xl border border-[#E4E2DB]">
              {/* Prev (Right Arrow in RTL goes back in time) */}
              <button
                id="header-nav-prev"
                onClick={() => onNavigate('prev')}
                className="p-1.5 hover:bg-[#FFFFFF] rounded-lg text-[#32312D] active:scale-95 transition-all duration-150"
                aria-label="הקודם"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                id="header-nav-today"
                onClick={onToday}
                className="px-2.5 py-1 text-xs font-serif font-bold text-[#32312D] hover:bg-[#FFFFFF] rounded-lg active:scale-95 transition-all duration-150"
              >
                היום
              </button>

              {/* Next (Left Arrow in RTL goes forward in time) */}
              <button
                id="header-nav-next"
                onClick={() => onNavigate('next')}
                className="p-1.5 hover:bg-[#FFFFFF] rounded-lg text-[#32312D] active:scale-95 transition-all duration-150"
                aria-label="הבא"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar: View Segmented Control */}
        <div className="flex bg-[#EAE8E2] p-1 rounded-xl border border-[#E4E2DB]" id="header-view-selector">
          {viewOptions.map((opt) => {
            const isActive = view === opt.value;
            return (
              <button
                key={opt.value}
                id={`btn-view-${opt.value}`}
                onClick={() => setView(opt.value)}
                className={`flex-1 text-center py-1.5 text-xs font-serif font-bold rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FFFFFF] text-[#9A6F75] shadow-xs border border-[#E4E2DB]'
                    : 'text-[#74726B] hover:text-[#32312D]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
