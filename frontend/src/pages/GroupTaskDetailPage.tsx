import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Link2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchGroupTaskById, completeGroupTask, clearCurrent } from "@/store/groupTasksSlice";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export function GroupTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { current: task, loading } = useAppSelector((s) => s.groupTasks);
  const user = useAppSelector((s) => s.auth.user);
  const pdfRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) dispatch(fetchGroupTaskById(id));
    return () => { dispatch(clearCurrent()); };
  }, [id, dispatch]);

  const upload = async (category: "pdf" | "image") => {
    const input = category === "pdf" ? pdfRef : imgRef;
    const file = input.current?.files?.[0];
    if (!file || !id) return;
    const form = new FormData();
    form.append("file", file);
    try {
      await api.post(`/api/upload/group-task/${id}/${category}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("File uploaded");
      dispatch(fetchGroupTaskById(id));
      if (input.current) input.current.value = "";
    } catch {
      toast.error("Upload failed");
    }
  };

  if (loading || !task) return <Skeleton className="h-64 w-full" />;

  const canComplete = user?.role === "admin" || user?.role === "super_admin" || task.assigned_to.includes(user?.id || "");

  return (
    <section className="space-y-6 max-w-3xl">
      <Link to="/group-tasks" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Group Tasks
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{task.title}</CardTitle>
            {task.priority && <Badge variant="outline" className="mt-1">{task.priority}</Badge>}
          </div>
          <Badge variant={task.status === "completed" ? "default" : "secondary"}>
            {task.status === "completed" ? "Completed" : "Pending"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && <p className="text-muted-foreground">{task.description}</p>}

          <div>
            <h4 className="text-sm font-medium mb-1">Members</h4>
            <div className="flex flex-wrap gap-1.5">
              {task.assigned_to_users?.map((u) => (
                <Badge key={u.id} variant="secondary">{u.name}</Badge>
              ))}
            </div>
          </div>

          {task.due_date && (
            <p className="text-sm"><span className="font-medium">Due:</span> {new Date(task.due_date).toLocaleDateString()}</p>
          )}
          {task.completed_at && (
            <p className="text-sm"><span className="font-medium">Completed:</span> {new Date(task.completed_at).toLocaleDateString()}</p>
          )}
          {task.completed_by_user && (
            <p className="text-sm"><span className="font-medium">Completed by:</span> {task.completed_by_user.name}</p>
          )}

          {task.links && task.links.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Reference Links</h4>
              <div className="space-y-1">
                {task.links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Link2 className="h-3 w-3" />{l.title || l.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Files</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {task.pdfs && task.pdfs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">PDFs</h4>
              <div className="space-y-1">
                {task.pdfs.map((f, i) => (
                  <a key={i} href={`/uploads/${f.path}`} target="_blank" rel="noreferrer"
                    className="block text-sm text-primary hover:underline truncate">{f.name}</a>
                ))}
              </div>
            </div>
          )}
          {task.images && task.images.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Images</h4>
              <div className="grid grid-cols-3 gap-2">
                {task.images.map((f, i) => (
                  <a key={i} href={`/uploads/${f.path}`} target="_blank" rel="noreferrer">
                    <img src={`/uploads/${f.path}`} alt={f.name} className="rounded border object-cover h-24 w-full" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {(user?.role === "admin" || user?.role === "super_admin") && task.status === "pending" && (
            <div className="flex gap-2">
              <div>
                <Button size="sm" variant="outline" onClick={() => pdfRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-1" /> Upload PDF
                </Button>
                <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={() => upload("pdf")} />
              </div>
              <div>
                <Button size="sm" variant="outline" onClick={() => imgRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-1" /> Upload Image
                </Button>
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={() => upload("image")} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {task.status === "pending" && canComplete && (
        <Button className="w-full" onClick={async () => {
          const result = await dispatch(completeGroupTask(task.id));
          if (completeGroupTask.fulfilled.match(result)) toast.success("Group task completed");
          else toast.error("Failed to complete group task");
        }}>
          Mark as Completed
        </Button>
      )}
    </section>
  );
}
