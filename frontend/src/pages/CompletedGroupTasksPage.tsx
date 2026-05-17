import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchGroupTasks } from "@/store/groupTasksSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function CompletedGroupTasksPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((s) => s.groupTasks);

  useEffect(() => {
    dispatch(fetchGroupTasks());
  }, [dispatch]);

  const completed = items.filter((t) => t.status === "completed");

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Completed Group Tasks</h1>
        <p className="text-muted-foreground">Group tasks that have been finished</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Completed Group Tasks</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : completed.length === 0 ? (
            <EmptyState
              title="No completed group tasks"
              description="Group tasks your team completes will appear here"
              actionLabel="View Group Tasks"
              onAction={() => navigate("/group-tasks")}
            />
          ) : (
            <div className="space-y-3">
              {completed.map((t) => (
                <div key={t.id} className="rounded-lg border p-4 space-y-2 opacity-80">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/group-tasks/${t.id}`} className="font-semibold hover:underline">{t.title}</Link>
                      <Badge variant="outline" className="ml-2 text-green-600 border-green-600">Completed</Badge>
                    </div>
                    {t.completed_at && (
                      <span className="text-xs text-muted-foreground">{new Date(t.completed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {t.assigned_to_users?.map((u) => (
                      <Badge key={u.id} variant="secondary">{u.name}</Badge>
                    ))}
                  </div>
                  {t.completed_by_user && (
                    <p className="text-xs text-muted-foreground">Completed by: {t.completed_by_user.name}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
