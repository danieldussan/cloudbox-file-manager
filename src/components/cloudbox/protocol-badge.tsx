import { cn } from "@/lib/utils"
import type { Protocol } from "@/api/client"

const protocolClass: Record<Protocol, string> = {
  S3: "border-amber-500/50 bg-amber-500/10 text-amber-200",
  FTP: "border-sky-500/50 bg-sky-500/10 text-sky-200",
  SMB: "border-emerald-500/50 bg-emerald-500/10 text-emerald-200",
  NFS: "border-violet-500/50 bg-violet-500/10 text-violet-200",
}

export function ProtocolBadge({ protocol }: { protocol: Protocol }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        protocolClass[protocol]
      )}
    >
      {protocol}
    </span>
  )
}
