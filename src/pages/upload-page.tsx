import { useMemo, useRef, useState } from "react"
import type { DragEvent, KeyboardEvent } from "react"
import { CloudUpload, ShieldCheck, Trash2, X } from "lucide-react"

import { useProtocolsQuery, useUploadFilesMutation } from "@/api/hooks"
import type { Protocol } from "@/api/client"
import { defaultProtocols } from "@/data/cloudbox"
import { UploadProgressItem } from "@/components/cloudbox/upload-progress-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function UploadPage() {
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
  const [selectedProtocols, setSelectedProtocols] =
    useState<Protocol[]>(defaultProtocols)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [activeUploadFiles, setActiveUploadFiles] = useState<File[]>([])
  const [fileValidationError, setFileValidationError] = useState<string | null>(
    null
  )
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const protocolsQuery = useProtocolsQuery()
  const uploadMutation = useUploadFilesMutation()

  const availableProtocols = useMemo(
    () => (protocolsQuery.data as Protocol[] | undefined) ?? defaultProtocols,
    [protocolsQuery.data]
  )

  const tasks = activeUploadFiles.map((file, index) => ({
    id: `${file.name}-${file.lastModified}-${index}`,
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

    setActiveUploadFiles(selectedFiles)

    await uploadMutation.mutateAsync({
      files: selectedFiles,
      protocols: selectedProtocols,
    })
  }

  const selectFiles = (files: File[]) => {
    const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE_BYTES)
    const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE_BYTES)

    setSelectedFiles(validFiles)

    if (invalidFiles.length > 0) {
      const names = invalidFiles.map((file) => file.name).join(", ")
      setFileValidationError(
        `Estos archivos superan 10MB y no se agregaron: ${names}`
      )
    } else {
      setFileValidationError(null)
    }
  }

  const removeSelectedFile = (fileToRemove: File) => {
    setSelectedFiles((current) =>
      current.filter(
        (file) =>
          !(
            file.name === fileToRemove.name &&
            file.size === fileToRemove.size &&
            file.lastModified === fileToRemove.lastModified
          )
      )
    )
  }

  const clearSelectedFiles = () => {
    setSelectedFiles([])
    setFileValidationError(null)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const files = Array.from(event.dataTransfer.files ?? [])
    if (files.length > 0) selectFiles(files)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDropzoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      fileInputRef.current?.click()
    }
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleDropzoneKeyDown}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`rounded-3xl border-2 border-dashed bg-linear-to-b p-10 text-center transition-all outline-none ${
              isDragOver
                ? "border-primary bg-primary/10 from-primary/20 to-surface-container-low shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"
                : "border-outline-variant from-surface-container-high to-surface-container-lowest hover:border-primary/70 hover:from-surface-container-high hover:to-primary/10 hover:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
            }`}
          >
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
            <p className="mt-4 text-xs font-medium text-primary">
              {isDragOver ? "Suelta los archivos para cargarlos" : "Haz clic o arrastra archivos"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                selectFiles(files)
              }}
            />
          </div>
          {fileValidationError && (
            <p className="mt-3 text-xs text-destructive">{fileValidationError}</p>
          )}
          {selectedFiles.length > 0 && (
            <div className="mt-4 rounded-xl border border-border/50 bg-surface-container-lowest p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">
                  Archivos seleccionados ({selectedFiles.length})
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={clearSelectedFiles}
                >
                  <Trash2 className="size-4" />
                  Limpiar
                </Button>
              </div>
              <ul className="space-y-2">
                {selectedFiles.map((file) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${file.size}`}
                    className="flex items-center justify-between rounded-md bg-surface-container-high px-3 py-2"
                  >
                    <span className="truncate pr-3 text-sm text-slate-200">
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeSelectedFile(file)}
                      aria-label={`Quitar ${file.name}`}
                    >
                      <X className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-surface-container-low">
        <CardHeader>
          <CardTitle>Subidas Activas ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Las subidas aparecerán aquí cuando inicies la carga.
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
              Archivos subidos correctamente.
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
