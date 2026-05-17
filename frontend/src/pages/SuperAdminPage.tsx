import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { createAdmin, deactivateUser, fetchAdmins, updateUser } from "@/store/usersSlice";

const schema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6, "Min 6 chars").optional().or(z.literal("")), department: z.string().optional().or(z.literal("")) });

export function SuperAdminPage() {
  const dispatch = useAppDispatch();
  const { admins, loading } = useAppSelector((s) => s.users);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  const onAdd = async (data: { name: string; email: string; password?: string; department?: string }) => {
    const payload = { ...data };
    if (!payload.password) delete payload.password;
    if (!payload.department) delete payload.department;
    const result = await dispatch(createAdmin(payload));
    if (createAdmin.fulfilled.match(result)) {
      toast.success(`Admin created. Password: ${result.payload.temporary_password}`);
      setOpen(false);
      reset();
    } else toast.error("Failed to create admin");
  };

  const onEdit = async (data: { name: string; email: string; department?: string }) => {
    if (!editId) return;
    const payload: Record<string, unknown> = { id: editId, name: data.name, email: data.email };
    if (data.department) payload.department = data.department;
    await dispatch(updateUser(payload as Parameters<typeof updateUser>[0]));
    toast.success("Admin updated");
    setEditId(null);
    reset();
  };

  return (
    <section className="space-y-4">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Manage Admins</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Add Admin</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New admin</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
              <div><Label>Name</Label><Input {...register("name")} /></div>
              <div><Label>Email</Label><Input type="email" {...register("email")} /></div>
              {errors.email && <p className="text-sm text-destructive">{String(errors.email.message)}</p>}
              <div><Label>Password <span className="text-muted-foreground font-normal">(optional — auto-generated if empty)</span></Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} {...register("password")} placeholder="Min 6 characters" className="pr-10" />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {errors.password && <p className="text-sm text-destructive">{String(errors.password.message)}</p>}
              <div><Label>Department <span className="text-muted-foreground font-normal">(optional)</span></Label><Input {...register("department")} placeholder="e.g. Engineering" /></div>
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </section>
      <Card>
        <CardHeader><CardTitle>Admins</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : admins.length === 0 ? (
            <p className="text-muted-foreground">No admins yet. Add your first admin.</p>
          ) : (
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Department</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.email}</td>
                    <td className="p-2 text-muted-foreground">{a.department || "—"}</td>
                    <td className="p-2 flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => { setEditId(a.id); reset({ name: a.name, email: a.email, department: a.department || "" }); }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm("Deactivate?")) { dispatch(deactivateUser(a.id)); toast.success("Deactivated"); } }}>Deactivate</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!editId} onOpenChange={(v) => !v && setEditId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit admin</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onEdit)} className="space-y-4">
            <div><Label>Name</Label><Input {...register("name")} /></div>
            <div><Label>Email</Label><Input {...register("email")} /></div>
            <div><Label>Department</Label><Input {...register("department")} placeholder="e.g. Engineering" /></div>
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
