export type McpServerTimingMetric = "auth" | "handler" | "store";

export class McpServerTiming {
  private readonly durations = new Map<McpServerTimingMetric, number>();
  private readonly startedAt: number;

  constructor(private readonly now: () => number = () => performance.now()) {
    this.startedAt = this.now();
  }

  async measure<T>(metric: McpServerTimingMetric, callback: () => Promise<T>) {
    const startedAt = this.now();
    try {
      return await callback();
    } finally {
      this.add(metric, this.now() - startedAt);
    }
  }

  add(metric: McpServerTimingMetric, durationMs: number) {
    if (!Number.isFinite(durationMs) || durationMs < 0) return;
    this.durations.set(metric, (this.durations.get(metric) ?? 0) + durationMs);
  }

  toHeader() {
    const values = (["auth", "store", "handler"] as const).flatMap((metric) => {
      const duration = this.durations.get(metric);
      return duration === undefined ? [] : [`${metric};dur=${formatDuration(duration)}`];
    });
    values.push(`total;dur=${formatDuration(Math.max(0, this.now() - this.startedAt))}`);
    return values.join(", ");
  }
}

export function applyMcpServerTiming<T extends Response>(response: T, timing: McpServerTiming) {
  response.headers.set("Server-Timing", timing.toHeader());
  return response;
}

function formatDuration(durationMs: number) {
  return Math.round(durationMs * 10) / 10;
}
