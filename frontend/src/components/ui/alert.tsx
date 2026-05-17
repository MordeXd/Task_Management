import { cn } from "@/lib/utils";

export function Alert({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 text-sm",
        variant === "destructive" && "border-destructive/50 text-destructive bg-destructive/10",
        variant === "default" && "bg-background",
        className
      )}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />;
}



