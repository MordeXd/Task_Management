import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { completeTask, fetchTasks } from "@/store/tasksSlice";

export function MyTasksPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.tasks);
  const user = useAppSelector((s) => s.auth.user);
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "short">("all");

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const myTasks = useMemo(() => {
    if (!user) return [];
    return items.filter((task) => task.assigned_to === user.id && task.status !== "completed");
  }, [items, user]);

  const isShortTask = (task: typeof items[number]) => {
    if (!task.due_date || task.status !== "pending") return false;
    const due = new Date(task.due_date).getTime();
    const now = Date.now();
    const days = (due - now) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 3;
  };

  const filtered = useMemo(() => {
    const base = myTasks;
    if (filter === "all") return base;
    if (filter === "short") return base.filter(isShortTask);
    return base.filter((t) => t.status === filter);
  }, [myTasks, filter]);

  const handleComplete = async (id: string) => {
    const result = await dispatch(completeTask(id));
    if (completeTask.fulfilled.match(result)) toast.success("Task completed");
    else toast.error("Failed to complete task");
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">My Tasks</h1>
      <section className="flex gap-2 flex-wrap">
        {(["all", "pending", "short"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "short" ? "Short" : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </section>
      {loading ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </section>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No tasks assigned yet</CardContent></Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((task) => (
            <Card key={task.id} className="flex flex-col">
              <CardHeader>
                <Link to={`/tasks/${task.id}`} className="hover:underline">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                </Link>
                <section className="flex gap-2 flex-wrap mt-2">
                  <Badge variant={task.status === "completed" ? "success" : "secondary"}>{task.status}</Badge>
                  {task.priority && <Badge variant="outline">{task.priority}</Badge>}
                </section>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                {task.due_date && <p className="text-sm text-muted-foreground">Due: {new Date(task.due_date).toLocaleDateString()}</p>}
                {task.status === "pending" && (
                  <Button className="w-full" onClick={() => handleComplete(task.id)}>Mark Complete</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </section>
  );
}
