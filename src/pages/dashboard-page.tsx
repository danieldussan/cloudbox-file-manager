import { useMemo, useState } from "react"
import { RotateCcw, Search, Upload } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import {
  downloadFileRequest,
  formatBytesToReadable,
  type FileRow,
  type Protocol,
} from "@/api/client"
import {
  useDeleteFileMutation,
  useFilesQuery,
  useMoveFileMutation,
  useProtocolsQuery,
} from "@/api/hooks"
import { DeleteFileDialog } from "@/components/cloudbox/delete-file-dialog"
import { FileDetailsDialog } from "@/components/cloudbox/file-details-dialog"
import { MoveFileDialog } from "@/components/cloudbox/move-file-dialog"
import { FilesDataTable } from "@/components/cloudbox/files-data-table"
import { RecentFileItem } from "@/components/cloudbox/recent-file-item"
import { StatsCard } from "@/components/cloudbox/stats-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cloudboxToastError, cloudboxToastSuccess } from "@/lib/cloudbox-toast"

const PAGE_SIZE = 10

export function DashboardPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [listPage, setListPage] = useState(1)
  const [detailsFile, setDetailsFile] = useState<FileRow | null>(null)
  const [fileToDelete, setFileToDelete] = useState<FileRow | null>(null)
  const [fileToMove, setFileToMove] = useState<FileRow | null>(null)

  const protocolsQuery = useProtocolsQuery()
  const deleteMutation = useDeleteFileMutation()
  const moveMutation = useMoveFileMutation()
  const protocols = useMemo(
    () => (protocolsQuery.data ?? ["S3", "FTP", "SMB", "NFS"]) as Protocol[],
    [protocolsQuery.data]
  )
  const filesQuery = useFilesQuery(protocols, !!protocolsQuery.data)

  const files = Object.values(filesQuery.data ?? {}).flat()

  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return files
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(q) ||
        file.path.toLowerCase().includes(q) ||
        file.protocol.toLowerCase().includes(q)
    )
  }, [files, searchQuery])

  const totalListPages = Math.max(
    1,
    Math.ceil(filteredFiles.length / PAGE_SIZE)
  )
  const safeListPage = Math.min(Math.max(1, listPage), totalListPages)

  const paginatedFiles = useMemo(() => {
    const start = (safeListPage - 1) * PAGE_SIZE
    return filteredFiles.slice(start, start + PAGE_SIZE)
  }, [filteredFiles, safeListPage])

  const listRangeStart =
    filteredFiles.length === 0 ? 0 : (safeListPage - 1) * PAGE_SIZE + 1
  const listRangeEnd = Math.min(safeListPage * PAGE_SIZE, filteredFiles.length)

  const protocolStats = useMemo(
    () =>
      protocols.map((protocol) => {
        const protocolFiles = files.filter((file) => file.protocol === protocol)
        const count = protocolFiles.length
        const usedBytes = protocolFiles.reduce((acc, file) => {
          return acc + (file.bytes ?? 0)
        }, 0)
        const usedText = `${formatBytesToReadable(usedBytes)} / 1 GB`
        return {
          title: protocol,
          value: String(count),
          subtitle: usedText,
          badge: count > 0 ? "Activo" : "Standby",
        }
      }),
    [files, protocols]
  )

  const recent = files.slice(0, 4)

  const handleDownload = async (file: FileRow) => {
    try {
      const blob = await downloadFileRequest(
        file.path || file.name,
        file.protocol
      )
      const href = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = href
      a.download = file.name
      a.click()
      URL.revokeObjectURL(href)
    } catch (error) {
      console.error(error)
      cloudboxToastError(
        "No se pudo descargar el archivo",
        error instanceof Error ? error.message : undefined
      )
    }
  }

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return
    try {
      await deleteMutation.mutateAsync({
        path: fileToDelete.path || fileToDelete.name,
        protocol: fileToDelete.protocol,
      })
      cloudboxToastSuccess("Archivo eliminado", fileToDelete.name)
      setFileToDelete(null)
    } catch (error) {
      cloudboxToastError(
        "No se pudo eliminar el archivo",
        error instanceof Error ? error.message : undefined
      )
    }
  }

  const handleConfirmMove = async (to: Protocol) => {
    if (!fileToMove) return
    try {
      await moveMutation.mutateAsync({
        path: fileToMove.path || fileToMove.name,
        from: fileToMove.protocol,
        to,
      })
      cloudboxToastSuccess("Archivo movido", `${fileToMove.name} → ${to}`)
      setFileToMove(null)
    } catch (error) {
      cloudboxToastError(
        "No se pudo mover el archivo",
        error instanceof Error ? error.message : undefined
      )
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl text-foreground">
          Gestor de <span className="text-primary">Activos</span>
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        {protocolStats.map((metric) => (
          <StatsCard key={metric.title} {...metric} />
        ))}
      </div>

      <Card className="bg-surface-container-lowest">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Archivos Recientes ({files.length} objetos)</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => filesQuery.refetch()}
            >
              <RotateCcw className="size-4" />
              Actualizar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => void navigate({ to: "/upload" })}
            >
              <Upload className="size-4" />
              Subir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recent.length === 0 && (
            <p className="text-sm text-slate-300">
              No hay archivos recientes en los protocolos consultados.
            </p>
          )}
          {recent.map((file) => (
            <RecentFileItem
              key={`${file.protocol}-${file.name}`}
              name={file.name}
              type={`${file.protocol} • ${file.size}`}
              onDownload={() => void handleDownload(file)}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="bg-surface-container-lowest">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <CardTitle className="shrink-0">Listado General</CardTitle>
          <div className="relative w-full max-w-md sm:min-w-[16rem]">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setListPage(1)
              }}
              className="w-full rounded-lg border border-slate-500/40 bg-[#0f1930] py-2.5 pr-3 pl-9 text-sm text-slate-100 ring-2 ring-transparent transition outline-none focus:border-primary/60 focus:ring-primary/20"
              placeholder="Buscar en la tabla (nombre, ruta, protocolo)..."
              aria-label="Buscar en el listado general"
            />
          </div>
        </CardHeader>
        <CardContent>
          <FilesDataTable
            rows={paginatedFiles}
            loading={filesQuery.isLoading}
            onDownload={(file) => void handleDownload(file)}
            onDetails={(file) => setDetailsFile(file)}
            onDelete={(file) => setFileToDelete(file)}
            onMove={(file) => setFileToMove(file)}
          />
          {!filesQuery.isLoading && filteredFiles.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Mostrando{" "}
                <span className="font-medium text-slate-200">
                  {listRangeStart}–{listRangeEnd}
                </span>{" "}
                de{" "}
                <span className="font-medium text-slate-200">
                  {filteredFiles.length}
                </span>{" "}
                archivos
                {searchQuery.trim() ? " (filtrados)" : ""}
              </p>
              {totalListPages > 1 ? (
                <Pagination>
                  <PaginationContent className="flex-wrap justify-center sm:justify-end">
                    <PaginationItem>
                      <PaginationPrevious
                        disabled={safeListPage <= 1}
                        onClick={() =>
                          setListPage(Math.max(1, safeListPage - 1))
                        }
                      />
                    </PaginationItem>
                    {totalListPages <= 7 ? (
                      Array.from(
                        { length: totalListPages },
                        (_, i) => i + 1
                      ).map((n) => (
                        <PaginationItem key={n}>
                          <PaginationLink
                            isActive={n === safeListPage}
                            onClick={() => setListPage(n)}
                          >
                            {n}
                          </PaginationLink>
                        </PaginationItem>
                      ))
                    ) : (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            isActive={safeListPage === 1}
                            onClick={() => setListPage(1)}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {safeListPage > 3 ? (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : null}
                        {Array.from(
                          new Set([
                            safeListPage - 1,
                            safeListPage,
                            safeListPage + 1,
                          ])
                        )
                          .filter((n) => n > 1 && n < totalListPages)
                          .sort((a, b) => a - b)
                          .map((n) => (
                            <PaginationItem key={n}>
                              <PaginationLink
                                isActive={n === safeListPage}
                                onClick={() => setListPage(n)}
                              >
                                {n}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                        {safeListPage < totalListPages - 2 ? (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : null}
                        <PaginationItem>
                          <PaginationLink
                            isActive={safeListPage === totalListPages}
                            onClick={() => setListPage(totalListPages)}
                          >
                            {totalListPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        disabled={safeListPage >= totalListPages}
                        onClick={() =>
                          setListPage(
                            Math.min(totalListPages, safeListPage + 1)
                          )
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}
            </div>
          )}
          {filesQuery.error && (
            <p className="mt-3 text-xs text-destructive">
              {filesQuery.error.message}
            </p>
          )}
        </CardContent>
      </Card>

      <FileDetailsDialog
        open={Boolean(detailsFile)}
        onOpenChange={(open) => {
          if (!open) setDetailsFile(null)
        }}
        file={detailsFile}
        onDownload={(file) => void handleDownload(file)}
      />

      <DeleteFileDialog
        open={Boolean(fileToDelete)}
        onOpenChange={(open) => {
          if (!open) setFileToDelete(null)
        }}
        file={fileToDelete}
        isPending={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />

      <MoveFileDialog
        key={
          fileToMove ? `${fileToMove.path}-${fileToMove.protocol}` : "move-idle"
        }
        open={Boolean(fileToMove)}
        onOpenChange={(open) => {
          if (!open) setFileToMove(null)
        }}
        file={fileToMove}
        availableProtocols={protocols}
        isPending={moveMutation.isPending}
        onConfirm={handleConfirmMove}
      />
    </section>
  )
}
