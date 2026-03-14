"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckSquare, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { formatDate } from "@/lib/utils";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import { TaskSkeleton } from "@/components/ui/skeleton";
import Modal from "@/components/ui/modal";
import type { Task, CalendarEvent, Project, Mission, TaskPriority } from "@/types";

export default function MyDayPage() {
  const { t, lang } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);

  const today = new Date();
  const formattedDate = today.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [tasksRes] = await Promise.all([
          fetch("/api/tasks/today"),
        ]);
        if (tasksRes.ok) setTasks(await tasksRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const doneTasks = tasks.filter((t) => t.status === "done");
  const pendingTasks = tasks.filter((t) => t.status !== "done");

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{t("dashboard.myDay")}</h1>
        <p className="text-text-secondary mt-1">{formattedDate}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tasks", value: tasks.length, icon: CheckSquare, color: "text-primary bg-primary/10" },
          { label: "Completed", value: doneTasks.length, icon: CheckSquare, color: "text-secondary bg-secondary/10" },
          { label: "In Progress", value: tasks.filter((t) => t.status === "in_progress").length, icon: Clock, color: "text-accent bg-accent/10" },
          { label: "Overdue", value: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "done").length, icon: Clock, color: "text-danger bg-danger/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Tasks column */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base">{t("dashboard.todayTasks")}</h2>
            <button
              onClick={() => setShowNewTask(true)}
              className="flex items-center gap-1.5 text-sm text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={15} />
              {t("task.new")}
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <TaskSkeleton key={i} />)}
            </div>
          ) : pendingTasks.length === 0 ? (
            <div className="card text-center py-12">
              <CheckSquare size={32} className="text-secondary mx-auto mb-3 opacity-50" />
              <p className="font-medium text-text-primary">All clear!</p>
              <p className="text-sm text-text-secondary mt-1">No pending tasks for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} onUpdate={(updated) => {
                  setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
                }} />
              ))}
            </div>
          )}

          {doneTasks.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-text-secondary mb-3">
                Completed ({doneTasks.length})
              </h3>
              <div className="space-y-2">
                {doneTasks.map((task) => (
                  <TaskCard key={task.id} task={task} dimmed onUpdate={(updated) => {
                    setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Calendar / Events column */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base">{t("dashboard.todayEvents")}</h2>
          </div>
          <div className="card">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={28} className="text-text-secondary mx-auto mb-2 opacity-50" />
                <p className="text-sm text-text-secondary">No events today</p>
                <button className="mt-3 text-sm text-primary hover:underline">
                  {t("calendar.connectCalendar")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex gap-3 p-3 rounded-xl hover:bg-background transition-colors">
                    <div className="text-xs text-text-secondary w-14 shrink-0 pt-0.5">
                      {new Date(event.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      {event.location && <p className="text-xs text-text-secondary truncate">{event.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mini calendar */}
          <div className="card mt-4">
            <MiniCalendar />
          </div>
        </div>
      </div>

      {showNewTask && (
        <NewTaskModal
          onClose={() => setShowNewTask(false)}
          onCreated={(task) => {
            setTasks((prev) => [task, ...prev]);
            setShowNewTask(false);
          }}
        />
      )}
    </div>
  );
}

function TaskCard({ task, dimmed, onUpdate }: { task: Task; dimmed?: boolean; onUpdate: (t: Task) => void }) {
  async function toggleDone() {
    const newStatus = task.status === "done" ? "todo" : "done";
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) onUpdate(await res.json());
  }

  return (
    <div className={`card flex items-start gap-3 hover:shadow-md transition-all ${dimmed ? "opacity-60" : ""}`}>
      <button
        onClick={toggleDone}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          task.status === "done"
            ? "bg-secondary border-secondary text-white"
            : "border-border hover:border-secondary"
        }`}
        aria-label={task.status === "done" ? "Mark incomplete" : "Mark complete"}
      >
        {task.status === "done" && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-text-secondary" : ""}`}>
          {task.name}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge label={task.priority} variant="priority" value={task.priority} />
          {task.dueDate && (
            <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== "done" ? "text-danger" : "text-text-secondary"}`}>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {task.assignee && (
        <Avatar name={task.assignee.name} image={task.assignee.image} size="sm" />
      )}
    </div>
  );
}

function MiniCalendar() {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const displayDate = new Date(calYear, calMonth, 1);
  const monthLabel = displayDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  }

  const isToday = (day: number) =>
    day === today.getDate() &&
    calMonth === today.getMonth() &&
    calYear === today.getFullYear();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">{monthLabel}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={nextMonth}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-xs text-text-secondary font-medium py-1">{d}</div>
        ))}
        {blanks.map((_, i) => <div key={`b-${i}`} />)}
        {days.map((day) => (
          <button
            key={day}
            className={`text-xs py-1.5 rounded-lg transition-colors ${
              isToday(day)
                ? "bg-primary text-white font-semibold"
                : "hover:bg-background text-text-secondary"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

interface NewTaskModalProps {
  onClose: () => void;
  onCreated: (task: Task) => void;
}

function NewTaskModal({ onClose, onCreated }: NewTaskModalProps) {
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [missionId, setMissionId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      setLoadingProjects(true);
      try {
        const res = await fetch("/api/projects");
        if (res.ok) setProjects(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProjects(false);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    if (!projectId) {
      setMissions([]);
      setMissionId("");
      return;
    }
    async function loadMissions() {
      setLoadingMissions(true);
      setMissionId("");
      try {
        const res = await fetch(`/api/missions?projectId=${projectId}`);
        if (res.ok) setMissions(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMissions(false);
      }
    }
    loadMissions();
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Task name is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { name: name.trim(), priority };
      if (missionId) body.missionId = missionId;
      if (dueDate) body.dueDate = dueDate;

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Failed to create task. Please try again.");
        return;
      }

      const task: Task = await res.json();
      onCreated(task);
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition";
  const labelClass = "block text-xs font-medium text-text-secondary mb-1";

  return (
    <Modal open={true} onClose={onClose} title="New Task" size="md">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Task Name */}
        <div>
          <label className={labelClass} htmlFor="task-name">
            Task Name <span className="text-danger">*</span>
          </label>
          <input
            id="task-name"
            type="text"
            className={inputClass}
            placeholder="Enter task name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Project */}
        <div>
          <label className={labelClass} htmlFor="task-project">Project</label>
          <select
            id="task-project"
            className={inputClass}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={loadingProjects}
          >
            <option value="">{loadingProjects ? "Loading projects..." : "Select a project (optional)"}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Mission */}
        <div>
          <label className={labelClass} htmlFor="task-mission">Mission</label>
          <select
            id="task-mission"
            className={inputClass}
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
            disabled={!projectId || loadingMissions}
          >
            <option value="">
              {!projectId
                ? "Select a project first"
                : loadingMissions
                ? "Loading missions..."
                : "Select a mission (optional)"}
            </option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className={labelClass} htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            className={inputClass}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className={labelClass} htmlFor="task-due-date">Due Date</label>
          <input
            id="task-due-date"
            type="date"
            className={inputClass}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-background transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
            disabled={submitting || !name.trim()}
          >
            {submitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
