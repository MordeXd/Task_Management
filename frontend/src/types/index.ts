export type UserRole = "super_admin" | "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company_id: string | null;
  is_active?: boolean;
  department?: string;
  profile_picture?: string;
  phone?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
  assigned_to: string;
  assigned_by: string;
  company_id: string;
  completed_at?: string | null;
  completed_by?: string | null;
  created_at?: string;
  updated_at?: string;
  pdfs?: Attachment[];
  images?: Attachment[];
  links?: TaskLink[];
  assigned_to_user?: { id: string; name: string; email: string };
  assigned_by_user?: { id: string; name: string; email: string };
  completed_by_user?: { id: string; name: string; email: string };
}

export interface Attachment {
  name: string;
  path: string;
}

export interface TaskLink {
  url: string;
  title?: string;
}

export type NotificationType = "task_assigned" | "task_completed" | "task_updated" | "task_deleted" | "info";

export interface GroupTask {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
  assigned_to: string[];
  assigned_by: string;
  company_id: string;
  completed_at?: string | null;
  completed_by?: string | null;
  created_at?: string;
  updated_at?: string;
  pdfs?: Attachment[];
  images?: Attachment[];
  links?: TaskLink[];
  assigned_to_users?: { id: string; name: string; email: string }[];
  assigned_by_user?: { id: string; name: string; email: string };
  completed_by_user?: { id: string; name: string; email: string };
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  task_id?: string | null;
  read: boolean;
  created_at: string;
}

