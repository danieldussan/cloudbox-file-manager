import { useMemo, useState } from "react"
import { CloudUpload, ShieldCheck } from "lucide-react"

import { useProtocolsQuery, useUploadFilesMutation } from "@/api/hooks"
import type { Protocol } from "@/api/client"
import { defaultProtocols } from "@/data/cloudbox"
import { UploadProgressItem } from "@/components/cloudbox/upload-progress-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function UploadPage() {
  const [selectedProtocols, setSelectedProtocols] =
    useState<Protocol[]>(defaultProtocols)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const protocolsQuery = useProtocolsQuery()
  const uploadMutation = useUploadFilesMutation()

  const availableProtocols = useMemo(
    () => (protocolsQuery.data as Protocol[] | undefined) ?? defaultProtocols,
    [protocolsQuery.data]
  )

  const tasks = selectedFiles.map((file, index) => ({
    id: `${file.name}-${index}`,
    fileName: file.name,
    progress: uploadMutation.isPending ? 55 : 100,
  }))

  const toggleProtocol = (protocol: Protocol) => {
    setSelectedProtocols((current) =>
      current.includes(protocol)
        ? current.filter((p) => p !== protocol)
        : [...current, protocol]
    )
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return
    if (selectedProtocols.length === 0) return

    await uploadMutation.mutateAsync({
      files: selectedFiles,
      protocols: selectedProtocols,
    })
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl text-foreground">
          Subir Archivos
        </h1>
        <p className="text-sm text-muted-foreground">
          Arrastra y suelta tus archivos para distribuirlos entre protocolos.
        </p>
      </header>

      <Card className="bg-surface-container-low">
        <CardContent className="pt-5">
          <div className="border-outline-variant rounded-3xl border-2 border-dashed bg-gradient-to-b from-surface-container-high to-surface-container-lowest p-10 text-center">
            <CloudUpload className="mx-auto mb-3 size-10 text-primary" />
            <p className="font-heading text-xl">
              Arrastra y suelta tus archivos aquí
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              O haz clic para seleccionar archivos desde tu equipo
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Máx. 10MB por archivo • PDF, JPG, PNG, ZIP, DOCX
            </p>
            <input
              type="file"
              multiple
              className="mt-4 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary-foreground"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                setSelectedFiles(files)
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface-container-low">
        <CardHeader>
          <CardTitle>Subidas Activas ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Selecciona archivos para visualizar las subidas.
            </p>
          )}
          {tasks.map((task) => (
            <UploadProgressItem
              key={task.id}
              fileName={task.fileName}
              progress={task.progress}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="bg-surface-container-low">
        <CardHeader>
          <CardTitle>Configuración de Envío</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {availableProtocols.map((protocol) => (
              <label
                key={protocol}
                className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-sm"
              >
                <Checkbox
                  checked={selectedProtocols.includes(protocol)}
                  onCheckedChange={() => toggleProtocol(protocol)}
                />
                <Label className="text-sm font-medium tracking-normal text-foreground normal-case">
                  {protocol}
                </Label>
              </label>
            ))}
          </div>
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 text-primary" />
            Los archivos serán encriptados automáticamente mediante AES-256
            antes de la transferencia a los destinos seleccionados.
          </p>
          {uploadMutation.error && (
            <p className="text-xs text-destructive">
              {uploadMutation.error.message}
            </p>
          )}
          {uploadMutation.isSuccess && (
            <p className="text-xs text-green-700">
              Archivos enviados correctamente al backend.
            </p>
          )}
          <Button
            className="w-full sm:w-auto"
            disabled={
              uploadMutation.isPending ||
              selectedFiles.length === 0 ||
              selectedProtocols.length === 0
            }
            onClick={handleUpload}
          >
            {uploadMutation.isPending ? "Subiendo..." : "Subir Archivos"}
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
