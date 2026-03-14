"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export function useWorkspace() {
  const { workspaceId, setWorkspaceId, setProjects } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchWorkspace() {
      setLoading(true);
      try {
        const res = await fetch("/api/workspace");
        if (res.ok) {
          const data = await res.json();
          if (data.id) setWorkspaceId(data.id);
        }
      } catch (e) {
        console.error("Failed to fetch workspace", e);
      } finally {
        setLoading(false);
      }
    }

    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        console.error("Failed to fetch projects", e);
      }
    }

    if (!workspaceId) {
      fetchWorkspace();
    }
    fetchProjects();
  }, [workspaceId, setWorkspaceId, setProjects]);

  return { workspaceId, loading };
}
