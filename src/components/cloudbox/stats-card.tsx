import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type StatsCardProps = {
  title: string
  value: string
  subtitle: string
  badge?: string
}

export function StatsCard({ title, value, subtitle, badge }: StatsCardProps) {
  return (
    <Card className="border-t-2 border-primary/20 bg-surface-container-low">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs tracking-wide text-slate-200 uppercase">
          {title}
        </CardTitle>
        {badge && (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold tracking-wider text-primary uppercase">
            {badge}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="font-heading text-2xl font-bold text-foreground">
          {value}
        </p>
        <p className="text-xs text-slate-300">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
