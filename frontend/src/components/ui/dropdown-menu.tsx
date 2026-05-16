import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <>{children}</>
}
DropdownMenu.displayName = "DropdownMenu"

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <button
        ref={ref}
        className={cn(
          "flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md">
            {React.Children.map(children, (child) =>
              React.isValidElement(child) && (child.props as any).__type === "trigger"
                ? (child.props as any).children
                : null
            )}
          </div>
        </>
      )}
    </>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md",
      className
    )}
    {...props}
  />
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-slate-200", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}