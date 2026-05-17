import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    old_password: z.string().min(1),
    new_password: z.string().min(8),
    confirm: z.string(),
  })
  .refine((d) => d.new_password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

export function ChangePasswordPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { old_password: string; new_password: string }) => {
    setLoading(true);
    try {
      await api.post("/api/auth/change-password", {
        old_password: data.old_password,
        new_password: data.new_password,
      });
      toast.success("Password changed");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Current password</Label>
            <Input type="password" {...register("old_password")} />
          </div>
          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" {...register("new_password")} />
            {errors.new_password && <p className="text-sm text-destructive">{String(errors.new_password.message)}</p>}
          </div>
          <div className="space-y-2">
            <Label>Confirm</Label>
            <Input type="password" {...register("confirm")} />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Update password"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}


