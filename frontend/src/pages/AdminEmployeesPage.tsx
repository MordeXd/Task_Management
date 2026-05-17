import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";

interface EmployeeInfo {
  id: string;
  name: string;
  email: string;
  department?: string;
  pending_tasks: number;
  completed_tasks: number;
}

export function AdminEmployeesPage() {
  const { adminId } = useParams<{ adminId: string }>();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminId) return;
    api.get(`/api/super-admin/admins/${adminId}/employees`).then(({ data }) => {
      setEmployees(data.employees);
      setLoading(false);
    });
  }, [adminId]);

  return (
    <section className="space-y-6">
      <Link to="/super-admin/dashboard" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Admins
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Employees</h1>
        <p className="text-muted-foreground">Employees managed by this admin</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : employees.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No employees found for this admin</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => (
            <div key={emp.id} className="rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer p-4 space-y-3" onClick={() => navigate(`/super-admin/employees/${emp.id}`)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{emp.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                </div>
                <Badge variant="secondary">Employee</Badge>
              </div>
              {emp.department && <p className="text-xs text-muted-foreground">{emp.department}</p>}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-muted p-2 text-center">
                  <p className="text-lg font-bold text-amber-500">{emp.pending_tasks}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="rounded-md bg-muted p-2 text-center">
                  <p className="text-lg font-bold text-green-600">{emp.completed_tasks}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
