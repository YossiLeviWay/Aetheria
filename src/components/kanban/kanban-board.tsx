"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical } from "lucide-react";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { cn, formatDate } from "@/lib/utils";
import type { Task } from "@/types";

type Status = "todo" | "in_progress" | "done" | "blocked";

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "#6B7280" },
  { id: "in_progress", label: "In Progress", color: "#F59E0B" },
  { id: "done", label: "Done", color: "#14B8A6" },
  { id: "blocked", label: "Blocked", color: "#F43F5E" },
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
  onTaskClick: (task: Task) => void;
  onNewTask: (status: Status) => void;
}

export default function KanbanBoard({ tasks, onTaskUpdate, onTaskClick, onNewTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function onDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging over a column
    const overColumn = COLUMNS.find((c) => c.id === overId);
    if (overColumn) {
      onTaskUpdate(activeId, { status: overColumn.id });
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const overId = over.id as string;
    const overColumn = COLUMNS.find((c) => c.id === overId);
    if (overColumn) {
      await onTaskUpdate(active.id as string, { status: overColumn.id });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              onTaskClick={onTaskClick}
              onNewTask={onNewTask}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onTaskClick={() => {}} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  onNewTask,
}: {
  column: { id: Status; label: string; color: string };
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onNewTask: (status: Status) => void;
}) {
  return (
    <div className="flex-shrink-0 w-72">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-semibold">{column.label}</span>
          <span className="text-xs font-medium bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onNewTask(column.id)}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-text-secondary hover:text-primary transition-colors"
          aria-label="Add task"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <SortableContext
        id={column.id}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn(
            "min-h-[200px] rounded-2xl p-2 space-y-2 transition-colors",
            "bg-gray-50/80"
          )}
          data-column-id={column.id}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-xs text-text-secondary">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function TaskCard({
  task,
  onTaskClick,
  isDragging,
}: {
  task: Task;
  onTaskClick: (task: Task) => void;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-surface rounded-xl border border-border p-3 cursor-pointer hover:shadow-card transition-all group",
        (isDragging || isSortableDragging) && "opacity-50 shadow-modal rotate-1"
      )}
      onClick={() => onTaskClick(task)}
    >
      {/* Drag handle */}
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-primary transition-all cursor-grab active:cursor-grabbing shrink-0"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag task"
        >
          <GripVertical size={14} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary line-clamp-2">{task.name}</p>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: tag.color + "20", color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-2">
              <Badge label={task.priority} variant="priority" value={task.priority} />
              {task.dueDate && (
                <span className={cn(
                  "text-xs",
                  new Date(task.dueDate) < new Date() ? "text-danger" : "text-text-secondary"
                )}>
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>

            {task.assignee && (
              <Avatar name={task.assignee.name} image={task.assignee.image} size="sm" />
            )}
          </div>

          {/* Checklist progress */}
          {task.checklist && task.checklist.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all"
                  style={{
                    width: `${(task.checklist.filter((i) => i.completed).length / task.checklist.length) * 100}%`
                  }}
                />
              </div>
              <span className="text-xs text-text-secondary">
                {task.checklist.filter((i) => i.completed).length}/{task.checklist.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
