import createClient from "openapi-fetch"

import type { components, paths } from "@/api/generated/schema"
import { getAuthToken } from "@/stores/auth-store"

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ""

const apiClient = createClient<paths>({ baseUrl })

function authHeaders() {
  const token = getAuthToken()

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

function toErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "title" in error) {
    const title = (error as { title?: string }).title
    if (title) return title
  }

  if (typeof error === "object" && error && "detail" in error) {
    const detail = (error as { detail?: string }).detail
    if (detail) return detail
  }

  return fallback
}

export type Protocol = "S3" | "FTP" | "SMB" | "NFS"
export type AuthRequest = components["schemas"]["AuthRequest"]
export type AuthResponse = components["schemas"]["AuthResponse"]

export type FileRow = {
  name: string
  path: string
  size: string
  bytes: number | null
  modified: string
  protocol: Protocol
  lastModifiedRaw: string | null
  extension: string | null
  mimeType: string | null
  etag: string | null
  directory: boolean | null
  bucketName: string | null
  storageClass: string | null
  owner: string | null
  group: string | null
  creationTime: string | null
  lastAccessTime: string | null
  allocationSize: number | null
}

type FilesByProtocol = Record<Protocol, FileRow[]>

const EMPTY_FILES: FilesByProtocol = { S3: [], FTP: [], SMB: [], NFS: [] }

function parseBytes(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.round(value)
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.round(parsed)
    }
  }
  return null
}

