"use client";

import { useState } from "react";
import { Trash2, Send, CheckSquare, Plus, X } from "lucide-react";
import Modal from "@/components/ui/modal";
import RichEditor from "@/components/editor/rich-editor";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/use-translation";
import { formatDate } from "@/lib/utils";
import type { Task, ChecklistItem } from "@/types";

interface TaskModalProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskModal({ task, open, onClose, onUpdate, onDelete }: TaskModalProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState("");

  async function updateTask(updates: Partial<Task>) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) onUpdate(await res.json());
  }

  async function deleteTask() {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDelete(task.id);
  }

  async function toggleChecklist(item: ChecklistItem) {
    await updateTask({
      checklist: (task.checklist ?? []).map((i) =>
        i.id === item.id ? { ...i, completed: !i.completed } : i
      ) as ChecklistItem[],
    });
  }

  async function addChecklistItem() {
    if (!newCheckItem.trim()) return;
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checklist: [
          ...(task.checklist ?? []),
          { text: newCheckItem, completed: false, sortOrder: (task.checklist?.length ?? 0) },
        ],
      }),
    });
    if (res.ok) { onUpdate(await res.json()); setNewCheckItem(""); }
  }

  async function submitWork() {
    const message = prompt("Add a message with your submission (optional):");
    const res = await fetch(`/api/tasks/${task.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (res.ok) onUpdate(await res.json());
  }

  const completedChecklist = (task.checklist ?? []).filter((i) => i.completed).length;
  const totalChecklist = task.checklist?.length ?? 0;

  return (
    <Modal open={open} onClose={onClose} size="xl" className="max-h-[90vh] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="flex-1 min-w-0 pr-4">
            {editing ? (
              <input
                autoFocus
                defaultValue={task.name}
                onBlur={(e) => { updateTask({ name: e.target.value }); setEditing(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                className="w-full text-lg font-semibold border-b-2 border-primary bg-transparent focus:outline-none"
              />
            ) : (
              <h2
                className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
                onClick={() => setEditing(true)}
              >
                {task.name}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={deleteTask} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors">
              <Trash2 size={15} />
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-text-secondary mb-1.5 font-medium">{t("task.status")}</p>
              <select
                value={task.status}
                onChange={(e) => updateTask({ status: e.target.value as Task["status"] })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="todo">{t("task.todo")}</option>
                <option value="in_progress">{t("task.inProgress")}</option>
                <option value="done">{t("task.done")}</option>
                <option value="blocked">{t("task.blocked")}</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1.5 font-medium">{t("task.priority")}</p>
              <select
                value={task.priority}
                onChange={(e) => updateTask({ priority: e.target.value as Task["priority"] })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
              >
                {["critical", "high", "medium", "low"].map((p) => (
                  <option key={p} value={p}>{t(`priority.${p}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1.5 font-medium">{t("task.dueDate")}</p>
              <input
                type="date"
                defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => updateTask({ dueDate: e.target.value || null })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1.5 font-medium">{t("task.assignee")}</p>
              {task.assignee ? (
                <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl">
                  <Avatar name={task.assignee.name} avatarUrl={task.assignee.avatarUrl} size="sm" />
                  <span className="text-sm truncate">{task.assignee.name}</span>
                </div>
              ) : (
                <div className="px-3 py-2 border border-border rounded-xl text-sm text-text-secondary">
                  Unassigned
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-text-secondary mb-2 font-medium">{t("task.description")}</p>
            <RichEditor
              content={task.description}
              onChange={(content) => updateTask({ description: content })}
              placeholder="Add a description..."
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                <CheckSquare size={13} />
                {t("task.checklist")} {totalChecklist > 0 && `(${completedChecklist}/${totalChecklist})`}
              </p>
            </div>

            {totalChecklist > 0 && (
              <div className="mb-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all"
                  style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5 mb-2">
              {(task.checklist ?? []).map((item) => (
                <label key={item.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklist(item)}
                    className="w-4 h-4 rounded border-border text-secondary focus:ring-secondary/30"
                  />
                  <span className={`text-sm flex-1 ${item.completed ? "line-through text-text-secondary" : ""}`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addChecklistItem(); }}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:border-primary"
              />
              <button
                onClick={addChecklistItem}
                disabled={!newCheckItem.trim()}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="text-xs text-text-secondary">
          Created {formatDate(task.createdAt)}
        </div>
        {task.status !== "done" && (
          <button
            onClick={submitWork}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Send size={14} />
            {t("task.submit")}
          </button>
        )}
      </div>
    </Modal>
  );
}
