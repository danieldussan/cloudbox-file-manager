import { useMemo } from "react"
import { Filter, Upload } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import {
  downloadFileRequest,
  formatBytesToReadable,
  type Protocol,
} from "@/api/client"
import { useFilesQuery, useProtocolsQuery } from "@/api/hooks"
import { FilesDataTable } from "@/components/cloudbox/files-data-table"
import { RecentFileItem } from "@/components/cloudbox/recent-file-item"
import { StatsCard } from "@/components/cloudbox/stats-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardPage() {
  const navigate = useNavigate()
  const protocolsQuery = useProtocolsQuery()
  const protocols = useMemo(
    () => (protocolsQuery.data ?? ["S3", "FTP", "SMB", "NFS"]) as Protocol[],
    [protocolsQuery.data]
  )
  const filesQuery = useFilesQuery(protocols, !!protocolsQuery.data)

  const files = Object.values(filesQuery.data ?? {}).flat()

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

  const handleDownload = async (file: (typeof files)[number]) => {
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
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl text-foreground">
          Gestor de <span className="text-primary">Activos</span>
        </h1>
        <p className="text-sm text-slate-300">
          Infraestructura centralizada de almacenamiento para investigación y
          docencia.
        </p>
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
              <Filter className="size-4" />
              Actualizar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => void navigate({ to: "/app/upload" })}
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
        <CardHeader>
          <CardTitle>Listado General</CardTitle>
        </CardHeader>
        <CardContent>
          <FilesDataTable
            rows={files.slice(0, 10)}
            loading={filesQuery.isLoading}
            onDownload={(file) => void handleDownload(file)}
          />
          {filesQuery.error && (
            <p className="mt-3 text-xs text-destructive">
              {filesQuery.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
