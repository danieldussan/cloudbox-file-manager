import type { Protocol } from "@/api/client"

export type Metric = {
  title: string
  value: string
  subtitle: string
}

export const metrics: Metric[] = [
  {
    title: "TOTAL ALMACENADO",
    value: "1.2 TB",
    subtitle: "65% de la capacidad total utilizada",
  },
  {
    title: "Nodos S3",
    value: "12",
    subtitle: "Conexiones activas",
  },
  {
    title: "Protocolo SFTP",
    value: "248",
    subtitle: "Archivos cifrados",
  },
]

export type RecentFile = {
  name: string
  type: string
}

export const recentFiles: RecentFile[] = [
  { name: "Plan_Estudios_2024.pdf", type: "Documento PDF • Académico" },
  { name: "Base_Datos_Alumnos_Q1.csv", type: "Hoja de Cálculo • Registro" },
  { name: "Campus_Main_Gate_Render.jpg", type: "Imagen • Infraestructura" },
  {
    name: "Examenes_Finales_Diciembre.zip",
    type: "Archivo Comprimido • Académico",
  },
]

export type UploadTask = {
  id: string
  fileName: string
  progress: number
}

export const uploadTasks: UploadTask[] = [
  { id: "1", fileName: "Tesis_Final_V2.pdf", progress: 75 },
  { id: "2", fileName: "Banner_Campus.jpg", progress: 42 },
]

export const defaultProtocols: Protocol[] = ["FTP", "SMB", "NFS", "S3"]
