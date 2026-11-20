import { memo } from "react"
import { ArrowDown, ArrowUp, CalendarClock, Cpu, HardDrive, MemoryStick } from "lucide-react"

import { CountryLabel, ExpiryText, LatencyPanel, PriceText, StatusPill } from "@/components/Bits"
import { Meter } from "@/components/Meter"
import { Card } from "@/components/ui/card"
import type { Latency, Node } from "@/lib/api"
import { osName, percent, rate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { deployed, statusOf } from "@/lib/view"

// 容量换算直接引用哪吒 V0 theme-default 的 getK2Gb
// （naiba/nezha@v0.19.16 resource/template/theme-default/home.html:495）：
// ≥1GiB 时向上取整到 GB，不足 1GiB 时换算成 MB
function gb(bytes: number): string {
  if (!bytes) return "—"
  const gib = bytes / 1024 ** 3
  if (gib >= 1) return `${Math.ceil(Number(gib.toFixed(2)))}GB`
  return `${Math.ceil(Number((gib * 1024).toFixed(2)))}MB`
}

function NodeCardBase({ node, latency, onOpen }: { node: Node; latency?: Latency; onOpen: () => void }) {
  const m = node.metrics
  const status = statusOf(node)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      className="glow-hover cv-card rise group relative min-w-0 cursor-pointer gap-0 overflow-hidden p-4 hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
    >
      <span
        className={cn(
          "pointer-events-none absolute -top-16 -right-12 size-40 rounded-full blur-3xl",
          status === "online" ? "bg-ok/12" : status === "offline" ? "bg-destructive/10" : "bg-muted/40",
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-semibold break-words" title={node.name}>
            {node.name}
          </h3>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <CountryLabel code={node.country} name className="min-w-0 shrink-0" />
            <span className="min-w-0 truncate">
              {node.os
                ? [osName(node.os), node.virt && node.virt !== "none" ? node.virt : "", node.arch]
                    .filter(Boolean)
                    .join(" · ")
                : "等待首次上报"}
            </span>
          </p>
        </div>
        <StatusPill node={node} className="shrink-0" />
      </div>

      {deployed(node) ? (
        <>
          {/* 资源条改成哪吒 V0 样式：只留 CPU / RAM / Disk 三行，
              Swap 和流量都不要；条的样子见 src/components/Meter.tsx */}
          <div className="mt-4 space-y-2">
            <Meter label="CPU" pct={m ? m.cpu : null} />
            <Meter label="RAM" pct={m ? percent(m.mem_used, m.mem_total) : null} />
            <Meter label="Disk" pct={m ? percent(m.disk_used, m.disk_total) : null} />
          </div>

          {/* 硬件配置行，哪吒 V0 的 Asset 那一行：图标颜色也沿用哪吒的
              CPU #4a86e8 蓝、内存 #00ac0d 绿、硬盘 #e41e10 红 */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="shrink-0 text-muted-foreground">Asset</span>
            <span className="inline-flex items-center gap-1">
              <Cpu className="size-3.5 shrink-0" style={{ color: "#4a86e8" }} />
              <span className="tnum font-medium">{node.cpu_cores ? `${node.cpu_cores} Cores` : "—"}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MemoryStick className="size-3.5 shrink-0" style={{ color: "#00ac0d" }} />
              <span className="tnum font-medium">{gb(node.mem_total)}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <HardDrive className="size-3.5 shrink-0" style={{ color: "#e41e10" }} />
              <span className="tnum font-medium">{gb(node.disk_total)}</span>
            </span>
          </div>

          <div className="mt-4">
            <LatencyPanel latency={latency} />

            <div className="neu-track mt-2.5 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CalendarClock className="size-3.5" />
                到期
              </span>
              {/* 颜色统一由 ExpiryText 内部按 expiryRisk 判定，卡片与列表不会再出现两套阈值 */}
              <ExpiryText node={node} className="text-[13px] font-semibold" />
            </div>

            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <dt className="shrink-0 text-muted-foreground">连接</dt>
                <dd className="tnum min-w-0 truncate" title="TCP / UDP 连接数">
                  {m ? `${m.tcp} / ${m.udp}` : "—"}
                </dd>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <dt className="shrink-0 text-muted-foreground">续费</dt>
                <dd className="min-w-0 truncate">
                  <PriceText node={node} />
                </dd>
              </div>
            </dl>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="neu-track flex min-w-0 items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5">
                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                  <ArrowDown className="size-4 shrink-0 text-info" />
                  下行
                </span>
                <span className="tnum min-w-0 truncate text-[12px] font-semibold">{m ? rate(m.net_rx) : "—"}</span>
              </div>
              <div className="neu-track flex min-w-0 items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5">
                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                  <ArrowUp className="size-4 shrink-0 text-chart-4" />
                  上行
                </span>
                <span className="tnum min-w-0 truncate text-[12px] font-semibold">{m ? rate(m.net_tx) : "—"}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          还没有接入。在后台生成安装命令并执行一次。
        </p>
      )}
    </Card>
  )
}

/** 节点对象与延迟数据都没变时跳过重绘：2 秒一次的推送只更新真正变化的卡片 */
export const NodeCard = memo(NodeCardBase, (a, b) => a.node === b.node && a.latency === b.latency)
