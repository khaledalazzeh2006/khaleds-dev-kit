import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}

/** Small exclusive switch (e.g. Format | Minify, Windows | macOS). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex w-fit rounded-md border p-0.5", className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
            value === o.value && "bg-accent text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
