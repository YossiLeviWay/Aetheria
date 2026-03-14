"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, List, LayoutGrid, Plus, Calendar } from "lucide-react";
import KanbanBoard from "@/components/kanban/kanban-board";
import TaskModal from "@/components/kanban/task-modal";
import Modal from "@/components/ui/modal";
import { useTranslation } from "@/hooks/use-translation";
import type { Task, Mission } from "@/types";

type Status = "todo" | "in_progress" | "done" | "blocked";

export default function BoardPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const missionId = searchParams.get("mission");

  const [mission, setMission] = useState<Mission | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<Status>("todo");
  const [loading, setLoading] = useState(true);

  const fetchMission = useCallback(async () => {
    if (!missionId) { setLoading(false); return; }
    setLoading(true);
    const res = await fetch(`/api/missions/${missionId}`);
    if (res.ok) setMission(await res.json());
    setLoading(false);
  }, [missionId]);

  useEffect(() => { fetchMission(); }, [fetchMission]);

  const tasks = mission?.tasks ?? [];

  async function handleTaskUpdate(id: string, updates: Partial<Task>) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setMission((prev) => prev ? {
      ...prev,
      tasks: prev.tasks?.map((t) => t.id === id ? { ...t, ...updates } : t)
    } : prev);
  }

  async function handleNewTask(name: string, status: Status) {
    if (!missionId) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, missionId, status }),
    });
    if (res.ok) {
      const task = await res.json();
      setMission((prev) => prev ? { ...prev, tasks: [...(prev.tasks ?? []), task] } : prev);
    }
  }

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${projectId}`} className="text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{mission?.name ?? "Board"}</h1>
            {mission && (
              <p className="text-text-secondary text-sm">
                {tasks.length} tasks · {tasks.filter((t) => t.status === "done").length} completed
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-background rounded-xl border border-border p-1">
            <Link
              href={`/projects/${projectId}/board${missionId ? `?mission=${missionId}` : ""}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-surface shadow-sm text-primary"
            >
              <LayoutGrid size={14} />
              Board
            </Link>
            <Link
              href={`/projects/${projectId}/list${missionId ? `?mission=${missionId}` : ""}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-lg transition-colors"
            >
              <List size={14} />
              List
            </Link>
          </div>

          <button
            onClick={() => { setNewTaskStatus("todo"); setShowNewTask(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            {t("task.new")}
          </button>
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-72 shrink-0">
              <div className="skeleton h-6 w-24 mb-3 rounded-full" />
              <div className="space-y-2">
                {[1, 2].map((j) => <div key={j} className="skeleton h-24 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskClick={setSelectedTask}
          onNewTask={(status) => { setNewTaskStatus(status); setShowNewTask(true); }}
        />
      )}

      {/* Task detail modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updated) => {
            setMission((prev) => prev ? {
              ...prev,
              tasks: prev.tasks?.map((t) => t.id === updated.id ? updated : t)
            } : prev);
            setSelectedTask(updated);
          }}
          onDelete={(id) => {
            setMission((prev) => prev ? {
              ...prev,
              tasks: prev.tasks?.filter((t) => t.id !== id)
            } : prev);
            setSelectedTask(null);
          }}
        />
      )}

      {/* New Task modal */}
      <NewTaskModal
        open={showNewTask}
        onClose={() => setShowNewTask(false)}
        defaultStatus={newTaskStatus}
        onSubmit={handleNewTask}
      />
    </div>
  );
}

function NewTaskModal({ open, onClose, defaultStatus, onSubmit }: {
  open: boolean; onClose: () => void; defaultStatus: Status;
  onSubmit: (name: string, status: Status) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>(defaultStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setStatus(defaultStatus); }, [defaultStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit(name, status);
    setName(""); setLoading(false); onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t("task.new")}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("task.name")}</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:border-primary"
            placeholder="What needs to be done?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("task.status")}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:border-primary bg-white"
          >
            <option value="todo">{t("task.todo")}</option>
            <option value="in_progress">{t("task.inProgress")}</option>
            <option value="done">{t("task.done")}</option>
            <option value="blocked">{t("task.blocked")}</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">{t("common.cancel")}</button>
          <button type="submit" disabled={loading || !name} className="btn-primary disabled:opacity-50">
            {loading ? t("common.loading") : t("common.create")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
