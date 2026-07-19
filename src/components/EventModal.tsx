/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, AlignRight, Trash2 } from 'lucide-react';
import { CalendarEvent, EventCategory } from '../types';
import { CATEGORY_DETAILS } from '../utils/mockData';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    date: string;
    category: EventCategory;
    customCategory?: string;
    isMultiDay: boolean;
    endDate?: string;
  }) => void;
  onDelete?: (id: string) => void;
  editingEvent: CalendarEvent | null;
  defaultDate: Date;
  defaultStartTime: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingEvent,
  defaultDate,
  defaultStartTime
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<EventCategory>('work');
  const [customCategory, setCustomCategory] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [endDate, setEndDate] = useState('');

  // Format date to "YYYY-MM-DD"
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Populate form fields on edit or default
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setDate(editingEvent.date);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setCategory(editingEvent.category);
      setCustomCategory(editingEvent.customCategory || '');
      setIsMultiDay(editingEvent.isMultiDay || false);
      setEndDate(editingEvent.endDate || editingEvent.date);
    } else {
      setTitle('');
      setDescription('');
      setDate(formatDate(defaultDate));
      setStartTime(defaultStartTime || '09:00');
      
      // Default end time to 1 hour after start
      if (defaultStartTime) {
        const [h, m] = defaultStartTime.split(':').map(Number);
        const nextH = String((h + 1) % 24).padStart(2, '0');
        setEndTime(`${nextH}:${String(m).padStart(2, '0')}`);
      } else {
        setEndTime('10:00');
      }
      
      setCategory('work');
      setCustomCategory('');
      setIsMultiDay(false);
      setEndDate(formatDate(defaultDate));
    }
  }, [editingEvent, isOpen, defaultDate, defaultStartTime]);

  // Handle Start Time Change -> Dynamic default end time set to +1 hour
  const handleStartTimeChange = (newVal: string) => {
    setStartTime(newVal);
    if (!newVal) return;
    const [h, m] = newVal.split(':').map(Number);
    const nextH = String((h + 1) % 24).padStart(2, '0');
    const minStr = String(m).padStart(2, '0');
    setEndTime(`${nextH}:${minStr}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date,
      startTime: isMultiDay ? '00:00' : startTime,
      endTime: isMultiDay ? '23:59' : endTime,
      category,
      customCategory: category === 'other' ? customCategory.trim() : undefined,
      isMultiDay,
      endDate: isMultiDay ? endDate : undefined
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-serif" id="modal-wrapper" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#32312D]/40 backdrop-blur-xs"
            id="modal-backdrop"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md max-h-[95vh] overflow-y-auto bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E4E2DB] relative z-10 text-right scrollbar-thin"
            id="modal-card"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-[#F4F3EF] border-b border-[#E4E2DB] flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-1.5 text-[#74726B] hover:text-[#32312D] hover:bg-[#EAE8E2] rounded-lg active:scale-90 transition-all duration-150"
              >
                <X className="w-4.5 h-4.5" />
              </button>
              <h3 className="text-sm font-bold text-[#32312D]">
                {editingEvent ? 'עריכת אירוע 🗓️' : 'הוספת אירוע חדש 🗓️'}
              </h3>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
              {/* Event Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#74726B] uppercase tracking-wide">שם האירוע</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="למשל: פגישת עדכון, טיפוח פנים, קניות..."
                  className="w-full px-3 py-2 text-xs border border-[#E4E2DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A6F75] bg-[#FFFFFF] text-[#32312D] font-bold"
                />
              </div>

              {/* Category Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#74726B] uppercase tracking-wide">קטגוריה</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(CATEGORY_DETAILS) as EventCategory[]).map((catKey) => {
                    const cat = CATEGORY_DETAILS[catKey];
                    const isSel = category === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setCategory(catKey)}
                        className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all duration-150 ${
                          isSel
                            ? `${cat.bg} ${cat.border} ${cat.text} shadow-xs font-black`
                            : 'border-[#E4E2DB] bg-[#FFFFFF] text-[#74726B] hover:bg-[#F4F3EF]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Category Input if "Other" category is chosen */}
              {category === 'other' && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-1"
                >
                  <label className="text-[10px] font-bold text-[#9A6F75] uppercase tracking-wide">קטגוריה אחרת (הקלדה ידנית)</label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="הקלידו את שם הקטגוריה..."
                    className="w-full px-3 py-2 text-xs border border-[#9A6F75]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A6F75] bg-[#FFFFFF] text-[#32312D] font-bold"
                  />
                </motion.div>
              )}

              {/* Multi-day toggle */}
              <div className="flex items-center justify-between p-2.5 bg-[#F4F3EF]/40 rounded-xl border border-[#E4E2DB]/50">
                <span className="text-xs font-bold text-[#32312D]">אירוע מתמשך / חופשה 🏖️</span>
                <button
                  type="button"
                  onClick={() => setIsMultiDay(!isMultiDay)}
                  className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none ${
                    isMultiDay ? 'bg-[#9A6F75]' : 'bg-[#EAE8E2]'
                  }`}
                >
                  <motion.span
                    layout
                    className="w-5 h-5 bg-[#FFFFFF] rounded-full shadow-sm"
                    animate={{ x: isMultiDay ? -16 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-3">
                {isMultiDay ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#74726B] uppercase tracking-wide flex items-center gap-1 justify-end">תאריך התחלה <Calendar className="w-3 h-3" /></label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-[#E4E2DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A6F75] bg-[#FFFFFF] text-[#32312D] font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#74726B] uppercase tracking-wide flex items-center gap-1 justify-end">תאריך סיום <Calendar className="w-3 h-3" /></label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-[#E4E2DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A6F75] bg-[#FFFFFF] text-[#32312D] font-semibold"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#74726B] uppercase tracking-wide flex items-center gap-1 justify-end">תאריך האירוע <Calendar className="w-3 h-3" /></label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#E4E2DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A6F75] bg-[#FFFFFF] text-[#32312D] font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Hour Inputs (Only if not multi-day) */}
              {!isMultiDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#74726B] uppercase tracking-wide flex items-center gap-1 justify-end">שעת התחלה <Clock className="w-3 h-3" /></label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#E4E2DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A6F75] bg-[#FFFFFF] text-[#32312D] font-mono font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#74726B] uppercase tracking-wide flex items-center gap-1 justify-end">שעת סיום <Clock className="w-3 h-3" /></label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-[#E4E2DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A6F75] bg-[#FFFFFF] text-[#32312D] font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#74726B] uppercase tracking-wide flex items-center gap-1 justify-end">תיאור ופרטים נוספים <AlignRight className="w-3 h-3" /></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="הערות קצרות, מיקום או מטרות..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-[#E4E2DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A6F75] bg-[#FFFFFF] text-[#32312D] text-right resize-none font-semibold"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2">
                {editingEvent && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(editingEvent.id);
                      onClose();
                    }}
                    className="p-2.5 border border-[#FAD2D7] text-[#AA4A6F] rounded-xl hover:bg-[#FDF1F5] active:scale-95 transition-all duration-150 flex items-center gap-1 text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>מחק</span>
                  </button>
                )}
                
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#9A6F75] hover:bg-[#7E565C] text-white rounded-xl active:scale-95 text-xs font-bold transition-all duration-150 shadow-md shadow-[#9A6F75]/10"
                >
                  {editingEvent ? 'שמור שינויים' : 'צור אירוע'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
