import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { FileRow } from "@/api/client"

type DeleteFileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileRow | null
  isPending?: boolean
  onConfirm: () => void | Promise<void>
}

export function DeleteFileDialog({
  open,
  onOpenChange,
  file,
  isPending,
  onConfirm,
}: DeleteFileDialogProps) {
  return (
    <Dialog open={open && !!file} onOpenChange={onOpenChange}>
      {file ? (
        <DialogContent
          overlayClassName="bg-slate-950/55 backdrop-blur-md supports-backdrop-filter:backdrop-blur-md"
          className="max-h-[85vh] overflow-y-auto border border-white/12 bg-[#0a1428]/88 text-slate-100 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl backdrop-saturate-150 sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="pr-8 text-lg font-semibold text-white">
              ¿Eliminar archivo?
            </DialogTitle>
            <p className="text-sm text-slate-400">
              Esta acción no se puede deshacer. El archivo se borrará de forma
              permanente en el protocolo{" "}
              <span className="font-medium text-slate-200">
                {file.protocol}
              </span>
              .
            </p>
            <p className="rounded-lg bg-black/30 px-3 py-2 font-mono text-sm break-all text-slate-100 ring-1 ring-white/10">
              {file.name}
            </p>
          </DialogHeader>
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
              variant="destructive"
              disabled={isPending}
              onClick={() => void onConfirm()}
            >
              {isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
