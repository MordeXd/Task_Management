import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z.string().min(8, "Min 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { password: string }) => {
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, password: data.password });
      toast.success("Password updated");
      navigate("/login");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Reset failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Set new password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>New password</Label>
              <Input type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{String(errors.password.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label>Confirm</Label>
              <Input type="password" {...register("confirm")} />
              {errors.confirm && <p className="text-sm text-destructive">{String(errors.confirm.message)}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Reset password"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