export function formatBytesToReadable(bytes: number | null): string {
  if (bytes === null) return "N/A"

  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024
    return `${kb.toFixed(1)} KB`
  }

  if (bytes < 1024 * 1024 * 1024) {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(2)} GB`
}

function optionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const s = String(value).trim()
  return s.length > 0 ? s : null
}

/**
 * ETag legible sin comillas envolventes (S3, weak ETag W/"…", comillas tipográficas).
 * Usar al renderizar; también se aplica en el parser de la API.
 */
export function formatEtagForDisplay(raw: string | null | undefined): string {
  if (raw == null) return ""
  let s = String(raw).trim()
  if (!s) return ""

  const stripOneLayer = (input: string): string | null => {
    const t = input.trim()
    if (t.length < 2) return null
    const a = t[0]
    const b = t[t.length - 1]
    const asciiDouble = a === '"' && b === '"'
    const asciiSingle = a === "'" && b === "'"
    const curly = a === "\u201c" && b === "\u201d"
    if (!asciiDouble && !asciiSingle && !curly) return null
    return t
      .slice(1, -1)
      .replaceAll('\\"', '"')
      .replaceAll("\\'", "'")
      .trim()
  }

  let peeled: string | null
  while ((peeled = stripOneLayer(s)) !== null) {
    s = peeled
  }

  s = s.replaceAll("&quot;", '"').replaceAll("&#34;", '"').trim()
  while ((peeled = stripOneLayer(s)) !== null) {
    s = peeled
  }

  if (/^W\//i.test(s)) {
    const rest = s.slice(2).trim()
    const inner = formatEtagForDisplay(rest)
    return inner ? `W/${inner}` : "W/"
  }

  return s
}

function normalizeEtag(value: unknown): string | null {
  const s = optionalString(value)
  if (!s) return null
  const out = formatEtagForDisplay(s)
  return out.length > 0 ? out : null
}

function optionalBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value
  return null
}

function optionalNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return null
}

const emptyMeta = {
  lastModifiedRaw: null as string | null,
  extension: null as string | null,
  mimeType: null as string | null,
  etag: null as string | null,
  directory: null as boolean | null,
  bucketName: null as string | null,
  storageClass: null as string | null,
  owner: null as string | null,
  group: null as string | null,
  creationTime: null as string | null,
  lastAccessTime: null as string | null,
  allocationSize: null as number | null,
}

function formatDateTimeReadable(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "N/A"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const resolvedTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Bogota"

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: resolvedTimeZone,
  }).format(date)
}

function parseFilesResponse(raw: unknown): FilesByProtocol {
  try {
    const parsed =
      typeof raw === "string"
        ? (JSON.parse(raw) as Record<string, unknown>)
        : (raw as Record<string, unknown>)

    return (Object.keys(EMPTY_FILES) as Protocol[]).reduce(
      (acc, key) => {
        const items = parsed[key]
        if (Array.isArray(items)) {
          acc[key] = items.map((item, index) => {
            if (typeof item === "object" && item) {
              const r = item as Record<string, unknown>
              const bytes = parseBytes(r.size ?? r.sizeBytes ?? r.bytes)
              const lastMod = r.lastModified ?? r.modified
              return {
                name: String(r.name ?? r.fileName ?? `archivo-${index + 1}`),
                path: String(
                  r.path ??
                    r.filePath ??
                    r.fullPath ??
                    r.name ??
                    r.fileName ??
                    ""
                ),
                size: formatBytesToReadable(bytes),
                bytes,
                modified: formatDateTimeReadable(lastMod),
                protocol: key,
                lastModifiedRaw: optionalString(lastMod),
                extension: optionalString(r.extension),
                mimeType: optionalString(r.mimeType),
                etag: normalizeEtag(r.etag),
                directory: optionalBool(r.directory),
                bucketName: optionalString(r.bucketName),
                storageClass: optionalString(r.storageClass),
                owner: optionalString(r.owner),
                group: optionalString(r.group),
                creationTime: optionalString(r.creationTime),
                lastAccessTime: optionalString(r.lastAccessTime),
                allocationSize: optionalNumber(r.allocationSize),
              }
            }

            return {
              name: String(item),
              path: String(item),
              size: "N/A",
              bytes: null,
              modified: "N/A",
              protocol: key,
              ...emptyMeta,
            }
          })
        } else {
          acc[key] = []
        }
        return acc
      },
      { ...EMPTY_FILES }
    )
  } catch {
    return EMPTY_FILES
  }
}

export async function loginRequest(payload: AuthRequest) {
  const { data, error } = await apiClient.POST("/api/v1/auth/login", {
    body: payload,
  })

  if (error || !data?.token) {
    throw new Error(toErrorMessage(error, "No se pudo iniciar sesión"))
  }

  return data as AuthResponse
}

export async function registerRequest(payload: AuthRequest) {
  const { data, error } = await apiClient.POST("/api/v1/auth/register", {
    body: payload,
  })

  if (error || !data?.token) {
    throw new Error(toErrorMessage(error, "No se pudo registrar el usuario"))
  }

  return data as AuthResponse
}

export async function getAvailableProtocolsRequest() {
  const { data, error } = await apiClient.GET("/api/v1/files/protocols", {
    headers: authHeaders(),
  })

  if (error || !data) {
    throw new Error(
      toErrorMessage(error, "No se pudieron cargar los protocolos")
    )
  }

  return data
}

export async function listFilesRequest(protocols: Protocol[]) {
  const { data, error } = await apiClient.GET("/api/v1/files", {
    params: { query: { protocols } },
    headers: authHeaders(),
  })

  if (error || !data) {
    throw new Error(toErrorMessage(error, "No se pudieron cargar los archivos"))
  }

  return parseFilesResponse(data)
}

export async function uploadFilesRequest(files: File[], protocols: Protocol[]) {
  const formData = new FormData()

  files.forEach((file, index) => {
    formData.append(`files[${index}].file`, file)
    protocols.forEach((protocol) => {
      formData.append(`files[${index}].protocols`, protocol)
    })
  })

  const response = await fetch(`${baseUrl}/api/v1/files`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  })

  if (!response.ok) {
    let errorMessage = "No se pudieron subir los archivos"
    try {
      const problem = (await response.json()) as {
        title?: string
        detail?: string
      }
      errorMessage = problem.detail ?? problem.title ?? errorMessage
    } catch {
      // Ignore JSON parsing failures on non-problem responses.
    }
    throw new Error(errorMessage)
  }

  return response.json().catch(() => ({}))
}

export async function downloadFileRequest(
  filePath: string,
  protocol: Protocol
) {
  const params = new URLSearchParams({
    path: filePath,
    protocol,
  })
  const response = await fetch(
    `${baseUrl}/api/v1/files/download?${params.toString()}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  )

  if (!response.ok) {
    throw new Error("No se pudo descargar el archivo")
  }

  return response.blob()
}
