import { forwardRef, createContext, useContext, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextType {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

export function Select({ children, onValueChange, defaultValue }: { children: ReactNode; onValueChange?: (value: string) => void; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue || "");
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onChange: (v) => { setValue(v); onValueChange?.(v); }, open, setOpen }}>
      {typeof children === "function" ? (children as (ctx: SelectContextType) => ReactNode)({ value, onChange: setValue, open, setOpen }) : children}
    </SelectContext.Provider>
  );
}

export const SelectTrigger = forwardRef<HTMLButtonElement, { children: ReactNode; className?: string; placeholder?: string }>(
  ({ className, children, placeholder, ...props }, ref) => {
    const ctx = useContext(SelectContext);
    if (!ctx) return null;
    return (
      <button ref={ref} type="button" onClick={() => ctx.setOpen(!ctx.open)}
        className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
        {children || <span className="text-muted-foreground">{placeholder}</span>}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return <span>{placeholder}</span>;
  return <span>{ctx.value || placeholder}</span>;
}

export function SelectContent({ children }: { children: ReactNode }) {
  const ctx = useContext(SelectContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div className="relative">
      <div className="absolute z-50 mt-1 w-full min-w-[8rem] rounded-md border bg-popover shadow-md">
        <div className="p-1">{children}</div>
      </div>
      <div className="fixed inset-0 z-40" onClick={() => ctx.setOpen(false)} />
    </div>
  );
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  return (
    <button type="button" onClick={() => { ctx.onChange(value); ctx.setOpen(false); }}
      className={cn("relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent", ctx.value === value && "bg-accent")}>
      {children}
    </button>
  );
}
