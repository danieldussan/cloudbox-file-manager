import { Progress } from "@/components/ui/progress"

type UploadProgressItemProps = {
  fileName: string
  progress: number
}

export function UploadProgressItem({
  fileName,
  progress,
}: UploadProgressItemProps) {
  return (
    <div className="rounded-lg bg-surface-container-low p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{fileName}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  )
}
