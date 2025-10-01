import { Card, CardHeader } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import { useMemo } from "react";
import type { MetricsSuccessResponse } from "@/types/api";

interface APYCardProps {
  metrics: MetricsSuccessResponse | null;
  isLoading: boolean;
}

export function APYCard({ metrics, isLoading }: APYCardProps) {
  const currentApy = metrics?.summary.currentApy ?? 0;
  const history = metrics?.history;

  const { path, changeLabel, trendClass } = useMemo(() => {
    const apyHistory = history ?? [];

    if (!apyHistory.length) {
      return {
        path: null,
        changeLabel: null,
        trendClass: "",
      } as const;
    }

    const lastEntries = apyHistory
      .map((item) => item.apy)
      .filter((value) => Number.isFinite(value));

    if (lastEntries.length < 2) {
      return {
        path: null,
        changeLabel: null,
        trendClass: "",
      } as const;
    }

    const points = lastEntries.slice(-8);
    const min = Math.min(...points);
    const max = Math.max(...points);

    const pathInstructions = points
      .map((value, index) => {
        const x = (index / (points.length - 1 || 1)) * 100;
        const normalised = max === min ? 0.5 : (value - min) / (max - min);
        const y = (1 - normalised) * 100;
        const command = index === 0 ? "M" : "L";
        return `${command} ${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");

    const delta = points[points.length - 1] - points[0];
    const changeLabel = `${delta >= 0 ? "+" : ""}${delta.toFixed(2)} pts`;
    const trendClass = delta >= 0 ? "text-bright-pink" : "text-muted-foreground";

    return {
      path: pathInstructions,
      changeLabel,
      trendClass,
    } as const;
  }, [history]);

  return (
    <Card className="relative h-full overflow-hidden border-none bg-faint-pink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_60%)]" />
      <CardHeader className="relative z-10 space-y-6 pb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.32em] text-bright-pink">
          Current APY
        </span>
        <div className="text-6xl font-semibold tracking-tight text-bright-pink">
          {isLoading ? "-" : formatPercent(currentApy)}
        </div>
        {!isLoading && path ? (
          <div className="space-y-2">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-16 w-full text-bright-pink/70">
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              />
            </svg>
            {changeLabel ? (
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <span className={trendClass}>{changeLabel}</span> over last updates
              </div>
            ) : null}
          </div>
        ) : null}
      </CardHeader>
    </Card>
  );
}
