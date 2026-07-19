/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface YearlyViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  setView: (view: 'day' | 'week' | 'month' | 'year') => void;
}

const GREG_MONTHS_HEBREW = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

// Hebrew months mapped roughly to Gregorian months of 2026 for descriptive secondary titles
const HEBREW_MONTHS_MAPPING = [
  'טבת - שבט', 'שבט - אדר', 'אדר - ניסן', 'ניסן - אייר', 'אייר - סיון', 'סיון - תמוז',
  'תמוז - אב', 'אב - אלול', 'אלול - תשרי', 'תשרי - חשוון', 'חשוון - כסלו', 'כסלו - טבת'
];

export const YearlyView: React.FC<YearlyViewProps> = ({
  currentDate,
  setCurrentDate,
  setView
}) => {
  const currentYear = currentDate.getFullYear();

  const handleMonthClick = (monthIdx: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIdx);
    setCurrentDate(newDate);
    setView('month'); // Switch view to month
  };

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 bg-[#FFFFFF]/50 select-none font-serif" id="yearly-view-container">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Year Label Header */}
        <div className="flex items-center justify-between border-b border-[#E4E2DB] pb-2 mb-2">
          <span className="text-xl font-bold text-[#32312D] tracking-tight">
            שנת {currentYear} 🗓️
          </span>
          <span className="text-xs bg-[#EDF6ED] text-[#446F44] font-bold px-2.5 py-1 rounded-xl border border-[#D2EAD2]">
            תשפ״ו - תשפ״ז
          </span>
        </div>

        {/* 12 Months Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" id="yearly-months-grid">
          {GREG_MONTHS_HEBREW.map((monthName, idx) => {
            const isSelected = currentDate.getMonth() === idx;
            const isCurrentMonth = new Date().getMonth() === idx && new Date().getFullYear() === currentYear;

            return (
              <motion.div
                key={idx}
                id={`year-month-card-${idx}`}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleMonthClick(idx)}
                className={`p-4 rounded-2xl border text-right transition-all duration-200 cursor-pointer flex flex-col gap-2 relative overflow-hidden bg-[#FFFFFF] ${
                  isSelected
                    ? 'border-[#9A6F75] bg-[#EAF4F8]/40 shadow-xs'
                    : 'border-[#E4E2DB] hover:border-[#9A6F75]'
                }`}
              >
                {/* Visual marker for current month */}
                {isCurrentMonth && (
                  <span className="absolute left-3 top-3 w-2 h-2 bg-[#9A6F75] rounded-full" />
                )}

                <div className="flex flex-col">
                  {/* Gregorian Month Name */}
                  <span className={`text-base font-bold ${
                    isSelected ? 'text-[#9A6F75]' : 'text-[#32312D]'
                  }`}>
                    {monthName}
                  </span>
                  {/* Hebrew Months in that period */}
                  <span className="text-[10px] text-[#74726B] font-bold mt-0.5">
                    {HEBREW_MONTHS_MAPPING[idx]}
                  </span>
                </div>

                {/* Minimal mini-calendar layout dots represent days */}
                <div className="grid grid-cols-7 gap-1 mt-2 opacity-30">
                  {Array.from({ length: 28 }).map((_, dIdx) => (
                    <span
                      key={dIdx}
                      className="w-1.5 h-1.5 rounded-full bg-[#C8C5BB]"
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
