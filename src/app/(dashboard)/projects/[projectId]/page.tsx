"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Layers, MoreHorizontal, ChevronRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project, Mission } from "@/types";

export default function ProjectPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewMission, setShowNewMission] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => { setProject(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!project) return <div className="text-center py-20 text-text-secondary">Project not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link href="/projects" className="hover:text-primary flex items-center gap-1">
          <ArrowLeft size={14} />
          Projects
        </Link>
        <ChevronRight size={14} />
        <span className="text-text-primary font-medium">{project.name}</span>
      </div>

      {/* Project header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-card"
            style={{ backgroundColor: project.color }}
          >
            {project.icon ?? project.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge label={project.status} variant="status" value={project.status} />
              <span className="text-text-secondary text-sm">
                {project.missions?.length ?? 0} missions
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewMission(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            {t("mission.new")}
          </button>
        </div>
      </div>

      {/* Missions */}
      {!project.missions || project.missions.length === 0 ? (
        <div className="text-center py-16 card">
          <Layers size={32} className="text-primary mx-auto mb-3 opacity-50" />
          <h3 className="font-semibold mb-1">No missions yet</h3>
          <p className="text-text-secondary text-sm mb-4">Create a mission to start organizing tasks</p>
          <button onClick={() => setShowNewMission(true)} className="btn-primary mx-auto">
            {t("mission.new")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {project.missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} projectId={projectId} projectColor={project.color} />
          ))}
        </div>
      )}

      <NewMissionModal
        open={showNewMission}
        onClose={() => setShowNewMission(false)}
        projectId={projectId}
        onCreated={(m) => {
          setProject((prev) => prev ? { ...prev, missions: [...(prev.missions ?? []), m] } : prev);
          setShowNewMission(false);
        }}
      />
    </div>
  );
}

function MissionCard({ mission, projectId, projectColor }: { mission: Mission; projectId: string; projectColor: string }) {
  const taskCount = mission._count?.tasks ?? 0;

  return (
    <Link href={`/projects/${projectId}/board?mission=${mission.id}`}>
      <div className="card hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-1 h-10 rounded-full shrink-0"
              style={{ backgroundColor: projectColor }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                {mission.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <Badge label={mission.status.replace("_", " ")} variant="status" value={mission.status} />
                <Badge label={mission.priority} variant="priority" value={mission.priority} />
                <span className="text-xs text-text-secondary">{taskCount} tasks</span>
                {mission.dueDate && (
                  <span className="text-xs text-text-secondary">
                    Due {new Date(mission.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary transition-all"
                  style={{ width: `${mission.progress}%` }}
                />
              </div>
              <span className="text-xs text-text-secondary w-8">{mission.progress}%</span>
            </div>

            <button
              className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-all"
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal size={15} className="text-text-secondary" />
            </button>
            <ChevronRight size={16} className="text-text-secondary" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function NewMissionModal({ open, onClose, projectId, onCreated }: {
  open: boolean; onClose: () => void; projectId: string; onCreated: (m: Mission) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, projectId, priority, dueDate: dueDate || undefined }),
    });
    if (res.ok) {
      onCreated(await res.json());
      setName(""); setPriority("medium"); setDueDate("");
    }
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title={t("mission.new")}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("mission.name")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:border-primary"
            placeholder="e.g. Launch MVP"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("mission.priority")}</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:border-primary bg-white"
            >
              {["critical", "high", "medium", "low"].map((p) => (
                <option key={p} value={p}>{t(`priority.${p}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("mission.dueDate")}</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:border-primary"
            />
          </div>
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
