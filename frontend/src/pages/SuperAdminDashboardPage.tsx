import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  employee_count: number;
  pending_tasks: number;
}

export function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/super-admin/admins").then(({ data }) => {
      setAdmins(data.admins);
      setLoading(false);
    });
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of all admins and their teams</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="text-sm px-3 py-1">Total Admins: {admins.length}</Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Total Employees: {admins.reduce((s, a) => s + a.employee_count, 0)}
        </Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Total Pending Tasks: {admins.reduce((s, a) => s + a.pending_tasks, 0)}
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : admins.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No admins found</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {admins.map((admin) => (
            <div key={admin.id} className="rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer p-4 space-y-3" onClick={() => navigate(`/super-admin/admins/${admin.id}/employees`)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{admin.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                </div>
                <Badge>Admin</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-muted p-2 text-center">
                  <p className="text-lg font-bold">{admin.employee_count}</p>
                  <p className="text-xs text-muted-foreground">Employees</p>
                </div>
                <div className="rounded-md bg-muted p-2 text-center">
                  <p className="text-lg font-bold text-amber-500">{admin.pending_tasks}</p>
                  <p className="text-xs text-muted-foreground">Pending Tasks</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
