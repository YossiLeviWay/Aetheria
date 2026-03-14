export type UserRole = "admin" | "member" | "viewer";
export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type MissionStatus = "not_started" | "in_progress" | "review" | "done";
export type ProjectStatus = "active" | "on_hold" | "completed" | "archived";
export type CalendarProvider = "google" | "outlook" | "apple" | "caldav" | "aetheria";
export type NotificationType =
  | "assigned"
  | "comment"
  | "mention"
  | "due_soon"
  | "overdue"
  | "submission"
  | "invite"
  | "status_changed";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  language: string;
  timezone: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: UserRole;
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: unknown;
  color: string;
  icon?: string | null;
  status: ProjectStatus;
  creatorId: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  missions?: Mission[];
  _count?: { missions: number };
}

export interface Mission {
  id: string;
  name: string;
  description?: unknown;
  priority: TaskPriority;
  status: MissionStatus;
  progress: number;
  startDate?: string | null;
  dueDate?: string | null;
  creatorId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  name: string;
  description?: unknown;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  timeLogged: number;
  sortOrder: number;
  assigneeId?: string | null;
  assignee?: User | null;
  creatorId: string;
  missionId: string;
  createdAt: string;
  updatedAt: string;
  checklist?: ChecklistItem[];
  tags?: Tag[];
  _count?: { comments: number };
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  sortOrder: number;
  taskId: string;
}

export interface Comment {
  id: string;
  content: unknown;
  isPinned: boolean;
  authorId: string;
  author: User;
  missionId?: string | null;
  taskId?: string | null;
  parentId?: string | null;
  replies?: Comment[];
  reactions?: Reaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  commentId: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CalendarAccount {
  id: string;
  provider: CalendarProvider;
  calendarName: string;
  color: string;
  syncEnabled: boolean;
  lastSyncAt?: string | null;
}

export interface CalendarEvent {
  id: string;
  externalId?: string | null;
  title: string;
  description?: unknown;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string | null;
  accountId: string;
  linkedTaskId?: string | null;
  account?: CalendarAccount;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link: string;
  createdAt: string;
}

export interface DashboardWidget {
  id: string;
  type: "board" | "list" | "calendar" | "timeline" | "summary" | "charts" | "myday" | "workload";
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  filters?: Record<string, unknown>;
}

export interface Dashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
}
