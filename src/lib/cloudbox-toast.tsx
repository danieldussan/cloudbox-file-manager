/* eslint-disable react-refresh/only-export-components */
import { toast } from "sonner"
import { Cloud, X } from "lucide-react"

type ToastVariant = "success" | "error" | "warning"

const variantStyles: Record<
  ToastVariant,
  { border: string; iconBg: string; iconColor: string }
> = {
  success: {
    border: "border-emerald-500/40",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  error: {
    border: "border-red-500/40",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
  },
  warning: {
    border: "border-amber-500/40",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
}

function CloudboxToastContent({
  id,
  title,
  description,
  variant,
}: {
  id: string | number
  title: string
  description?: string
  variant: ToastVariant
}) {
  const s = variantStyles[variant]
  return (
    <div
      className={`flex w-full max-w-sm gap-3 rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg ${s.border}`}
    >
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-md ${s.iconBg}`}
      >
        <Cloud className={`size-5 ${s.iconColor}`} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => toast.dismiss(id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="Cerrar"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function cloudboxToastSuccess(title: string, description?: string) {
  toast.custom(
    (t) => (
      <CloudboxToastContent
        id={t}
        title={title}
        description={description}
        variant="success"
      />
    ),
    { duration: 4500 }
  )
}

export function cloudboxToastError(title: string, description?: string) {
  toast.custom(
    (t) => (
      <CloudboxToastContent
        id={t}
        title={title}
        description={description}
        variant="error"
      />
    ),
    { duration: 6000 }
  )
}

/** Validaciones y avisos (tamaño de archivo, etc.) */
export function cloudboxToastWarning(title: string, description?: string) {
  toast.custom(
    (t) => (
      <CloudboxToastContent
        id={t}
        title={title}
        description={description}
        variant="warning"
      />
    ),
    { duration: 5500 }
  )
}
