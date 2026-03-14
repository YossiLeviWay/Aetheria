"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, List, Plus, ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { Task, Mission } from "@/types";

type SortField = "name" | "status" | "priority" | "dueDate" | "assignee";
type SortDir = "asc" | "desc";

export default function ListPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const missionId = searchParams.get("mission");

  const [mission, setMission] = useState<Mission | null>(null);
  const [sortField, setSortField] = useState<SortField>("sortOrder" as SortField);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [loading, setLoading] = useState(true);

  const fetchMission = useCallback(async () => {
    if (!missionId) { setLoading(false); return; }
    const res = await fetch(`/api/missions/${missionId}`);
    if (res.ok) setMission(await res.json());
    setLoading(false);
  }, [missionId]);

  useEffect(() => { fetchMission(); }, [fetchMission]);

  const tasks = mission?.tasks ?? [];

  function sortTasks(a: Task, b: Task): number {
    let cmp = 0;
    if (sortField === "name") cmp = a.name.localeCompare(b.name);
    else if (sortField === "status") cmp = a.status.localeCompare(b.status);
    else if (sortField === "priority") {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      cmp = (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
    }
    else if (sortField === "dueDate") {
      if (!a.dueDate && !b.dueDate) cmp = 0;
      else if (!a.dueDate) cmp = 1;
      else if (!b.dueDate) cmp = -1;
      else cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return sortDir === "asc" ? cmp : -cmp;
  }

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  async function updateTaskStatus(id: string, status: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMission((prev) => prev ? {
      ...prev,
      tasks: prev.tasks?.map((t) => t.id === id ? { ...t, status: status as Task["status"] } : t)
    } : prev);
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <ChevronDown
      size={13}
      className={`ml-1 transition-transform ${sortField === field ? (sortDir === "asc" ? "" : "rotate-180") : "opacity-30"}`}
    />
  );

  return (
    <div className="max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${projectId}`} className="text-text-secondary hover:text-primary">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold">{mission?.name ?? "List"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-background rounded-xl border border-border p-1">
            <Link
              href={`/projects/${projectId}/board${missionId ? `?mission=${missionId}` : ""}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-lg transition-colors"
            >
              <LayoutGrid size={14} />
              Board
            </Link>
            <Link
              href={`/projects/${projectId}/list${missionId ? `?mission=${missionId}` : ""}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-surface shadow-sm text-primary"
            >
              <List size={14} />
              List
            </Link>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            {t("task.new")}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border bg-background text-xs font-semibold text-text-secondary">
          <div className="col-span-5 flex items-center cursor-pointer hover:text-text-primary" onClick={() => handleSort("name")}>
            Task Name <SortIcon field="name" />
          </div>
          <div className="col-span-2 flex items-center cursor-pointer hover:text-text-primary" onClick={() => handleSort("status")}>
            Status <SortIcon field="status" />
          </div>
          <div className="col-span-2 flex items-center cursor-pointer hover:text-text-primary" onClick={() => handleSort("priority")}>
            Priority <SortIcon field="priority" />
          </div>
          <div className="col-span-2 flex items-center cursor-pointer hover:text-text-primary" onClick={() => handleSort("dueDate")}>
            Due Date <SortIcon field="dueDate" />
          </div>
          <div className="col-span-1">Assignee</div>
        </div>

        {/* Rows */}
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border animate-pulse">
              <div className="col-span-5 skeleton h-4 rounded" />
              <div className="col-span-2 skeleton h-4 rounded-full w-20" />
              <div className="col-span-2 skeleton h-4 rounded-full w-16" />
              <div className="col-span-2 skeleton h-4 rounded w-24" />
              <div className="col-span-1 skeleton h-6 w-6 rounded-full" />
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-text-secondary text-sm">
            No tasks yet. Create one to get started.
          </div>
        ) : (
          [...tasks].sort(sortTasks).map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border hover:bg-background/50 transition-colors group"
            >
              <div className="col-span-5 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={(e) => updateTaskStatus(task.id, e.target.checked ? "done" : "todo")}
                  className="w-4 h-4 rounded border-border text-secondary"
                />
                <span className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-text-secondary" : ""}`}>
                  {task.name}
                </span>
              </div>
              <div className="col-span-2 flex items-center">
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  className="text-xs border-0 bg-transparent focus:outline-none cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div className="col-span-2 flex items-center">
                <Badge label={task.priority} variant="priority" value={task.priority} />
              </div>
              <div className="col-span-2 flex items-center">
                {task.dueDate ? (
                  <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== "done" ? "text-danger" : "text-text-secondary"}`}>
                    {formatDate(task.dueDate)}
                  </span>
                ) : (
                  <span className="text-xs text-text-secondary">—</span>
                )}
              </div>
              <div className="col-span-1 flex items-center">
                {task.assignee ? (
                  <Avatar name={task.assignee.name} image={task.assignee.image} size="sm" />
                ) : (
                  <span className="text-xs text-text-secondary">—</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
