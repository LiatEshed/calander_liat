/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarViewType, CalendarEvent, Task } from './types';
import { INITIAL_EVENTS, INITIAL_TASKS } from './utils/mockData';

// Components
import { CalendarHeader } from './components/CalendarHeader';
import { WeeklyView } from './components/WeeklyView';
import { MonthlyView } from './components/MonthlyView';
import { YearlyView } from './components/YearlyView';
import { HourlyDayView } from './components/HourlyDayView';
import { TaskManager } from './components/TaskManager';
import { EventModal } from './components/EventModal';

export default function App() {
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return new Date();
  });
  const [view, setView] = useState<CalendarViewType>('week');
  const [isDraggingTask, setIsDraggingTask] = useState(false);

  // Load from local storage or fall back to mock seeds
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('cal_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('cal_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [modalDefaultStartTime, setModalDefaultStartTime] = useState('09:00');
  const [taskBeingScheduled, setTaskBeingScheduled] = useState<Task | null>(null);

  // --- AUTO-RESET ON DEPLOY / VERSION FOR A CLEAN SLATE ---
  useEffect(() => {
    // If the user's localStorage contains old seed events (e.g. e1, or old Hebrew text),
    // we force-clear it once so she gets a clean empty slate to insert her own.
    const savedEvents = localStorage.getItem('cal_events');
    const isOldSeed = savedEvents && (savedEvents.includes('"id":"e1"') || savedEvents.includes('ישיבת צוות'));
    if (isOldSeed || !savedEvents) {
      setEvents([]);
      setTasks([]);
      localStorage.setItem('cal_events', JSON.stringify([]));
      localStorage.setItem('cal_tasks', JSON.stringify([]));
    }
  }, []);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('cal_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('cal_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- DATA CLEARING HANDLER ---
  const handleClearAllData = () => {
    if (window.confirm('האם את בטוחה שברצונך לרוקן את כל האירועים והמשימות מהלוח?')) {
      setEvents([]);
      setTasks([]);
      localStorage.setItem('cal_events', JSON.stringify([]));
      localStorage.setItem('cal_tasks', JSON.stringify([]));
    }
  };

  // --- NAVIGATION ---
  const handleNavigate = (direction: 'next' | 'prev') => {
    const amount = direction === 'next' ? 1 : -1;
    const newDate = new Date(currentDate);

    if (view === 'day') {
      newDate.setDate(newDate.getDate() + amount);
      setCurrentDate(newDate);
      setSelectedDate(newDate);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + amount * 7);
      setCurrentDate(newDate);
      
      // Keep selected date aligned with the same weekday on the new week
      const newSelected = new Date(selectedDate);
      newSelected.setDate(newSelected.getDate() + amount * 7);
      setSelectedDate(newSelected);
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + amount);
      setCurrentDate(newDate);
      
      // Select first day of new month
      const newSelected = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      setSelectedDate(newSelected);
    } else if (view === 'year') {
      newDate.setFullYear(newDate.getFullYear() + amount);
      setCurrentDate(newDate);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // --- WORKFLOW HANDLERS ---
  const handleAddEventClick = (hour: string) => {
    setEditingEvent(null);
    setTaskBeingScheduled(null);
    setModalDefaultStartTime(hour);
    setIsEventModalOpen(true);
  };

  const handleEditEventClick = (event: CalendarEvent) => {
    setTaskBeingScheduled(null);
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = (data: {
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    category: any;
    customCategory?: string;
    isMultiDay: boolean;
    endDate?: string;
  }) => {
    if (editingEvent) {
      // Edit mode
      setEvents(prev =>
        prev.map(e => (e.id === editingEvent.id ? { ...e, ...data } : e))
      );
    } else {
      // Add mode
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        ...data
      };
      setEvents(prev => [...prev, newEvent]);

      // If scheduled via the Quick Task Schedule
      if (taskBeingScheduled) {
        setTaskBeingScheduled(null);
      }
    }
    setIsEventModalOpen(false);
  };

  const handleEventDelete = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setIsEventModalOpen(false);
  };

  // Drag and drop task directly onto the hourly calendar timeline
  const handleScheduleTaskDrop = (taskId: string, hourStr: string, targetDateStr?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Calculate end time (1 hour duration)
    const [h, m] = hourStr.split(':').map(Number);
    const endH = String((h + 1) % 24).padStart(2, '0');
    const endM = String(m).padStart(2, '0');
    const endHourStr = `${endH}:${endM}`;

    // Format date string
    const dateStr = targetDateStr || task.date;

    const newEvent: CalendarEvent = {
      id: `event-drag-${Date.now()}`,
      title: `📌 ${task.title}`,
      startTime: hourStr,
      endTime: endHourStr,
      date: dateStr,
      category: 'work' // default category
    };

    setEvents(prev => [...prev, newEvent]);
  };

  // Quick schedule via button tap (excellent for mobile)
  const handleOpenQuickSchedule = (task: Task) => {
    setTaskBeingScheduled(task);
    setEditingEvent(null);
    setModalDefaultStartTime('10:00'); // default convenient hour
    setIsEventModalOpen(true);
  };

  // Task list controls
  const handleAddTask = (title: string) => {
    // Format date string to "YYYY-MM-DD"
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      date: dateStr
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F4F3EF] text-[#32312D] flex flex-col font-sans select-none antialiased pb-6"
      id="app-root-container"
    >
      {/* Top sticky header */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        setView={setView}
        onNavigate={handleNavigate}
        onToday={handleToday}
      />

      {/* Main Grid Content */}
      <main className={`max-w-7xl w-full mx-auto px-4 mt-4 flex-1 flex flex-col gap-6 ${view === 'day' ? 'md:grid md:grid-cols-12 md:items-start' : ''}`} id="app-main-layout">
        
        {/* RIGHT COLUMN: Calendar View (Detailed day, week, month, year) */}
        <section className={`${view === 'day' ? 'md:col-span-8' : 'w-full'} flex flex-col bg-[#FFFFFF] rounded-3xl border border-[#E4E2DB] shadow-xs overflow-hidden min-h-[500px]`} id="calendar-view-column">
          {/* Dynamic Render of Selected View with smooth slide animations */}
          <div className="flex-1 flex flex-col relative min-h-0" id="active-view-viewport">
            <AnimatePresence mode="wait">
              <motion.div
                key={view + currentDate.getTime()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex-1 flex flex-col min-h-0"
              >
                {view === 'day' && (
                  <HourlyDayView
                    selectedDate={selectedDate}
                    events={events}
                    onAddEvent={handleAddEventClick}
                    onEditEvent={handleEditEventClick}
                    onScheduleTaskDrop={handleScheduleTaskDrop}
                    isDraggingTask={isDraggingTask}
                  />
                )}

                {view === 'week' && (
                  <WeeklyView
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    events={events}
                    onAddEvent={handleAddEventClick}
                    onEditEvent={handleEditEventClick}
                    onScheduleTaskDrop={handleScheduleTaskDrop}
                    onSwipe={handleNavigate}
                  />
                )}

                {view === 'month' && (
                  <MonthlyView
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    setView={setView}
                    events={events}
                    onSwipe={handleNavigate}
                  />
                )}

                {view === 'year' && (
                  <YearlyView
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    setView={setView}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* LEFT COLUMN: Daily Task Manager (Checklist, completion stats, drag handles) - ONLY rendered in 'day' view */}
        {view === 'day' && (
          <section className="md:col-span-4 bg-[#FFFFFF] rounded-3xl border border-[#E4E2DB] shadow-xs overflow-hidden" id="tasks-column">
            <TaskManager
              selectedDate={selectedDate}
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onOpenQuickSchedule={handleOpenQuickSchedule}
              setIsDraggingTask={setIsDraggingTask}
            />
          </section>
        )}

      </main>

      {/* Persistent Event Creation Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setTaskBeingScheduled(null);
        }}
        onSubmit={handleEventSubmit}
        onDelete={handleEventDelete}
        editingEvent={editingEvent}
        defaultDate={selectedDate}
        defaultStartTime={modalDefaultStartTime}
      />
    </div>
  );
}
