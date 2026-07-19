/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalendarEvent, Task } from '../types';

export const INITIAL_EVENTS: CalendarEvent[] = [];

export const INITIAL_TASKS: Task[] = [];

export const CATEGORY_DETAILS = {
  work: {
    label: 'עבודה',
    bg: 'bg-[#EAF4F8]',
    border: 'border-[#CFE2EE]',
    text: 'text-[#3B6E8C]',
    dot: 'bg-[#5D9CB9]',
    badge: 'bg-[#DDEBF5] text-[#2B546C]'
  },
  study: {
    label: 'לימודים',
    bg: 'bg-[#EDF6ED]',
    border: 'border-[#D2EAD2]',
    text: 'text-[#446F44]',
    dot: 'bg-[#64A364]',
    badge: 'bg-[#E1F1E1] text-[#305130]'
  },
  workout: {
    label: 'ספורט ואימון',
    bg: 'bg-[#FDF0F2]',
    border: 'border-[#FAD2D7]',
    text: 'text-[#A05260]',
    dot: 'bg-[#C87A88]',
    badge: 'bg-[#FADDE1] text-[#7A3643]'
  },
  fun: {
    label: 'פנאי ובילוי',
    bg: 'bg-[#F6EEF8]',
    border: 'border-[#EAD3EE]',
    text: 'text-[#7A4B88]',
    dot: 'bg-[#A373B2]',
    badge: 'bg-[#EEDBF2] text-[#593164]'
  },
  grooming: {
    label: 'טיפוח עצמי',
    bg: 'bg-[#FDF1F5]',
    border: 'border-[#FBD6E3]',
    text: 'text-[#AA4A6F]',
    dot: 'bg-[#C67195]',
    badge: 'bg-[#F9DCE7] text-[#812D50]'
  },
  other: {
    label: 'אחר',
    bg: 'bg-[#FAF2EB]',
    border: 'border-[#F4DFCD]',
    text: 'text-[#8E5E35]',
    dot: 'bg-[#B5875F]',
    badge: 'bg-[#F4E6D9] text-[#69411F]'
  }
};
