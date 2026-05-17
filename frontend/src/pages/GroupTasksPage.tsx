import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Link2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchGroupTasks,
  createGroupTask,
  updateGroupTask,
  completeGroupTask,
  deleteGroupTask,
} from "@/store/groupTasksSlice";
import { fetchEmployees, fetchAdmins } from "@/store/usersSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { GroupTask } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  priority: z.string().optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
});

export function GroupTasksPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.groupTasks);
  const user = useAppSelector((s) => s.auth.user);
  const employees = useAppSelector((s) => s.users.employees);
  const admins = useAppSelector((s) => s.users.admins);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [links, setLinks] = useState<{ url: string; title?: string }[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    dispatch(fetchGroupTasks());
    dispatch(fetchEmployees());
    if (user?.role === "super_admin") dispatch(fetchAdmins());
  }, [dispatch, user]);

  const pendingGroupTasks = items.filter((t) => t.status === "pending");
  const availableUsers = user?.role === "super_admin" ? [...admins, ...employees] : employees;

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addLink = () => {
    if (!linkUrl.trim()) return;
    setLinks((prev) => [...prev, { url: linkUrl.trim(), title: linkTitle.trim() || undefined }]);
    setLinkUrl("");
    setLinkTitle("");
  };
  const removeLink = (i: number) => setLinks((prev) => prev.filter((_, idx) => idx !== i));

  const onAdd = async (data: Record<string, string>) => {
    if (selectedIds.length < 2) { toast.error("Select at least 2 members"); return; }
    const payload: Record<string, unknown> = {
      title: data.title,
      description: data.description || undefined,
      assigned_to: selectedIds,
      links: links.length > 0 ? links : undefined,
    };
    if (data.priority) payload.priority = data.priority;
    if (data.due_date) payload.due_date = data.due_date;
    const result = await dispatch(createGroupTask(payload as Parameters<typeof createGroupTask>[0]));
    if (createGroupTask.fulfilled.match(result)) {
      toast.success("Group task created");
      setOpen(false);
      reset();
      setSelectedIds([]);
      setLinks([]);
    } else toast.error("Failed to create");
  };

  const onEdit = async (data: Record<string, string>) => {
    if (!editId) return;
    const payload: Record<string, unknown> = {
      id: editId,
      title: data.title,
      description: data.description || undefined,
    };
    if (selectedIds.length >= 2) payload.assigned_to = selectedIds;
    if (data.priority) payload.priority = data.priority;
    if (data.due_date) payload.due_date = data.due_date;
    if (links.length > 0) payload.links = links;
    const result = await dispatch(updateGroupTask(payload as Parameters<typeof updateGroupTask>[0]));
    if (updateGroupTask.fulfilled.match(result)) {
      toast.success("Group task updated");
      setEditId(null);
      reset();
      setSelectedIds([]);
      setLinks([]);
    } else toast.error("Failed to update group task");
  };

  const openEdit = (t: GroupTask) => {
    setEditId(t.id);
    setSelectedIds(t.assigned_to);
    setLinks(t.links || []);
    reset({ title: t.title, description: t.description || "", priority: t.priority || "", due_date: t.due_date || "" });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Group Tasks</h1>
          <p className="text-muted-foreground">Tasks shared across multiple team members</p>
        </div>
        {(user?.role === "admin" || user?.role === "super_admin") && (
          <Button onClick={() => { setOpen(true); reset(); setSelectedIds([]); setLinks([]); }}>
            <Plus className="h-4 w-4 mr-1" /> New Group Task
          </Button>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Pending Group Tasks</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : pendingGroupTasks.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No pending group tasks</p>
          ) : (
            <div className="space-y-3">
              {pendingGroupTasks.map((t) => (
                <div key={t.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/group-tasks/${t.id}`} className="font-semibold hover:underline">{t.title}</Link>
                      {t.priority && <Badge variant="outline" className="ml-2">{t.priority}</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(t)}>Edit</Button>
                      <Button size="sm" variant="default" onClick={async () => { const r = await dispatch(completeGroupTask(t.id)); if (completeGroupTask.fulfilled.match(r)) toast.success("Completed"); else toast.error("Failed"); }}>Complete</Button>
                      <Button size="sm" variant="destructive" onClick={async () => { if (confirm("Delete?")) { const r = await dispatch(deleteGroupTask(t.id)); if (deleteGroupTask.fulfilled.match(r)) toast.success("Deleted"); else toast.error("Failed to delete"); } }}>Delete</Button>
                    </div>
                  </div>
                  {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {t.assigned_to_users?.map((u) => (
                      <Badge key={u.id} variant="secondary">{u.name}</Badge>
                    ))}
                  </div>
                  {t.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(t.due_date).toLocaleDateString()}</p>}
                  {(t.pdfs?.length || t.images?.length) ? <p className="text-xs text-muted-foreground">{((t.pdfs?.length || 0) + (t.images?.length || 0))} file(s)</p> : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); reset(); setSelectedIds([]); setLinks([]); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Group Task</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input {...register("title")} placeholder="Group task title" />
              {errors.title && <p className="text-sm text-destructive">{String(errors.title.message)}</p>}
            </div>
            <div>
              <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea {...register("description")} placeholder="Task details" />
            </div>
            <div>
              <Label>Priority <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <select {...register("priority")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <Label>Due Date <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input type="date" {...register("due_date")} />
            </div>
            <div>
              <Label>Members <span className="text-muted-foreground font-normal">(select at least 2)</span></Label>
              <div className="flex flex-wrap gap-1.5 mt-1 max-h-28 overflow-y-auto border rounded-md p-2">
                {availableUsers.filter((u) => u.is_active !== false).map((u) => (
                  <button key={u.id} type="button" onClick={() => toggleUser(u.id)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${selectedIds.includes(u.id) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}>
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Reference Links <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <div className="flex gap-1 mt-1">
                <Input placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                <Input placeholder="Title (optional)" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} className="w-28 shrink-0" />
                <Button type="button" size="sm" variant="outline" onClick={addLink}><Link2 className="h-4 w-4" /></Button>
              </div>
              {links.length > 0 && (
                <div className="mt-2 space-y-1">
                  {links.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-muted px-2 py-1 rounded">
                      <a href={l.url} target="_blank" rel="noreferrer" className="text-primary truncate">{l.title || l.url}</a>
                      <button type="button" onClick={() => removeLink(i)}><Trash2 className="h-3 w-3 text-destructive" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full">Create Group Task</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editId} onOpenChange={(v) => { if (!v) { setEditId(null); reset(); setSelectedIds([]); setLinks([]); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Group Task</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onEdit)} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{String(errors.title.message)}</p>}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea {...register("description")} />
            </div>
            <div>
              <Label>Priority</Label>
              <select {...register("priority")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" {...register("due_date")} />
            </div>
            <div>
              <Label>Members</Label>
              <div className="flex flex-wrap gap-1.5 mt-1 max-h-28 overflow-y-auto border rounded-md p-2">
                {availableUsers.filter((u) => u.is_active !== false).map((u) => (
                  <button key={u.id} type="button" onClick={() => toggleUser(u.id)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${selectedIds.includes(u.id) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}>
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Reference Links</Label>
              <div className="flex gap-1 mt-1">
                <Input placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                <Input placeholder="Title" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} className="w-28 shrink-0" />
                <Button type="button" size="sm" variant="outline" onClick={addLink}><Link2 className="h-4 w-4" /></Button>
              </div>
              {links.length > 0 && (
                <div className="mt-2 space-y-1">
                  {links.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-muted px-2 py-1 rounded">
                      <a href={l.url} target="_blank" rel="noreferrer" className="text-primary truncate">{l.title || l.url}</a>
                      <button type="button" onClick={() => removeLink(i)}><Trash2 className="h-3 w-3 text-destructive" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
