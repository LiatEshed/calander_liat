/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CalendarViewType = 'day' | 'week' | 'month' | 'year';

export type EventCategory = 'work' | 'study' | 'workout' | 'fun' | 'grooming' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  date: string;      // "YYYY-MM-DD"
  category: EventCategory;
  customCategory?: string; // For 'other' custom category name
  isMultiDay?: boolean;
  endDate?: string;  // For multi-day events: "YYYY-MM-DD"
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string;      // "YYYY-MM-DD" (associated date, usually today or target)
}

export interface HebrewDateInfo {
  gregorianDate: Date;
  hebrewDateStr: string;
  hebrewMonth: string;
  hebrewDayStr: string;
  hebrewYearStr: string;
  isShabbat: boolean;
  parasha?: string;
  holiday?: string;
  candleLighting?: string;
  havdalah?: string;
  fastStart?: string;
  fastEnd?: string;
}
