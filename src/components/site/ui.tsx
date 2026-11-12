import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-[6px] font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border border-input bg-card text-foreground hover:bg-secondary",
        ghost: "text-foreground hover:bg-secondary",
        ink: "bg-ink text-ink-foreground hover:bg-ink/90",
        danger: "border border-destructive/40 bg-card text-destructive hover:bg-destructive/10",
        link: "text-primary underline-offset-4 hover:underline px-0",
      },
      size: { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  loading?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...p }, ref) => (
    <button ref={ref} className={cn(buttonStyles({ variant, size }), className)} disabled={disabled || loading} {...p}>
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export function VegMark({ isVeg, className }: { isVeg: boolean; className?: string }) {
  return (
    <span
      role="img"
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-[2px] border-2 bg-card",
        isVeg ? "border-veg" : "border-nonveg",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", isVeg ? "bg-veg" : "bg-nonveg")} />
    </span>
  );
}

export function DemoTag({ children = "Demo" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[4px] border border-warning-foreground/30 bg-warning px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-warning-foreground">
      {children}
    </span>
  );
}

export function PageHeader({ title, intro, eyebrow }: { title: string; intro?: ReactNode; eyebrow?: string }) {
  return (
    <header className="border-b bg-secondary/60">
      <div className="container-page py-10 md:py-14">
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h1 className="text-4xl font-semibold md:text-5xl">{title}</h1>
        {intro && <div className="mt-3 max-w-2xl text-muted-foreground">{intro}</div>}
      </div>
    </header>
  );
}

export function StateBlock({
  kind, title, children, action,
}: { kind: "loading" | "empty" | "error" | "info"; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className="flex flex-col items-center rounded-lg border border-dashed bg-card px-6 py-12 text-center"
    >
      {kind === "loading" && <Loader2 className="mb-3 size-6 animate-spin text-primary" aria-hidden />}
      {kind === "error" && <AlertTriangle className="mb-3 size-6 text-destructive" aria-hidden />}
      <h2 className="text-xl font-semibold">{title}</h2>
      {children && <div className="mt-2 max-w-md text-sm text-muted-foreground">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function QtyStepper({
  qty, onChange, name, max = 20,
}: { qty: number; onChange: (q: number) => void; name: string; max?: number }) {
  return (
    <div className="inline-flex h-10 items-center rounded-[6px] border border-input bg-card" role="group" aria-label={`Quantity of ${name}`}>
      <button type="button" className="h-full w-10 rounded-l-[6px] text-lg hover:bg-secondary" onClick={() => onChange(qty - 1)} aria-label={`Decrease ${name}`}>−</button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{qty}</span>
      <button type="button" className="h-full w-10 rounded-r-[6px] text-lg hover:bg-secondary disabled:opacity-40" onClick={() => onChange(qty + 1)} disabled={qty >= max} aria-label={`Increase ${name}`}>+</button>
    </div>
  );
}

export const fieldClass =
  "h-11 w-full rounded-[6px] border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-3 focus-visible:outline-ring aria-[invalid=true]:border-destructive";
