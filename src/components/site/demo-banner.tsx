import { Info } from "lucide-react";
export function DemoBanner() {
  return (
    <div className="bg-ink text-ink-foreground">
      <p className="container-page flex items-start gap-2 py-2 text-xs leading-5 sm:items-center sm:text-sm">
        <Info className="mt-0.5 size-4 shrink-0 sm:mt-0" aria-hidden />
        <span>
          <strong>Demo mode.</strong> Sample menu and prices. No real orders, payments or deliveries are processed.
        </span>
      </p>
    </div>
  );
}
