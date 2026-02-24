import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, X, Calendar } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CalendarBooking {
  id: string;
  experience: string;
  experienceImage: string;
  guestName: string;
  guestCount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  startTime: string;
  endTime: string;
  date: string; // YYYY-MM-DD
  price: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const experiences = [
  { name: 'Sunset Kayak Tour', image: 'https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=200&q=80', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { name: 'Wine Tasting Experience', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&q=80', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { name: 'Yoga at Dawn', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80', color: 'bg-green-100 border-green-300 text-green-800' },
  { name: 'Cooking Class', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&q=80', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { name: 'Spa Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80', color: 'bg-pink-100 border-pink-300 text-pink-800' },
  { name: 'Bike Tour', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&q=80', color: 'bg-amber-100 border-amber-300 text-amber-800' },
  { name: 'Surf Lesson', image: 'https://images.unsplash.com/photo-1502680390548-bdbac40e4a9f?w=200&q=80', color: 'bg-cyan-100 border-cyan-300 text-cyan-800' },
  { name: 'Fado Night', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&q=80', color: 'bg-red-100 border-red-300 text-red-800' },
  { name: 'Sailing Trip', image: 'https://images.unsplash.com/photo-1534854638093-bada1813ca19?w=200&q=80', color: 'bg-sky-100 border-sky-300 text-sky-800' },
  { name: 'Private Chef Dinner', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80', color: 'bg-rose-100 border-rose-300 text-rose-800' },
];

const guestNames = [
  'Sophia Marks', 'Arturo Madsen', 'Katherine Roundabelle', 'Jaydon Koepp',
  'Emma Smith', 'Liam Johnson', 'Olivia Williams', 'Noah Brown',
  'Ava Garcia', 'Ethan Martinez', 'Isabella Lopez', 'Mason Davis',
  'Mia Rodriguez', 'James Wilson', 'Charlotte Anderson', 'Benjamin Thomas',
  'Amelia Taylor', 'Lucas Moore', 'Harper Jackson', 'Henry Martin',
  'Evelyn Lee', 'Alexander Perez', 'Abigail Thompson', 'Sebastian White',
];

const timeSlots = [
  { start: '07:00', end: '08:30' }, { start: '08:00', end: '09:30' },
  { start: '09:00', end: '11:00' }, { start: '09:30', end: '10:30' },
  { start: '10:00', end: '12:00' }, { start: '10:30', end: '11:30' },
  { start: '11:00', end: '13:00' }, { start: '14:00', end: '16:00' },
  { start: '14:30', end: '15:30' }, { start: '15:00', end: '17:00' },
  { start: '16:00', end: '18:00' }, { start: '17:00', end: '18:30' },
  { start: '17:30', end: '19:00' }, { start: '18:00', end: '20:00' },
  { start: '19:00', end: '21:00' }, { start: '19:30', end: '22:00' },
  { start: '20:00', end: '22:30' },
];

// Seeded random for consistent data across renders
const seededRandom = (seed: number) => {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
};

const generateBookingsForMonth = (year: number, month: number): CalendarBooking[] => {
  const bookings: CalendarBooking[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rng = seededRandom(year * 100 + month);
  let id = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const numBookings = Math.floor(rng() * (isWeekend ? 5 : 3)) + (isWeekend ? 2 : 0);

    for (let i = 0; i < numBookings; i++) {
      const exp = experiences[Math.floor(rng() * experiences.length)];
      const slot = timeSlots[Math.floor(rng() * timeSlots.length)];
      const guest = guestNames[Math.floor(rng() * guestNames.length)];
      const roll = rng();
      bookings.push({
        id: `bk-${year}-${month}-${id++}`,
        experience: exp.name,
        experienceImage: exp.image,
        guestName: guest,
        guestCount: Math.floor(rng() * 4) + 1,
        status: roll < 0.7 ? 'confirmed' : roll < 0.92 ? 'pending' : 'cancelled',
        startTime: slot.start,
        endTime: slot.end,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        price: Math.floor(rng() * 200 + 30),
      });
    }
  }
  return bookings;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getMonthGrid = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: { day: number; inMonth: boolean; date: string }[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    cells.push({ day: d, inMonth: false, date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month + 2 > 12 ? 1 : month + 2;
    const y = month + 2 > 12 ? year + 1 : year;
    cells.push({ day: d, inMonth: false, date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  return cells;
};

const getExpColor = (name: string) => experiences.find(e => e.name === name)?.color || 'bg-gray-100 border-gray-300 text-gray-800';

const statusBadge = (s: string) => {
  if (s === 'confirmed') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (s === 'pending') return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-red-50 text-red-700 border border-red-200';
};

const statusDot = (s: string) => s === 'confirmed' ? 'bg-emerald-500' : s === 'pending' ? 'bg-amber-500' : 'bg-red-400';

// ─── Component ───────────────────────────────────────────────────────────────

export const CalendarView: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const bookings = useMemo(() => generateBookingsForMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {};
    bookings.forEach(b => { if (!map[b.date]) map[b.date] = []; map[b.date].push(b); });
    Object.values(map).forEach(arr => arr.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [bookings]);

  const grid = useMemo(() => getMonthGrid(currentYear, currentMonth), [currentYear, currentMonth]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return [];
    const day = bookingsByDate[selectedDate] || [];
    return filterStatus === 'all' ? day : day.filter(b => b.status === filterStatus);
  }, [selectedDate, bookingsByDate, filterStatus]);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navigateMonth = (dir: -1 | 1) => {
    let m = currentMonth + dir, y = currentYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCurrentMonth(m); setCurrentYear(y); setSelectedDate(null);
  };

  const navigateWeek = (dir: -1 | 1) => {
    const ref = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
    const next = new Date(ref);
    next.setDate(ref.getDate() + dir * 7);
    const newDate = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
    // Update month/year if the week crosses into a different month
    if (next.getMonth() !== currentMonth || next.getFullYear() !== currentYear) {
      setCurrentMonth(next.getMonth());
      setCurrentYear(next.getFullYear());
    }
    setSelectedDate(newDate);
  };

  const navigate = (dir: -1 | 1) => viewMode === 'week' ? navigateWeek(dir) : navigateMonth(dir);

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(todayStr);
  };

  const monthStats = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const revenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.price, 0);
    const guests = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.guestCount, 0);
    const exps = new Set(bookings.map(b => b.experience)).size;
    return { total: bookings.length, confirmed, pending, revenue, guests, exps };
  }, [bookings]);

  // Week view
  const getWeekDates = () => {
    const ref = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
    const dow = ref.getDay();
    const mon = new Date(ref);
    mon.setDate(ref.getDate() - ((dow + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
  };
  const weekDates = viewMode === 'week' ? getWeekDates() : [];
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  return (
    <div className="max-w-[1400px] mx-auto px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-bored-black mb-2">Calendar</h1>
        <p className="text-sm text-bored-gray-500">View and manage all your experience bookings</p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-bored-gray-200 p-5">
          <p className="text-xs text-bored-gray-500 uppercase tracking-wide mb-1">Total bookings</p>
          <p className="text-2xl font-light text-bored-black">{monthStats.total}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-emerald-600">{monthStats.confirmed} confirmed</span>
            <span className="text-xs text-amber-600">{monthStats.pending} pending</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-bored-gray-200 p-5">
          <p className="text-xs text-bored-gray-500 uppercase tracking-wide mb-1">Revenue</p>
          <p className="text-2xl font-light text-bored-black">€{monthStats.revenue.toLocaleString()}</p>
          <p className="text-xs text-bored-gray-400 mt-2">Excl. cancelled</p>
        </div>
        <div className="bg-white rounded-2xl border border-bored-gray-200 p-5">
          <p className="text-xs text-bored-gray-500 uppercase tracking-wide mb-1">Total guests</p>
          <p className="text-2xl font-light text-bored-black">{monthStats.guests}</p>
          <p className="text-xs text-bored-gray-400 mt-2">Across all bookings</p>
        </div>
        <div className="bg-white rounded-2xl border border-bored-gray-200 p-5">
          <p className="text-xs text-bored-gray-500 uppercase tracking-wide mb-1">Experiences</p>
          <p className="text-2xl font-light text-bored-black">{monthStats.exps}</p>
          <p className="text-xs text-bored-gray-400 mt-2">Active this month</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-bored-gray-200 p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-bored-gray-100 rounded-xl transition-colors"><ChevronLeft size={18} /></button>
          <h2 className="text-lg font-semibold text-bored-black min-w-[200px] text-center">
            {viewMode === 'week' && selectedDate
              ? (() => {
                  const ref = new Date(selectedDate + 'T00:00:00');
                  const dow = ref.getDay();
                  const mon = new Date(ref); mon.setDate(ref.getDate() - ((dow + 6) % 7));
                  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
                  return `${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                })()
              : monthName
            }
          </h2>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-bored-gray-100 rounded-xl transition-colors"><ChevronRight size={18} /></button>
          <button onClick={goToToday} className="ml-2 px-4 py-1.5 text-sm font-medium bg-bored-gray-50 hover:bg-bored-gray-100 rounded-lg transition-colors">Today</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'month' ? 'bg-bored-black text-white' : 'text-bored-gray-600 hover:bg-bored-gray-100'}`}>Month</button>
          <button onClick={() => { setViewMode('week'); if (!selectedDate) setSelectedDate(todayStr); }} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'week' ? 'bg-bored-black text-white' : 'text-bored-gray-600 hover:bg-bored-gray-100'}`}>Week</button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ─── MONTH VIEW ───────────────────────────────────────── */}
        {viewMode === 'month' && (
          <div className={`${selectedDate ? 'flex-1' : 'w-full'} transition-all`}>
            <div className="bg-white rounded-2xl border border-bored-gray-200 overflow-hidden">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 border-b border-bored-gray-100">
                {WEEKDAYS.map(d => (
                  <div key={d} className="py-3 text-center">
                    <span className="text-xs font-semibold text-bored-gray-500 uppercase tracking-wide">{d}</span>
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7">
                {grid.map((cell, idx) => {
                  const dayBookings = bookingsByDate[cell.date] || [];
                  const isToday = cell.date === todayStr;
                  const isSelected = cell.date === selectedDate;
                  const confirmedN = dayBookings.filter(b => b.status === 'confirmed').length;
                  const pendingN = dayBookings.filter(b => b.status === 'pending').length;

                  return (
                    <button
                      key={idx}
                      onClick={() => cell.inMonth && setSelectedDate(isSelected ? null : cell.date)}
                      className={`relative min-h-[100px] p-2 border-b border-r border-bored-gray-100 text-left transition-all
                        ${cell.inMonth ? 'hover:bg-bored-gray-50 cursor-pointer' : 'opacity-30 cursor-default'}
                        ${isSelected ? 'bg-bored-neon/5 ring-2 ring-inset ring-bored-neon/40' : ''}
                        ${isToday && !isSelected ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                          ${isToday ? 'bg-bored-black text-white' : cell.inMonth ? 'text-bored-gray-800' : 'text-bored-gray-300'}`}>
                          {cell.day}
                        </span>
                        {dayBookings.length > 0 && cell.inMonth && (
                          <span className="text-[10px] font-medium text-bored-gray-400">{dayBookings.length}</span>
                        )}
                      </div>

                      {cell.inMonth && dayBookings.length > 0 && (
                        <div className="space-y-0.5 mt-1">
                          {dayBookings.slice(0, 3).map((b, i) => (
                            <div key={i} className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate border ${getExpColor(b.experience)}`}>
                              {b.startTime} {b.experience.split(' ').slice(0, 2).join(' ')}
                            </div>
                          ))}
                          {dayBookings.length > 3 && (
                            <div className="text-[10px] text-bored-gray-400 font-medium pl-1">+{dayBookings.length - 3} more</div>
                          )}
                        </div>
                      )}

                      {cell.inMonth && (confirmedN > 0 || pendingN > 0) && (
                        <div className="absolute bottom-2 right-2 flex gap-0.5">
                          {confirmedN > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {pendingN > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── WEEK VIEW ────────────────────────────────────────── */}
        {viewMode === 'week' && (
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-bored-gray-200 overflow-hidden">
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-bored-gray-100">
                <div className="py-3" />
                {weekDates.map((ds, i) => {
                  const d = new Date(ds + 'T00:00:00');
                  const isT = ds === todayStr;
                  return (
                    <button key={ds} onClick={() => setSelectedDate(ds)}
                      className={`py-3 text-center border-l border-bored-gray-100 hover:bg-bored-gray-50 transition-colors ${ds === selectedDate ? 'bg-bored-neon/5' : ''}`}>
                      <div className="text-[10px] font-semibold text-bored-gray-500 uppercase tracking-wide">{WEEKDAYS[i]}</div>
                      <div className={`text-lg font-light mt-0.5 ${isT ? 'bg-bored-black text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' : 'text-bored-gray-800'}`}>
                        {d.getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="relative" style={{ height: `${hours.length * 60}px` }}>
                {/* Hour grid lines — pointer-events-none so bookings are clickable */}
                {hours.map((h, i) => (
                  <div key={h} className="absolute w-full grid grid-cols-[60px_repeat(7,1fr)] pointer-events-none" style={{ top: `${i * 60}px` }}>
                    <div className="text-[10px] text-bored-gray-400 text-right pr-2 -mt-1.5">{String(h).padStart(2, '0')}:00</div>
                    {weekDates.map(ds => <div key={ds} className="border-l border-t border-bored-gray-100 h-[60px]" />)}
                  </div>
                ))}

                {weekDates.map((ds, colIdx) => (bookingsByDate[ds] || []).map(b => {
                  const [sh, sm] = b.startTime.split(':').map(Number);
                  const [eh, em] = b.endTime.split(':').map(Number);
                  const top = (sh - 7) * 60 + sm;
                  const height = Math.max((eh - sh) * 60 + (em - sm), 30);
                  const colW = `calc((100% - 60px) / 7)`;
                  return (
                    <div key={b.id} className={`absolute z-10 mx-0.5 rounded-lg p-1.5 border cursor-pointer hover:shadow-md transition-shadow overflow-hidden ${getExpColor(b.experience)}`}
                      style={{ top: `${top}px`, height: `${height}px`, left: `calc(60px + ${colIdx} * ${colW})`, width: colW }}
                      onClick={() => setSelectedDate(ds)}>
                      <p className="text-[10px] font-semibold truncate">{b.experience}</p>
                      <p className="text-[9px] opacity-70">{b.startTime}–{b.endTime}</p>
                      {height > 50 && <p className="text-[9px] opacity-60 truncate">{b.guestName}</p>}
                    </div>
                  );
                }))}
              </div>
            </div>
          </div>
        )}

        {/* ─── DAY DETAIL SIDEBAR ───────────────────────────────── */}
        {selectedDate && viewMode === 'month' && (
          <div className="w-[380px] flex-shrink-0">
            <div className="bg-white rounded-2xl border border-bored-gray-200 overflow-hidden sticky top-8">
              <div className="p-5 border-b border-bored-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-bored-black">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-xs text-bored-gray-500 mt-0.5">{(bookingsByDate[selectedDate] || []).length} bookings</p>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-bored-gray-100 rounded-lg transition-colors">
                  <X size={16} className="text-bored-gray-400" />
                </button>
              </div>

              <div className="px-5 py-3 border-b border-bored-gray-100 flex gap-2">
                {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors capitalize ${filterStatus === s ? 'bg-bored-black text-white' : 'bg-bored-gray-50 text-bored-gray-600 hover:bg-bored-gray-100'}`}>
                    {s}
                  </button>
                ))}
              </div>

              <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                {selectedDayBookings.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar size={32} className="text-bored-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-bored-gray-500">No bookings {filterStatus !== 'all' ? `with status "${filterStatus}"` : 'for this day'}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-bored-gray-100">
                    {selectedDayBookings.map(b => (
                      <div key={b.id} className="p-4 hover:bg-bored-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <img src={b.experienceImage} alt={b.experience} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-bored-black truncate">{b.experience}</h4>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${statusBadge(b.status)}`}>{b.status}</span>
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-bored-gray-600">
                                <Clock size={12} className="text-bored-gray-400" />{b.startTime} – {b.endTime}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-bored-gray-600">
                                <Users size={12} className="text-bored-gray-400" />{b.guestName} · {b.guestCount} {b.guestCount === 1 ? 'guest' : 'guests'}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm font-medium text-bored-black">€{b.price}</span>
                              <span className={`w-2 h-2 rounded-full ${statusDot(b.status)}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedDayBookings.length > 0 && (
                <div className="p-4 border-t border-bored-gray-100 bg-bored-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-bored-gray-500">Day total</span>
                    <span className="font-semibold text-bored-black">€{selectedDayBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.price, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-bored-gray-500">Guests</span>
                    <span className="font-semibold text-bored-black">{selectedDayBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.guestCount, 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Week day detail */}
      {selectedDate && viewMode === 'week' && (
        <div className="mt-6">
          <div className="bg-white rounded-2xl border border-bored-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-bored-black">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-xs text-bored-gray-500 mt-0.5">
                  {(bookingsByDate[selectedDate] || []).length} bookings · €{(bookingsByDate[selectedDate] || []).filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.price, 0).toLocaleString()} revenue
                </p>
              </div>
              <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-bored-gray-100 rounded-lg transition-colors">
                <X size={16} className="text-bored-gray-400" />
              </button>
            </div>

            {(bookingsByDate[selectedDate] || []).length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={32} className="text-bored-gray-300 mx-auto mb-3" />
                <p className="text-sm text-bored-gray-500">No bookings for this day</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(bookingsByDate[selectedDate] || []).map(b => (
                  <div key={b.id} className="rounded-xl border border-bored-gray-200 p-4 hover:border-bored-gray-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <img src={b.experienceImage} alt={b.experience} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-bored-black truncate">{b.experience}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusBadge(b.status)}`}>{b.status}</span>
                          <span className="text-xs text-bored-gray-500">{b.startTime}–{b.endTime}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-bored-gray-600">{b.guestName} · {b.guestCount}p</span>
                          <span className="text-sm font-medium text-bored-black">€{b.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs text-bored-gray-500">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Confirmed</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pending</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Cancelled</div>
      </div>
    </div>
  );
};