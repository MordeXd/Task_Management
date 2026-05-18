import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { completeTask, createTask, deleteTask, fetchTasks, updateTask } from "@/store/tasksSlice";
import { fetchAdmins, fetchEmployees } from "@/store/usersSlice";
import type { Task, TaskLink } from "@/types";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.string().optional(),
  assigned_to: z.string().min(1),
});

export function TeamTasksPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((s) => s.tasks);
  const employees = useAppSelector((s) => s.users.employees);
  const admins = useAppSelector((s) => s.users.admins);
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState <Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "completed">("pending");
  const [links, setLinks] = useState<TaskLink[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"" | "low" | "medium" | "high">("");
  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchEmployees());
    if (user?.role === "super_admin") {
      dispatch(fetchAdmins());
    }
  }, [dispatch, user?.role]);

  const assigneeOptions =
    user?.role === "super_admin"
      ? [...admins, ...employees]
      : employees;
  
  const myAssignments = items.filter((t) => t.assigned_by === user?.id);

  const filtered = myAssignments.filter((t) => {
    // Filter by status
    if (statusFilter && t.status !== statusFilter) return false;
    // Filter by assignee
    if (assigneeFilter && t.assigned_to !== assigneeFilter) return false;
    // Filter by priority
    if (priorityFilter && t.priority !== priorityFilter) return false;
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = t.title.toLowerCase().includes(query);
      const matchesDesc = (t.description || "").toLowerCase().includes(query);
      if (!matchesTitle && !matchesDesc) return false;
    }
    return true;
  });

  const addLink = () => setLinks((prev) => [...prev, { url: "", title: "" }]);
  const updateLink = (i: number, field: keyof TaskLink, value: string) =>
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  const removeLink = (i: number) => setLinks((prev) => prev.filter((_, idx) => idx !== i));

  const resetForm = useCallback(() => {
    reset();
    setLinks([]);
    setEditTask(null);
  }, [reset]);

  const onCreate = async (data: z.infer<typeof schema>) => {
    const payload = { ...data, links: links.filter((l) => l.url) };
    const result = await dispatch(createTask(payload));
    if (createTask.fulfilled.match(result)) {
      toast.success("Task created");
      setOpen(false);
      resetForm();
    } else toast.error("Failed to create task");
  };

  const onEdit = async (data: z.infer<typeof schema>) => {
    if (!editTask) return;
    const payload = { id: editTask.id, ...data, links: links.filter((l) => l.url) };
    const result = await dispatch(updateTask(payload));
    if (updateTask.fulfilled.match(result)) {
      toast.success("Task updated");
      resetForm();
    } else toast.error("Failed to update task");
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setLinks(task.links || []);
    reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority as "low" | "medium" | "high" | undefined,
      due_date: task.due_date?.slice(0, 10) || "",
      assigned_to: task.assigned_to,
    });
  };

  return (
    <section className="space-y-4">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Team Tasks {user?.role === "super_admin" && <span className="text-sm font-normal text-muted-foreground">(Super Admin)</span>}</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button>Create Task</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <section><Label>Title</Label><Input {...register("title")} /></section>
              <section><Label>Description</Label><Input {...register("description")} /></section>
              <section><Label>Priority</Label>
                <select className="w-full border rounded-md h-11 px-3" {...register("priority")}>
                  <option value="">—</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </section>
              <section><Label>Due date</Label><Input type="date" {...register("due_date")} /></section>
              <section><Label>Assign to</Label>
                <select className="w-full border rounded-md h-11 px-3" {...register("assigned_to")}>
                  <option value="">Select assignee</option>
                  {assigneeOptions.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </section>
              <section><Label>Reference Links</Label>
                <div className="space-y-2">
                  {links.map((l, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <Input placeholder="Title" value={l.title || ""} onChange={(e) => updateLink(i, "title", e.target.value)} />
                        <Input placeholder="https://..." value={l.url} onChange={(e) => updateLink(i, "url", e.target.value)} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => removeLink(i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addLink}><Plus className="h-4 w-4 mr-1" />Add link</Button>
                </div>
              </section>
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </section>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
        <section className="flex-1 min-w-xs">
          <Label>Search tasks</Label>
          <Input
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1"
          />
        </section>
        <section className="w-full sm:w-auto">
          <Label>Status</Label>
          <select className="w-full sm:w-auto border rounded-md h-11 px-3 mt-1" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "" | "pending" | "completed")}>
            <option value="pending">Pending</option>
            <option value="">All</option>
            <option value="completed">Completed</option>
          </select>
        </section>
        <section className="w-full sm:w-auto">
          <Label>Priority</Label>
          <select
            className="w-full sm:w-auto border rounded-md h-11 px-3 mt-1"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as "" | "low" | "medium" | "high")}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </section>
        <section className="w-full sm:w-auto">
          <Label>Assignee</Label>
          <select className="w-full sm:w-auto border rounded-md h-11 px-3 mt-1" value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
            <option value="">All assignees</option>
            {assigneeOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id === user?.id ? `${e.name} (Me)` : `${e.name} (${e.role.replace("_", " ")})`}
              </option>
            ))}
          </select>
        </section>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? <Skeleton className="h-32 w-full col-span-full" /> : filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              title="No tasks found"
              description="Try adjusting your filters or create a new task"
              actionLabel="Create Task"
              onAction={() => setOpen(true)}
            />
          </div>
        ) : filtered.map((t) => (
          <div key={t.id} className="rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer p-4 space-y-3" onClick={() => navigate(`/tasks/${t.id}`)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.assigned_to_user?.name || "—"}</p>
              </div>
              <Badge variant={t.status === "completed" ? "default" : "secondary"} className="shrink-0">{t.status}</Badge>
            </div>
            {t.priority && <Badge variant="outline">{t.priority}</Badge>}
            {t.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(t.due_date).toLocaleDateString()}</p>}
            <div className="flex gap-1 flex-wrap pt-1" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" onClick={() => openEdit(t)}>Edit</Button>
              {t.status === "pending" && <Button size="sm" onClick={async () => { const r = await dispatch(completeTask(t.id)); if (completeTask.fulfilled.match(r)) toast.success("Completed"); else toast.error("Failed"); }}>Complete</Button>}
              <Button size="sm" variant="ghost" onClick={async () => { const r = await dispatch(deleteTask(t.id)); if (deleteTask.fulfilled.match(r)) toast.success("Task deleted"); else toast.error("Failed to delete"); }}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!editTask} onOpenChange={(v) => !v && setEditTask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit task</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onEdit)} className="space-y-4">
            <section><Label>Title</Label><Input {...register("title")} /></section>
            <section><Label>Description</Label><Input {...register("description")} /></section>
            <section><Label>Priority</Label>
              <select className="w-full border rounded-md h-11 px-3" {...register("priority")}>
                <option value="">—</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </section>
            <section><Label>Due date</Label><Input type="date" {...register("due_date")} /></section>
            <section><Label>Assign to</Label>
              <select className="w-full border rounded-md h-11 px-3" {...register("assigned_to")}>
                <option value="">Select assignee</option>
                {assigneeOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role.replace("_", " ")})
                  </option>
                ))}
              </select>
            </section>
            <section><Label>Reference Links</Label>
              <div className="space-y-2">
                {links.map((l, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <Input placeholder="Title" value={l.title || ""} onChange={(e) => updateLink(i, "title", e.target.value)} />
                      <Input placeholder="https://..." value={l.url} onChange={(e) => updateLink(i, "url", e.target.value)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => removeLink(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addLink}><Plus className="h-4 w-4 mr-1" />Add link</Button>
              </div>
            </section>
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
