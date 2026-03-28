import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  formatBytesToReadable,
  formatEtagForDisplay,
  type FileRow,
  type Protocol,
} from "@/api/client"
import { ProtocolBadge } from "@/components/cloudbox/protocol-badge"
import { useAuthStore } from "@/stores/auth-store"

type FileDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileRow | null
  onDownload?: (file: FileRow) => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-white/10 py-2.5 last:border-0 sm:grid-cols-[minmax(0,9rem)_1fr] sm:gap-3">
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="text-sm font-medium tracking-tight break-all text-slate-50">
        {value}
      </dd>
    </div>
  )
}

export function FileDetailsDialog({
  open,
  onOpenChange,
  file,
  onDownload,
}: FileDetailsDialogProps) {
  const sessionUsername = useAuthStore((state) => state.username)

  const rows: { label: string; value: string }[] = file
    ? [
        { label: "Protocolo", value: file.protocol },
        { label: "Ruta", value: file.path || "—" },
        { label: "Tamaño", value: file.size },
        { label: "Última modificación", value: file.modified },
      ]
    : []

  if (file) {
    if (file.extension) rows.push({ label: "Extensión", value: file.extension })
    if (file.mimeType) rows.push({ label: "Tipo MIME", value: file.mimeType })
    {
      const etagText = formatEtagForDisplay(file.etag)
      if (etagText) rows.push({ label: "ETag", value: etagText })
    }
    if (file.directory !== null && file.directory !== undefined) {
      rows.push({ label: "Es directorio", value: file.directory ? "Sí" : "No" })
    }
    if (file.bucketName) rows.push({ label: "Bucket", value: file.bucketName })
    rows.push({
      label: "Propietario",
      value: sessionUsername?.trim() || "—",
    })
    if (file.group) rows.push({ label: "Grupo", value: file.group })
    if (file.creationTime)
      rows.push({ label: "Creación", value: file.creationTime })
    if (file.lastAccessTime)
      rows.push({ label: "Último acceso", value: file.lastAccessTime })
    if (file.allocationSize != null) {
      rows.push({
        label: "Tamaño asignado",
        value: formatBytesToReadable(file.allocationSize),
      })
    }
  }

  return (
    <Dialog open={open && !!file} onOpenChange={onOpenChange}>
      {file ? (
        <DialogContent
          overlayClassName="bg-slate-950/55 backdrop-blur-md supports-backdrop-filter:backdrop-blur-md"
          className="max-h-[85vh] overflow-y-auto border border-white/12 bg-[#0a1428]/88 text-slate-100 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl backdrop-saturate-150 sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle className="pr-8 text-lg font-semibold tracking-tight text-white">
              {file.name}
            </DialogTitle>
            <div className="pt-1">
              <ProtocolBadge protocol={file.protocol as Protocol} />
            </div>
          </DialogHeader>
          <dl className="rounded-lg bg-black/25 px-3 py-1 ring-1 ring-white/5">
            {rows.map((r, i) => (
              <Row key={`${r.label}-${i}`} label={r.label} value={r.value} />
            ))}
          </dl>
          <DialogFooter className="gap-2 border-t border-white/10 bg-black/30 backdrop-blur-md sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            {onDownload ? (
              <Button
                type="button"
                onClick={() => {
                  onDownload(file)
                  onOpenChange(false)
                }}
              >
                Descargar
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
