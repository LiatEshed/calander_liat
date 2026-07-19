/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calendar, Check, GripVertical } from 'lucide-react';
import { Task } from '../types';

interface TaskManagerProps {
  selectedDate: Date;
  tasks: Task[];
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenQuickSchedule: (task: Task) => void;
  setIsDraggingTask?: (val: boolean) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  selectedDate,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onOpenQuickSchedule,
  setIsDraggingTask
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Convert Date to ISO date string "YYYY-MM-DD"
  const getISODateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateStr = getISODateString(selectedDate);

  // Filter tasks belonging only to selected date
  const dayTasks = tasks.filter(t => t.date === selectedDateStr);

  // Stats for the progress bar
  const totalCount = dayTasks.length;
  const completedCount = dayTasks.filter(t => t.completed).length;
  const completionPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Filtered day tasks to display
  const filteredTasks = dayTasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim());
    setNewTitle('');
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    if (setIsDraggingTask) {
      setIsDraggingTask(true);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-transparent select-none font-serif text-[#32312D]" id="task-manager-container">
      {/* Title & Stats */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-[#32312D]" id="task-title">
            משימות להיום 📜
          </h2>
          <span className="text-xs font-semibold text-[#74726B] font-serif" id="task-count-text">
            {completedCount} מתוך {totalCount} הושלם
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2.5 bg-[#EAE8E2] rounded-full overflow-hidden" id="task-progress-container">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full bg-[#81A381] rounded-full" // Pastel Greenish for completed progress
            id="task-progress-bar"
          />
        </div>
      </div>

      {/* Task input form */}
      <form onSubmit={handleSubmit} className="flex gap-2" id="task-add-form">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="הוספת משימה חדשה ללוח..."
          className="flex-1 px-4 py-2.5 text-xs border border-[#E4E2DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A6F75] bg-[#FFFFFF] text-right font-bold text-[#32312D] placeholder-[#74726B]/50 shadow-xs"
          id="task-input-field"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="p-2.5 bg-[#9A6F75] hover:bg-[#7E565C] text-white rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:scale-100 shadow-sm"
          id="task-submit-btn"
          aria-label="הוסף משימה"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>
      </form>

      {/* Filters (Segmented control) */}
      <div className="flex bg-[#EAE8E2] p-1 border border-[#E4E2DB] rounded-xl" id="task-filter-bar">
        {(['all', 'active', 'completed'] as const).map((opt) => {
          const isActive = filter === opt;
          const labels = { all: 'הכל', active: 'פעיל', completed: 'הושלם' };
          return (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-[#FFFFFF] text-[#9A6F75] shadow-xs'
                  : 'text-[#74726B] hover:text-[#32312D]'
              }`}
            >
              {labels[opt]}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="flex flex-col gap-2 min-h-[140px]" id="tasks-list">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                id={`task-item-${task.id}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                draggable={!task.completed}
                onDragStart={(e) => {
                  if (!task.completed) {
                    handleDragStart(e, task.id);
                  }
                }}
                onDragEnd={() => {
                  if (setIsDraggingTask) {
                    setIsDraggingTask(false);
                  }
                }}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 group ${
                  task.completed
                    ? 'bg-[#F4F3EF]/40 border-[#E4E2DB]/30 text-[#74726B]/60 cursor-default'
                    : 'bg-[#FFFFFF] border-[#E4E2DB] shadow-xs hover:border-[#9A6F75]/80 hover:shadow-sm cursor-grab active:cursor-grabbing'
                }`}
              >
                {/* Checkbox and Title */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
                      task.completed
                        ? 'bg-[#81A381] border-[#81A381] text-white'
                        : 'border-[#C8C5BB] hover:border-[#81A381]'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                  </button>
                  <span className={`text-xs font-bold truncate ${
                    task.completed ? 'line-through text-[#74726B]/60' : 'text-[#32312D]'
                  }`}>
                    {task.title}
                  </span>
                </div>

                {/* Drag Handle or Schedule button (Right aligned) */}
                <div className="flex items-center gap-1.5 pr-1 shrink-0">
                  {/* Quick Schedule Icon Button (highly visible for touch) */}
                  {!task.completed && (
                    <button
                      type="button"
                      onClick={() => onOpenQuickSchedule(task)}
                      className="p-1.5 text-[#74726B] hover:text-[#9A6F75] hover:bg-[#EAF4F8] rounded-lg active:scale-90 transition-all duration-150"
                      title="שבץ בלוח זמנים"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  )}

                  {/* HTML5 Draggable Handle (always shown in desktop, styled nicely) */}
                  {!task.completed && (
                    <div
                      className="p-1.5 text-[#C8C5BB] group-hover:text-[#74726B] rounded transition-colors"
                      title="גררו את הכרטיס כולו ללוח השעות"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-[#C8C5BB] hover:text-[#AA4A6F] hover:bg-[#FDF1F5] rounded-lg active:scale-90 transition-all duration-150"
                    title="מחק משימה"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
              id="empty-tasks-state"
            >
              <span className="text-3xl mb-1 select-none">📜</span>
              <p className="text-xs font-bold text-[#74726B]/80">אין משימות להצגה כאן</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
