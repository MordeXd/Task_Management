import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchTasks } from "@/store/tasksSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = {
  pending: "#f59e0b",
  completed: "#22c55e",
  low: "#3b82f6",
  medium: "#f59e0b",
  high: "#ef4444",
};

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.tasks);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const myTasks = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin" || user.role === "super_admin") {
      return items.filter((t) => t.assigned_by === user.id);
    }
    return items.filter((t) => t.assigned_to === user.id);
  }, [items, user]);

  const stats = useMemo(() => {
    const total = myTasks.length;
    const completed = myTasks.filter((t) => t.status === "completed").length;
    const pending = total - completed;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byPriority = {
      low: myTasks.filter((t) => t.priority === "low").length,
      medium: myTasks.filter((t) => t.priority === "medium").length,
      high: myTasks.filter((t) => t.priority === "high").length,
      none: myTasks.filter((t) => !t.priority).length,
    };

    const dueThisWeek = myTasks.filter((t) => {
      if (!t.due_date || t.status === "completed") return false;
      const due = new Date(t.due_date).getTime();
      const week = Date.now() + 7 * 24 * 60 * 60 * 1000;
      return due <= week;
    }).length;

    const overdue = myTasks.filter((t) => {
      if (!t.due_date || t.status === "completed") return false;
      return new Date(t.due_date).getTime() < Date.now();
    }).length;

    return { total, completed, pending, pct, byPriority, dueThisWeek, overdue };
  }, [myTasks]);

  const statusData = [
    { name: "Pending", value: stats.pending, color: COLORS.pending },
    { name: "Completed", value: stats.completed, color: COLORS.completed },
  ];

  const priorityData = [
    { name: "High", value: stats.byPriority.high, color: COLORS.high },
    { name: "Medium", value: stats.byPriority.medium, color: COLORS.medium },
    { name: "Low", value: stats.byPriority.low, color: COLORS.low },
    { name: "None", value: stats.byPriority.none, color: "#9ca3af" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground -mt-4">Welcome back, {user?.name}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-green-600">{stats.completed}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-amber-500">{stats.pending}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{stats.pct}%</p></CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Due This Week</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-blue-600">{stats.dueThisWeek}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-red-600">{stats.overdue}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-red-500">{stats.byPriority.high}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Medium Priority</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-amber-500">{stats.byPriority.medium}</p></CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No tasks yet</p>
            ) : (
              <div className="flex items-center justify-center gap-8">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                      {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 text-sm">
                  {statusData.map((e) => (
                    <div key={e.name} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full inline-block" style={{ backgroundColor: e.color }} />
                      <span>{e.name}: <strong>{e.value}</strong> ({e.value > 0 ? Math.round((e.value / stats.total) * 100) : 0}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Priority Distribution</CardTitle></CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No tasks yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(user?.role === "admin" || user?.role === "employee") && (
          <Card><CardHeader><CardTitle>My Tasks</CardTitle></CardHeader><CardContent><Button asChild><Link to="/my-tasks">View tasks</Link></Button></CardContent></Card>
        )}
        {(user?.role === "admin" || user?.role === "super_admin") && (
          <Card><CardHeader><CardTitle>Team Tasks</CardTitle></CardHeader><CardContent><Button asChild><Link to="/team-tasks">Manage team</Link></Button></CardContent></Card>
        )}
        <Card><CardHeader><CardTitle>Completed Tasks</CardTitle></CardHeader><CardContent><Button asChild><Link to="/completed-tasks">View completed</Link></Button></CardContent></Card>
        {(user?.role === "admin" || user?.role === "super_admin" || user?.role === "employee") && (
          <Card><CardHeader><CardTitle>Group Tasks</CardTitle></CardHeader><CardContent><Button asChild><Link to="/group-tasks">View group tasks</Link></Button></CardContent></Card>
        )}
        <Card><CardHeader><CardTitle>Completed Group</CardTitle></CardHeader><CardContent><Button asChild><Link to="/completed-group-tasks">View completed</Link></Button></CardContent></Card>
        {user?.role === "super_admin" && (
          <Card><CardHeader><CardTitle>Admins</CardTitle></CardHeader><CardContent><Button asChild><Link to="/super-admin">Manage admins</Link></Button></CardContent></Card>
        )}
        {user?.role === "admin" && (
          <Card><CardHeader><CardTitle>Employees</CardTitle></CardHeader><CardContent><Button asChild><Link to="/admin">Manage employees</Link></Button></CardContent></Card>
        )}
      </div>
    </div>
  );
}
