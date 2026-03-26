import type { ReactNode } from "react"
import { Link, Outlet, useNavigate } from "@tanstack/react-router"
import {
  CloudUpload,
  Database,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Network,
  Server,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"

export function AppShell() {
  const navigate = useNavigate()
  const username = useAuthStore((state) => state.username)
  const clearSession = useAuthStore((state) => state.clearSession)

  return (
    <div className="min-h-screen bg-surface text-foreground">
      <aside className="fixed top-0 left-0 hidden h-screen w-64 flex-col bg-[#091328] md:flex">
        <div className="px-6 py-8">
          <p className="font-heading text-xl font-black tracking-tight text-white">
            CloudBox
          </p>
          <p className="text-xs text-slate-400">Gestión de Archivos</p>
        </div>
        <nav className="space-y-1 px-2">
          <NavItem
            to="/app/dashboard"
            icon={<LayoutDashboard className="size-4" />}
            label="Panel de Control"
          />
          <NavItem
            to="/app/upload"
            icon={<CloudUpload className="size-4" />}
            label="Subir Archivos"
          />
          <NavItem
            to="/app/details/$protocol"
            params={{ protocol: "FTP" }}
            icon={<Server className="size-4" />}
            label="FTP"
          />
          <NavItem
            to="/app/details/$protocol"
            params={{ protocol: "SMB" }}
            icon={<Database className="size-4" />}
            label="SMB"
          />
          <NavItem
            to="/app/details/$protocol"
            params={{ protocol: "NFS" }}
            icon={<Network className="size-4" />}
            label="NFS"
          />
          <NavItem
            to="/app/details/$protocol"
            params={{ protocol: "S3" }}
            icon={<FolderOpen className="size-4" />}
            label="S3"
          />
        </nav>
        <div className="mt-auto p-4">
          <div className="rounded-xl bg-surface-container-high p-3">
            <p className="truncate text-xs font-semibold text-white">
              {username}
            </p>
            <p className="text-[10px] text-slate-400">Usuario Universitario</p>
          </div>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start text-slate-300 hover:bg-surface-container-high hover:text-white"
            onClick={() => {
              clearSession()
              void navigate({ to: "/login" })
            }}
          >
            <LogOut className="mr-2 size-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="md:ml-64">
        <header className="sticky top-0 z-20 border-b border-border/40 bg-background/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <h2 className="hidden text-sm text-muted-foreground md:block">
              Plataforma de almacenamiento universitario
            </h2>
            <div />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl min-w-0 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

type NavItemProps = {
  to: "/app/dashboard" | "/app/upload" | "/app/details/$protocol"
  label: string
  icon: ReactNode
  params?: { protocol: string }
}

function NavItem({ to, label, icon, params }: NavItemProps) {
  return (
    <Link
      to={to}
      params={params}
      activeProps={{
        className:
          "bg-blue-600/20 text-blue-400 border-r-4 border-blue-500 font-bold",
      }}
      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-[#192540] hover:text-white"
    >
      {icon}
      {label}
    </Link>
  )
}
