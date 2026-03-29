import { useMemo, useRef } from "react"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProtocolBadge } from "@/components/cloudbox/protocol-badge"
import type { FileRow, Protocol } from "@/api/client"
import { Label } from "@/components/ui/label"

type MoveFileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileRow | null
  /** Protocolos disponibles en la API (se excluye el origen del archivo). */
  availableProtocols: Protocol[]
  isPending?: boolean
  onConfirm: (destination: Protocol) => void | Promise<void>
}

export function MoveFileDialog({
  open,
  onOpenChange,
  file,
  availableProtocols,
  isPending,
  onConfirm,
}: MoveFileDialogProps) {
  const selectRef = useRef<HTMLSelectElement>(null)

  const targetOptions = useMemo(() => {
    if (!file) return []
    return availableProtocols.filter((p) => p !== file.protocol)
  }, [availableProtocols, file])

  const selectKey =
    file != null ? `${file.path}-${file.protocol}` : "move-closed"

  const handleSubmit = () => {
    const raw = selectRef.current?.value
    if (!raw || !targetOptions.includes(raw as Protocol)) return
    void onConfirm(raw as Protocol)
  }

  return (
    <Dialog open={open && !!file} onOpenChange={onOpenChange}>
      {file ? (
        <DialogContent
          overlayClassName="bg-slate-950/55 backdrop-blur-md supports-backdrop-filter:backdrop-blur-md"
          className="max-h-[85vh] overflow-y-auto border border-white/12 bg-[#0a1428]/88 text-slate-100 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl backdrop-saturate-150 sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="pr-8 text-lg font-semibold text-white">
              Mover a otro protocolo
            </DialogTitle>
            <p className="text-sm text-slate-400">
              El archivo se copiará al protocolo de destino y se eliminará del
              origen. Solo puedes elegir un protocolo destino.
            </p>
            <div className="space-y-2 rounded-lg bg-black/25 px-3 py-3 ring-1 ring-white/5">
              <p className="font-mono text-sm break-all text-slate-100">
                {file.name}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Origen:</span>
                <ProtocolBadge protocol={file.protocol} />
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-2 px-1">
            <Label htmlFor="move-destination" className="text-slate-300">
              Protocolo destino
            </Label>
            {targetOptions.length === 0 ? (
              <p className="text-sm text-amber-400/90">
                No hay otro protocolo disponible para mover este archivo.
              </p>
            ) : (
              <select
                key={selectKey}
                id="move-destination"
                ref={selectRef}
                defaultValue={targetOptions[0]}
                disabled={isPending}
                className="w-full rounded-lg border border-slate-500/40 bg-[#0f1930] px-3 py-2.5 text-sm text-slate-100 ring-2 ring-transparent outline-none focus:border-primary/60 focus:ring-primary/20"
              >
                {targetOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}
          </div>
          <DialogFooter className="gap-2 border-t border-white/10 bg-black/30 backdrop-blur-md sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isPending || targetOptions.length === 0}
              onClick={handleSubmit}
            >
              {isPending ? "Moviendo…" : "Mover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
