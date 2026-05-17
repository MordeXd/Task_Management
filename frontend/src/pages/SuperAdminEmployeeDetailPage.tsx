import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import type { Task } from "@/types";

export function SuperAdminEmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Record<string, unknown> | null>(null);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "completed">("pending");

  useEffect(() => {
    if (!employeeId) return;
    api.get(`/api/super-admin/employees/${employeeId}`).then(({ data }) => {
      setEmployee(data.employee);
      setPendingTasks(data.pending_tasks);
      setCompletedTasks(data.completed_tasks);
      setLoading(false);
    });
  }, [employeeId]);

  if (loading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (!employee) return <p className="text-muted-foreground">Employee not found</p>;

  const tasks = tab === "pending" ? pendingTasks : completedTasks;

  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <Link to={`/super-admin/admins/${employee.created_by}/employees`} className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{employee.name as string}</CardTitle>
              <p className="text-sm text-muted-foreground">{employee.email as string}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`/super-admin/employees/${employeeId}/profile`}><User className="h-4 w-4 mr-1" />Profile</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {employee.department && <p><span className="font-medium">Department:</span> {employee.department as string}</p>}
          {employee.phone && <p><span className="font-medium">Phone:</span> {employee.phone as string}</p>}
          <div className="flex gap-2 pt-1">
            <Badge variant="secondary">Pending: {pendingTasks.length}</Badge>
            <Badge variant="default">Completed: {completedTasks.length}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-2">
            <Button size="sm" variant={tab === "pending" ? "default" : "outline"} onClick={() => setTab("pending")}>
              Pending ({pendingTasks.length})
            </Button>
            <Button size="sm" variant={tab === "completed" ? "default" : "outline"} onClick={() => setTab("completed")}>
              Completed ({completedTasks.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No {tab} tasks</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Link to={`/tasks/${t.id}`} className="font-medium text-sm hover:underline inline-flex items-center gap-1">
                      {t.title} <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Badge variant={t.status === "completed" ? "default" : "secondary"}>{t.status}</Badge>
                  </div>
                  {t.priority && <Badge variant="outline">{t.priority}</Badge>}
                  {t.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(t.due_date).toLocaleDateString()}</p>}
                  {t.completed_at && <p className="text-xs text-muted-foreground">Completed: {new Date(t.completed_at).toLocaleDateString()}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
