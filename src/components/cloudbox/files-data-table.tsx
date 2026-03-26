import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { FileRow } from "@/api/client"

type FilesDataTableProps = {
  rows: FileRow[]
  loading?: boolean
  onDownload?: (row: FileRow) => void
}

export function FilesDataTable({
  rows,
  loading,
  onDownload,
}: FilesDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-none">
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
            <TableCell colSpan={5} className="text-slate-300">
              Cargando archivos...
            </TableCell>
          </TableRow>
        )}
        {!loading && rows.length === 0 && (
          <TableRow className="border-none">
            <TableCell colSpan={5} className="text-slate-300">
              No hay datos de archivos disponibles en la API.
            </TableCell>
          </TableRow>
        )}
        {rows.map((file) => (
          <TableRow
            key={`${file.protocol}-${file.name}`}
            className="border-none"
          >
            <TableCell className="font-medium text-slate-100">
              {file.name}
            </TableCell>
            <TableCell>
              <Badge>{file.protocol}</Badge>
            </TableCell>
            <TableCell className="text-slate-200">{file.size}</TableCell>
            <TableCell className="text-slate-300">{file.modified}</TableCell>
            <TableCell>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onDownload?.(file)}
                className="hover:bg-primary/20"
              >
                <Download className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
