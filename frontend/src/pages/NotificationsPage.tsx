import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell, CheckCheck, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "@/store/notificationsSlice";
import { cn } from "@/lib/utils";

export function NotificationsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 100 }));
  }, [dispatch]);

  const handleClick = (n: NotificationItem) => {
    if (!n.read) dispatch(markAsRead(n.id));
    if (n.task_id) navigate(`/tasks/${n.task_id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        {items.some((n) => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(markAllAsRead())}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors hover:bg-accent",
                !n.read && "border-l-4 border-l-primary bg-accent/30 font-medium"
              )}
            >
              <div className="mb-0.5 text-xs text-muted-foreground">
                {n.title}
              </div>
              <div className="line-clamp-2">{n.message}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {formatTime(n.created_at)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  task_id?: string | null;
  created_at: string;
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
