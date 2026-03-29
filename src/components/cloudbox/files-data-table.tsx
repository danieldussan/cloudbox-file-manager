import { ArrowRightLeft, Download, Info, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { FileRow } from "@/api/client"
import { FileTypeIcon } from "@/components/cloudbox/file-type-icon"
import { ProtocolBadge } from "@/components/cloudbox/protocol-badge"

const COL_SPAN = 6

type FilesDataTableProps = {
  rows: FileRow[]
  loading?: boolean
  onDownload?: (row: FileRow) => void
  onDetails?: (row: FileRow) => void
  onDelete?: (row: FileRow) => void
  onMove?: (row: FileRow) => void
}

export function FilesDataTable({
  rows,
  loading,
  onDownload,
  onDetails,
  onDelete,
  onMove,
}: FilesDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-none">
          <TableHead className="w-10 text-slate-200" />
          <TableHead className="text-slate-200">Nombre del Archivo</TableHead>
          <TableHead className="text-slate-200">Protocolo</TableHead>
          <TableHead className="text-slate-200">Tamaño</TableHead>
          <TableHead className="text-slate-200">Última Modificación</TableHead>
          <TableHead className="text-slate-200">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && (
          <TableRow className="border-none">
            <TableCell colSpan={COL_SPAN} className="text-slate-300">
              Cargando archivos...
            </TableCell>
          </TableRow>
        )}
        {!loading && rows.length === 0 && (
          <TableRow className="border-none">
            <TableCell
              colSpan={COL_SPAN}
              className="py-10 text-center text-lg text-slate-300"
            >
              No hay datos disponibles.
            </TableCell>
          </TableRow>
        )}
        {rows.map((file) => (
          <TableRow
            key={`${file.protocol}-${file.name}-${file.path}`}
            className="border-none"
          >
            <TableCell className="align-middle">
              <FileTypeIcon file={file} className="text-slate-300" />
            </TableCell>
            <TableCell className="font-medium text-slate-100">
              {file.name}
            </TableCell>
            <TableCell>
              <ProtocolBadge protocol={file.protocol} />
            </TableCell>
            <TableCell className="text-slate-200">{file.size}</TableCell>
            <TableCell className="max-w-56 truncate text-slate-300">
              {file.modified}
            </TableCell>
            <TableCell className="min-w-[9.5rem]">
              <div className="flex flex-wrap items-center gap-0.5">
                {onDetails ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onDetails(file)}
                    className="hover:bg-primary/20"
                    aria-label={`Detalles de ${file.name}`}
                  >
                    <Info className="size-4" />
                  </Button>
                ) : null}
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => onDownload?.(file)}
                  className="hover:bg-primary/20"
                  aria-label={`Descargar ${file.name}`}
                >
                  <Download className="size-4" />
                </Button>
                {onMove ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onMove(file)}
                    className="hover:bg-primary/20"
                    aria-label={`Mover ${file.name}`}
                  >
                    <ArrowRightLeft className="size-4" />
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onDelete(file)}
                    className="text-destructive hover:bg-destructive/20"
                    aria-label={`Eliminar ${file.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
