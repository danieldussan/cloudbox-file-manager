import type { ReactNode } from "react"
import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
} from "lucide-react"

import type { FileRow } from "@/api/client"
import { cn } from "@/lib/utils"

type FileTypeIconProps = {
  file: Pick<FileRow, "name" | "extension" | "mimeType">
  className?: string
}

function wrap(icon: ReactNode, className?: string) {
  return (
    <span className={cn("inline-flex text-muted-foreground", className)}>
      {icon}
    </span>
  )
}

function extFromName(name: string): string {
  const i = name.lastIndexOf(".")
  if (i < 0 || i === name.length - 1) return ""
  return name.slice(i + 1).toLowerCase()
}

export function FileTypeIcon({ file, className }: FileTypeIconProps) {
  const ext = (file.extension ?? extFromName(file.name)).toLowerCase()
  const mime = (file.mimeType ?? "").toLowerCase()

  const codeExt = new Set([
    "ts",
    "tsx",
    "js",
    "jsx",
    "mjs",
    "cjs",
    "json",
    "css",
    "html",
    "xml",
    "yaml",
    "yml",
    "py",
    "go",
    "rs",
    "java",
    "kt",
    "c",
    "cpp",
    "h",
    "cs",
    "php",
    "rb",
    "sh",
    "sql",
  ])
  const sheetExt = new Set(["xls", "xlsx", "csv", "ods"])
  const docExt = new Set(["doc", "docx", "odt", "rtf", "md", "txt", "log"])
  const presExt = new Set(["ppt", "pptx", "odp"])
  const archiveExt = new Set(["zip", "rar", "7z", "tar", "gz", "bz2", "xz"])

  if (
    mime.startsWith("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"].includes(ext)
  ) {
    return wrap(<FileImage className="size-4" />, className)
  }
  if (
    mime.startsWith("video/") ||
    ["mp4", "webm", "mov", "mkv", "avi"].includes(ext)
  ) {
    return wrap(<FileVideo className="size-4" />, className)
  }
  if (
    mime.startsWith("audio/") ||
    ["mp3", "wav", "ogg", "flac", "m4a"].includes(ext)
  ) {
    return wrap(<FileAudio className="size-4" />, className)
  }
  if (mime === "application/pdf" || ext === "pdf") {
    return wrap(<FileText className="size-4 text-red-300" />, className)
  }
  if (
    archiveExt.has(ext) ||
    mime.includes("zip") ||
    mime.includes("compressed")
  ) {
    return wrap(<FileArchive className="size-4" />, className)
  }
  if (
    sheetExt.has(ext) ||
    mime.includes("spreadsheet") ||
    mime.includes("csv")
  ) {
    return wrap(<FileSpreadsheet className="size-4" />, className)
  }
  if (presExt.has(ext) || mime.includes("presentation")) {
    return wrap(<Presentation className="size-4" />, className)
  }
  if (docExt.has(ext) || mime.startsWith("text/")) {
    return wrap(<FileText className="size-4" />, className)
  }
  if (
    codeExt.has(ext) ||
    mime.includes("javascript") ||
    mime.includes("json")
  ) {
    return wrap(<FileCode className="size-4" />, className)
  }

  return wrap(<File className="size-4" />, className)
}
