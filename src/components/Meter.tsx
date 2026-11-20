import { cn } from "@/lib/utils"

type Props = {
  label: string
  pct: number | null
  className?: string
}

// 配色直接引用哪吒 V0 theme-default 的 formatPercent
// （naiba/nezha@v0.19.16 resource/template/theme-default/home.html:418）：
// <51% #0a94f2 蓝、51–80% orange、≥81% crimson；无数据 slategray
function barColor(pct: number | null): string {
  if (pct === null) return "slategray"
  if (pct < 51) return "#0a94f2"
  if (pct < 81) return "orange"
  return "crimson"
}

// 结构也是哪吒 V0 那套：左边 label 列 + 右边一条整宽进度条，
// 百分比白字写在蓝色填充里（.ui.progress > .bar > small）。
// 轨道沿用本主题现成的 neu-inset，深浅色自动适配。
export function Meter({ label, pct, className }: Props) {
  const filled = pct === null ? 0 : Math.min(100, Math.max(0, pct))
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="w-10 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="neu-inset h-5 min-w-0 flex-1 overflow-hidden rounded">
        <div
          className="flex h-full items-center justify-center rounded text-white transition-[width] duration-300"
          style={{ width: `${filled}%`, minWidth: "2em", backgroundColor: barColor(pct) }}
        >
          <span className="text-[11px] font-semibold">{pct === null ? "—" : `${Math.floor(filled)}%`}</span>
        </div>
      </div>
    </div>
  )
}
