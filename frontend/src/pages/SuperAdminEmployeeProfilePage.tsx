import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";

export function SuperAdminEmployeeProfilePage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [emp, setEmp] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) return;
    api.get(`/api/auth/users/${employeeId}`).then(({ data }) => {
      setEmp(data.user);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [employeeId]);

  if (loading) return <Skeleton className="h-64 w-full max-w-lg" />;

  return (
    <section className="max-w-lg mx-auto space-y-6">
      <Link to={`/super-admin/employees/${employeeId}`} className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <Card>
        <CardHeader><CardTitle>Employee Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><span className="font-medium">Name:</span> {emp?.name as string || "—"}</div>
          <div><span className="font-medium">Email:</span> {emp?.email as string || "—"}</div>
          <div><span className="font-medium">Role:</span> {(emp?.role as string)?.replace("_", " ") || "—"}</div>
          <div><span className="font-medium">Department:</span> {(emp?.department as string) || "—"}</div>
          <div><span className="font-medium">Phone:</span> {(emp?.phone as string) || "—"}</div>
          <div><span className="font-medium">Active:</span> {emp?.is_active ? "Yes" : "No"}</div>
        </CardContent>
      </Card>
    </section>
  );
}
