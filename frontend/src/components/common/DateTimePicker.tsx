import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateTimePickerProps {
  value: string; // ISO string "YYYY-MM-DDTHH:MM"
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  dateOnly?: boolean; // if true, only pick date (no time)
  className?: string;
  minDate?: string; // "YYYY-MM-DD"
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDisplay(value: string, dateOnly: boolean): string {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    if (dateOnly) {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return d.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch {
    return value;
  }
}

function toLocalInput(value: string): { year: number; month: number; day: number; hours: number; minutes: number } {
  const now = new Date();
  if (!value) return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate(), hours: now.getHours(), minutes: now.getMinutes() };
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate(), hours: now.getHours(), minutes: now.getMinutes() };
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate(), hours: d.getHours(), minutes: d.getMinutes() };
  } catch {
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate(), hours: now.getHours(), minutes: now.getMinutes() };
  }
}

function buildIso(year: number, month: number, day: number, hours: number, minutes: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}`;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  required,
  dateOnly = false,
  className = '',
  minDate,
}) => {
  const parsed = toLocalInput(value);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);
  const [selYear, setSelYear] = useState(parsed.year);
  const [selMonth, setSelMonth] = useState(parsed.month);
  const [selDay, setSelDay] = useState(parsed.day);
  const [selHours, setSelHours] = useState(parsed.hours);
  const [selMinutes, setSelMinutes] = useState(parsed.minutes);
  const [step, setStep] = useState<'calendar' | 'time'>('calendar');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state when value changes externally
  useEffect(() => {
    const p = toLocalInput(value);
    setViewYear(p.year);
    setViewMonth(p.month);
    setSelYear(p.year);
    setSelMonth(p.month);
    setSelDay(p.day);
    setSelHours(p.hours);
    setSelMinutes(p.minutes);
  }, [value]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setStep('calendar');
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day: number) => {
    setSelYear(viewYear);
    setSelMonth(viewMonth);
    setSelDay(day);
    if (dateOnly) {
      onChange(buildIso(viewYear, viewMonth, day, 0, 0));
      setOpen(false);
    } else {
      setStep('time');
    }
  };

  const confirmTime = () => {
    onChange(buildIso(selYear, selMonth, selDay, selHours, selMinutes));
    setOpen(false);
    setStep('calendar');
  };

  const isDisabled = (year: number, month: number, day: number): boolean => {
    if (!minDate) return false;
    const candidate = new Date(year, month, day);
    const min = new Date(minDate + 'T00:00:00');
    return candidate < min;
  };

  const isSelected = (day: number) => selDay === day && selMonth === viewMonth && selYear === viewYear;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const calCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const displayText = formatDisplay(value, dateOnly);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setStep('calendar'); }}
        className="w-full flex items-center gap-2.5 bg-slate-950 border border-slate-800 hover:border-brand-500/60 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl px-3 py-2.5 text-xs text-slate-200 transition-all text-left"
      >
        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className={displayText ? 'text-slate-100' : 'text-slate-500'}>
          {displayText || (dateOnly ? 'Select date' : 'Select date & time')}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="ml-auto p-0.5 text-slate-500 hover:text-rose-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-50 top-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          style={{ minWidth: '300px', left: 0 }}>

          {step === 'calendar' && (
            <div className="p-4 space-y-3">
              {/* Month/Year Navigation */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <select
                    value={viewMonth}
                    onChange={e => setViewMonth(parseInt(e.target.value))}
                    className="bg-slate-800 border-0 text-xs text-slate-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select
                    value={viewYear}
                    onChange={e => setViewYear(parseInt(e.target.value))}
                    className="bg-slate-800 border-0 text-xs text-slate-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-0.5">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-slate-500 py-1">{d}</div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {calCells.map((day, idx) => (
                  <div key={idx} className="aspect-square flex items-center justify-center">
                    {day !== null ? (
                      <button
                        type="button"
                        disabled={isDisabled(viewYear, viewMonth, day)}
                        onClick={() => selectDay(day)}
                        className={`w-full h-full flex items-center justify-center text-xs font-medium rounded-lg transition-all
                          ${isDisabled(viewYear, viewMonth, day)
                            ? 'text-slate-700 cursor-not-allowed'
                            : isSelected(day)
                            ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                          }`}
                      >
                        {day}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Today shortcut */}
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                  selectDay(now.getDate());
                }}
                className="w-full text-center text-[11px] font-semibold text-brand-400 hover:text-brand-300 py-1 transition-colors"
              >
                Today
              </button>
            </div>
          )}

          {step === 'time' && !dateOnly && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Select Time for {MONTHS[selMonth]} {selDay}, {selYear}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Hour</label>
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {Array.from({ length: 24 }, (_, i) => i).map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSelHours(h)}
                        className={`w-full text-xs py-1.5 rounded-lg transition-all font-medium
                          ${selHours === h ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                      >
                        {String(h).padStart(2, '0')}:00 {h < 12 ? 'AM' : 'PM'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Minute</label>
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelMinutes(m)}
                        className={`w-full text-xs py-1.5 rounded-lg transition-all font-medium
                          ${selMinutes === m ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                      >
                        :{String(m).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('calendar')}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors border border-slate-800"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={confirmTime}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
