import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchTasks } from "@/store/tasksSlice";

export function CompletedTasksPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((s) => s.tasks);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const completed = useMemo(() => {
    if (!user) return [];
    return items.filter((task) =>
      task.status === "completed" &&
      (task.assigned_to === user.id || task.assigned_by === user.id)
    );
  }, [items, user]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Completed Tasks</h1>
      {loading ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </section>
      ) : completed.length === 0 ? (
        <EmptyState
          title="No completed tasks"
          description="Tasks you complete will appear here"
          actionLabel="View Pending Tasks"
          onAction={() => navigate(user?.role === "admin" || user?.role === "super_admin" ? "/team-tasks" : "/my-tasks")}
        />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {completed.map((task) => (
            <Card key={task.id} className="flex flex-col">
              <CardHeader>
                <Link to={`/tasks/${task.id}`} className="hover:underline">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                </Link>
                <section className="flex gap-2 flex-wrap mt-2">
                  <Badge variant="success">completed</Badge>
                  {task.priority && <Badge variant="outline">{task.priority}</Badge>}
                </section>
              </CardHeader>
              <CardContent className="mt-auto space-y-2 text-sm text-muted-foreground">
                {task.assigned_to_user && <p>Assigned to: {task.assigned_to_user.name}</p>}
                {task.completed_at && <p>Completed: {new Date(task.completed_at).toLocaleDateString()}</p>}
                {task.completed_by_user && <p>By: {task.completed_by_user.name}</p>}
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </section>
  );
}
