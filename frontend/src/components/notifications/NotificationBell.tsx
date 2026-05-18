import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/store/notificationsSlice";

export function NotificationBell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, unreadCount } = useAppSelector((s) => s.notifications);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    dispatch(fetchNotifications({ limit: 20 }));
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPosition({ top: rect.top, left: rect.right + 8 });
    }
    setOpen((prev) => {
      if (!prev) dispatch(fetchNotifications({ limit: 20 }));
      return !prev;
    });
  };

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.read) dispatch(markAsRead(n.id));
    setOpen(false);
    if (n.task_id) navigate(`/tasks/${n.task_id}`);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <>
      <Button
        ref={btnRef}
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          ref={dropdownRef}
          className="fixed z-[100] w-80 rounded-lg border bg-popover shadow-md"
          style={{ top: position.top, left: position.left }}
        >
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setOpen(false); navigate("/notifications"); }}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "w-full border-b px-4 py-3 text-left text-sm transition-colors hover:bg-accent last:border-b-0",
                    !n.read && "bg-accent/50 font-medium"
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
              ))
            )}
          </div>
          {items.length > 0 && (
            <div className="border-t px-4 py-2">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </>
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
