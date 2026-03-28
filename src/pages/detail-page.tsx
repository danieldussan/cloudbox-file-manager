import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useParams } from "@tanstack/react-router"

import { useFilesQuery } from "@/api/hooks"
import {
  downloadFileRequest,
  formatBytesToReadable,
  type FileRow,
  type Protocol,
} from "@/api/client"
import { FileDetailsDialog } from "@/components/cloudbox/file-details-dialog"
import { FilesDataTable } from "@/components/cloudbox/files-data-table"
import { ProtocolBadge } from "@/components/cloudbox/protocol-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cloudboxToastError } from "@/lib/cloudbox-toast"

const validProtocols: Protocol[] = ["S3", "FTP", "SMB", "NFS"]

export function DetailPage() {
  const [query, setQuery] = useState("")
  const [detailsFile, setDetailsFile] = useState<FileRow | null>(null)
  const { protocol } = useParams({ from: "/app-layout/details/$protocol" })
  const normalized = (
    validProtocols.includes(protocol as Protocol) ? protocol : "S3"
  ) as Protocol

  const filesQuery = useFilesQuery([normalized])
  const files = useMemo(
    () => filesQuery.data?.[normalized] ?? [],
    [filesQuery.data, normalized]
  )
  const filteredFiles = useMemo(
    () =>
      files.filter((file) =>
        file.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [files, query]
  )

  const normalizedRows = useMemo(
    () =>
      filteredFiles.map((file) => ({
        ...file,
        size: formatBytesToReadable(file.bytes),
      })),
    [filteredFiles]
  )

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const blob = await downloadFileRequest(filePath, normalized)
      const href = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = href
      a.download = fileName
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

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl text-foreground">
          Detalle {normalized} - CloudBox
        </h1>
        <p className="text-sm text-muted-foreground">
          Vista específica del protocolo con metadatos y estado de
          transferencia.
        </p>
      </header>

      <Card className="bg-surface-container-low">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Archivos en {normalized}</CardTitle>
          <ProtocolBadge protocol={normalized} />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-lg border border-slate-500/40 bg-[#0f1930] py-2.5 pr-3 pl-9 text-sm text-slate-100 ring-2 ring-transparent transition outline-none focus:border-primary/60 focus:ring-primary/20"
                placeholder="Buscar archivo por nombre..."
              />
            </div>
          </div>
          <FilesDataTable
            rows={normalizedRows}
            loading={filesQuery.isLoading}
            onDownload={(file) =>
              void handleDownload(file.path || file.name, file.name)
            }
            onDetails={(file) => setDetailsFile(file)}
          />
        </CardContent>
      </Card>

      <FileDetailsDialog
        open={Boolean(detailsFile)}
        onOpenChange={(open) => {
          if (!open) setDetailsFile(null)
        }}
        file={detailsFile}
        onDownload={(file) =>
          void handleDownload(file.path || file.name, file.name)
        }
      />
    </section>
  )
}
