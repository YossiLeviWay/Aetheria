"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FolderOpen, MoreHorizontal, Layers } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAppStore } from "@/stores/app-store";
import Badge from "@/components/ui/badge";
import { ProjectCardSkeleton } from "@/components/ui/skeleton";
import Modal from "@/components/ui/modal";
import type { Project } from "@/types";

const PROJECT_COLORS = [
  "#4F46E5", "#14B8A6", "#F59E0B", "#F43F5E", "#8B5CF6",
  "#EC4899", "#0EA5E9", "#10B981", "#F97316", "#6366F1",
];

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { projects, setProjects, addProject } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setProjects]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t("nav.projects")}</h1>
          <p className="text-text-secondary mt-1 text-sm">{projects.length} projects</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          {t("project.new")}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={28} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-text-secondary text-sm mb-6">Create your first project to get started</p>
          <button onClick={() => setShowNew(true)} className="btn-primary">
            {t("project.new")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <button
            onClick={() => setShowNew(true)}
            className="card border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-text-secondary hover:border-primary hover:text-primary transition-all min-h-[140px] cursor-pointer"
          >
            <Plus size={24} />
            <span className="text-sm font-medium">{t("project.new")}</span>
          </button>
        </div>
      )}

      <NewProjectModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={(p) => { addProject(p); setShowNew(false); }}
      />
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="card hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: project.color }}
            >
              {project.icon ?? project.name[0]}
            </div>
            <div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <Badge label={project.status} variant="status" value={project.status} />
            </div>
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-all"
            onClick={(e) => e.preventDefault()}
          >
            <MoreHorizontal size={15} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-1">
            <Layers size={12} />
            <span>{(project._count?.missions ?? 0)} missions</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function NewProjectModal({ open, onClose, onCreated }: {
  open: boolean;
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4F46E5");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, icon }),
    });
    if (res.ok) {
      const project = await res.json();
      onCreated(project);
      setName(""); setIcon(""); setColor("#4F46E5");
    }
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title={t("project.new")}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("project.name")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            placeholder="e.g. Website Redesign"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">{t("project.icon")}</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            placeholder="Emoji (e.g. 🚀)"
            maxLength={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t("project.color")}</label>
          <div className="flex gap-2 flex-wrap">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${color === c ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            {t("common.cancel")}
          </button>
          <button type="submit" disabled={loading || !name} className="btn-primary disabled:opacity-50">
            {loading ? t("common.loading") : t("common.create")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
