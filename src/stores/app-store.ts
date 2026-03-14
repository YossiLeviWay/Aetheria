import { create } from "zustand";
import type { Project, Mission, Task, Notification } from "@/types";

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Language
  language: "en" | "he";
  setLanguage: (lang: "en" | "he") => void;

  // Current workspace
  workspaceId: string | null;
  setWorkspaceId: (id: string) => void;

  // Projects
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;

  // Active project/mission
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeMissionId: string | null;
  setActiveMissionId: (id: string | null) => void;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;

  // Task being viewed
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;

  // Mission being viewed
  selectedMission: Mission | null;
  setSelectedMission: (mission: Mission | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  language: "en",
  setLanguage: (lang) => set({ language: lang }),

  workspaceId: null,
  setWorkspaceId: (id) => set({ workspaceId: id }),

  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  activeMissionId: null,
  setActiveMissionId: (id) => set({ activeMissionId: id }),

  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),

  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),
  selectedMission: null,
  setSelectedMission: (mission) => set({ selectedMission: mission }),
}));
