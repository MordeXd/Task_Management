import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ email: z.string().email() });

export function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", data);
      setDone(true);
      toast.success("Check your email for reset instructions");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>We will send a reset link if the account exists</CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <p className="text-sm text-muted-foreground">If an account exists, a reset link has been sent.</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{String(errors.email.message)}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm"><Link to="/login" className="text-primary hover:underline">Back to login</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}



