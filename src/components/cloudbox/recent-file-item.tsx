import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"

type RecentFileItemProps = {
  name: string
  type: string
  onDownload?: () => void
}

export function RecentFileItem({
  name,
  type,
  onDownload,
}: RecentFileItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      <div className="flex gap-1">
        <Button size="icon-sm" variant="ghost" onClick={onDownload}>
          <Download className="size-4" />
        </Button>
      </div>
    </div>
  )
}
