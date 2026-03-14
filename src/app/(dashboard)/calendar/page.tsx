"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import Modal from "@/components/ui/modal";

type ViewMode = "month" | "week" | "day";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string;
  account?: { color: string; calendarName: string };
}

// ── New Event Modal ────────────────────────────────────────────────────────────

interface NewEventModalProps {
  onClose: () => void;
  onCreated: (event: CalendarEvent) => void;
}

function NewEventModal({ onClose, onCreated }: NewEventModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("Title is required."); return; }
    if (!date) { setError("Date is required."); return; }

    const startISO = allDay ? `${date}T00:00:00.000Z` : `${date}T${startTime}:00`;
    const endISO   = allDay ? `${date}T23:59:59.999Z` : `${date}T${endTime}:00`;

    setSubmitting(true);
    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          startTime: startISO,
          endTime: endISO,
          allDay,
          location: location.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error ${res.status}`);
      }

      const created: CalendarEvent = await res.json();
      onCreated(created);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="New Event" size="md">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            required
            className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* All Day */}
        <div className="flex items-center gap-2">
          <input
            id="allDay"
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <label htmlFor="allDay" className="text-sm font-medium select-none cursor-pointer">
            All Day
          </label>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Start / End Time — hidden when allDay */}
        {!allDay && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        )}

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1">Location (optional)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add a location"
            className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary text-sm">
            {submitting ? "Creating…" : "Create Event"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Calendar Connect Info Modal ────────────────────────────────────────────────

interface CalendarConnectModalProps {
  provider: string;
  onClose: () => void;
}

function CalendarConnectModal({ provider, onClose }: CalendarConnectModalProps) {
  const displayName =
    provider === "google" ? "Google" : provider === "outlook" ? "Outlook" : "Apple";

  return (
    <Modal open onClose={onClose} title="Calendar Sync" size="sm">
      <div className="p-5 space-y-4">
        <p className="text-sm text-text-secondary">
          Connecting <span className="font-semibold text-text-primary">{displayName} Calendar</span> requires
          OAuth configuration in your environment. Calendar sync integration has not been set up yet.
        </p>
        <p className="text-sm text-text-secondary">
          In the meantime, you can create personal events manually using the{" "}
          <span className="font-semibold text-text-primary">New Event</span> button.
        </p>
        <div className="flex flex-col gap-2 pt-1">
          <a
            href="/settings"
            className="btn-primary text-sm text-center flex items-center justify-center gap-2"
            onClick={onClose}
          >
            <Settings size={15} />
            Go to Settings → Calendar Connections
          </a>
          <button onClick={onClose} className="btn-secondary text-sm">
            Dismiss
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [connectProvider, setConnectProvider] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/calendar/events")
      .then((r) => (r.ok ? r.json() : []))
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function navigate(dir: 1 | -1) {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + 7 * dir);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  }

  const title = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    ...(view === "day" ? { day: "numeric" } : {}),
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t("nav.calendar")}</h1>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-sm px-3 py-1.5 border border-border rounded-xl hover:bg-background transition-colors font-medium"
          >
            {t("common.today")}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-background rounded-xl border border-border p-1">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  view === v
                    ? "bg-surface shadow-sm text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t(`calendar.${v}`)}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-background transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold min-w-[140px] text-center">{title}</span>
          <button
            onClick={() => navigate(1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-background transition-colors"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setShowNewEvent(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card overflow-hidden">
        {view === "month" && <MonthView date={currentDate} events={events} />}
        {view === "week" && <WeekView date={currentDate} events={events} />}
        {view === "day" && <DayView date={currentDate} events={events} />}
      </div>

      {/* Connect calendar prompt */}
      {events.length === 0 && !loading && (
        <div className="mt-6 card text-center py-10">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <RefreshCw size={20} className="text-primary" />
          </div>
          <h3 className="font-semibold mb-1">{t("calendar.connectCalendar")}</h3>
          <p className="text-text-secondary text-sm mb-4">
            Connect your Google Calendar, Outlook, or Apple Calendar to see your events here.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {["google", "outlook", "apple"].map((provider) => (
              <button
                key={provider}
                onClick={() => setConnectProvider(provider)}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                {t(`calendar.${provider}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New Event Modal */}
      {showNewEvent && (
        <NewEventModal
          onClose={() => setShowNewEvent(false)}
          onCreated={(e) => {
            setEvents((prev) => [...prev, e]);
            setShowNewEvent(false);
          }}
        />
      )}

      {/* Calendar Connect Info Modal */}
      {connectProvider && (
        <CalendarConnectModal
          provider={connectProvider}
          onClose={() => setConnectProvider(null)}
        />
      )}
    </div>
  );
}

