import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink, FileImage, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { clearCurrent, completeTask, deleteTask, fetchTaskById } from "@/store/tasksSlice";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const task = useAppSelector((s) => s.tasks.current);
  const user = useAppSelector((s) => s.auth.user);
  const [uploading, setUploading] = useState<"pdf" | "image" | null>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) dispatch(fetchTaskById(id));
    return () => { dispatch(clearCurrent()); };
  }, [dispatch, id]);

  const canComplete =
    task?.status === "pending" &&
    (task.assigned_to === user?.id || user?.role === "admin" || user?.role === "super_admin");

  const canEdit = user?.role === "admin" || user?.role === "super_admin";

  const handleComplete = async () => {
    if (!id) return;
    await dispatch(completeTask(id));
    toast.success("Task completed");
    navigate(-1);
  };

  const handleDelete = async () => {
    if (!id) return;
    await dispatch(deleteTask(id));
    toast.success("Task deleted");
    navigate(-1);
  };

  const uploadFile = async (category: "pdf" | "image", file: File) => {
    if (!id) return;
    setUploading(category);
    try {
      const form = new FormData();
      form.append("file", file);
      await api.post(`/api/upload/${id}/${category}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${category === "pdf" ? "PDF" : "Image"} uploaded`);
      dispatch(fetchTaskById(id));
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(null);
    }
  };

  if (!task) return <Skeleton className="h-64 w-full max-w-2xl mx-auto" />;

  return (
    <section className="max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <section className="flex gap-2 mt-2">
            <Badge>{task.status}</Badge>
            {task.priority && <Badge variant="outline">{task.priority}</Badge>}
          </section>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>{task.description || "No description"}</p>
          <p><strong>Assigned to:</strong> {task.assigned_to_user?.name} ({task.assigned_to_user?.email})</p>
          <p><strong>Assigned by:</strong> {task.assigned_by_user?.name || "—"}</p>
          {task.due_date && <p><strong>Due:</strong> {new Date(task.due_date).toLocaleString()}</p>}
          {task.completed_at && (
            <p><strong>Completed:</strong> {new Date(task.completed_at).toLocaleString()} by {task.completed_by_user?.name || "—"}</p>
          )}

          {(task.links && task.links.length > 0) && (
            <section>
              <strong className="block mb-1">Reference Links</strong>
              <ul className="space-y-1">
                {task.links.map((l, i) => (
                  <li key={i}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" />
                      {l.title || l.url}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(task.pdfs && task.pdfs.length > 0) && (
            <section>
              <strong className="block mb-1">PDFs</strong>
              <ul className="space-y-1">
                {task.pdfs.map((p, i) => (
                  <li key={i}>
                    <a href={`/uploads/${p.path}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      <FileText className="h-3 w-3" />
                      {p.name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(task.images && task.images.length > 0) && (
            <section>
              <strong className="block mb-1">Images</strong>
              <div className="flex flex-wrap gap-2">
                {task.images.map((img, i) => (
                  <a key={i} href={`/uploads/${img.path}`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`/uploads/${img.path}`}
                      alt={img.name}
                      className="h-24 w-24 rounded-md border object-cover hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {canEdit && (
            <section className="border-t pt-4">
              <strong className="block mb-2">Attach Files</strong>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled={uploading === "pdf"} onClick={() => pdfRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-1" />
                  {uploading === "pdf" ? "Uploading..." : "Upload PDF"}
                </Button>
                <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile("pdf", f); e.target.value = ""; }} />
                <Button type="button" variant="outline" size="sm" disabled={uploading === "image"} onClick={() => imgRef.current?.click()}>
                  <FileImage className="h-4 w-4 mr-1" />
                  {uploading === "image" ? "Uploading..." : "Upload Image"}
                </Button>
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile("image", f); e.target.value = ""; }} />
              </div>
            </section>
          )}

          <div className="flex gap-2 flex-wrap pt-2">
            {canComplete && <Button onClick={handleComplete}>Mark Complete</Button>}
            {canEdit && <Button variant="destructive" onClick={handleDelete}>Delete Task</Button>}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