// ── MonthView ──────────────────────────────────────────────────────────────────

function MonthView({ date, events }: { date: Date; events: CalendarEvent[] }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((d) => (
          <div key={d} className="p-3 text-xs font-semibold text-text-secondary text-center">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const dayEvents = day
            ? events.filter((e) => {
                const d = new Date(e.startTime);
                return (
                  d.getDate() === day &&
                  d.getMonth() === month &&
                  d.getFullYear() === year
                );
              })
            : [];

          return (
            <div
              key={idx}
              className={`min-h-[100px] p-2 border-b border-r border-border last:border-r-0 ${
                !day ? "bg-background/50" : "hover:bg-background/50 transition-colors"
              }`}
            >
              {day && (
                <>
                  <div
                    className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full mb-1 ${
                      isToday
                        ? "bg-primary text-white"
                        : "text-text-primary hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-2 py-0.5 rounded-md truncate font-medium cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: (event.account?.color ?? "#4F46E5") + "20",
                          color: event.account?.color ?? "#4F46E5",
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-text-secondary pl-2">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── WeekView ───────────────────────────────────────────────────────────────────

function WeekView({ date, events }: { date: Date; events: CalendarEvent[] }) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const today = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-border">
          <div className="p-3" />
          {days.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div key={i} className="p-3 text-center">
                <p className="text-xs text-text-secondary">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <p
                  className={`text-lg font-semibold mt-1 w-9 h-9 rounded-full flex items-center justify-center mx-auto ${
                    isToday ? "bg-primary text-white" : ""
                  }`}
                >
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="overflow-y-auto max-h-[500px]">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border/50">
              <div className="p-2 text-xs text-text-secondary text-right pr-3 w-16">
                {hour === 0 ? "" : `${hour}:00`}
              </div>
              {days.map((_, i) => (
                <div
                  key={i}
                  className="border-l border-border/50 min-h-[48px] hover:bg-background/50 transition-colors"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DayView ────────────────────────────────────────────────────────────────────

function DayView({ date, events }: { date: Date; events: CalendarEvent[] }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter((e) => {
    const d = new Date(e.startTime);
    return d.toDateString() === date.toDateString();
  });

  return (
    <div className="overflow-y-auto max-h-[600px]">
      {hours.map((hour) => {
        const hourEvents = dayEvents.filter(
          (e) => new Date(e.startTime).getHours() === hour
        );
        return (
          <div key={hour} className="flex border-b border-border/50 min-h-[60px]">
            <div className="w-16 p-2 text-xs text-text-secondary text-right pr-3 shrink-0">
              {hour === 0 ? "" : `${hour}:00`}
            </div>
            <div className="flex-1 border-l border-border/50 p-1">
              {hourEvents.map((event) => (
                <div
                  key={event.id}
                  className="px-2 py-1 rounded-lg text-xs font-medium mb-1"
                  style={{
                    backgroundColor: (event.account?.color ?? "#4F46E5") + "20",
                    color: event.account?.color ?? "#4F46E5",
                  }}
                >
                  {event.title}
                  {event.location && (
                    <span className="ml-2 opacity-70">@ {event.location}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
