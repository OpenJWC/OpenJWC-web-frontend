import type { Data } from "../types/monitor";
import ReactEcharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";

function toNumber(value: string): number {
  const normalized = value.trim();
  const matched = normalized.match(/-?\d+(?:\.\d+)?/);
  const parsed = matched ? Number(matched[0]) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function splitDuration(seconds: number) {
  const day = Math.floor(seconds / 86400);
  const hour = Math.floor((seconds % 86400) / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  const second = Math.floor(seconds % 60);
  return { day, hour, minute, second };
}

function formatDuration(seconds: number): string {
  const { day, hour, minute, second } = splitDuration(seconds);
  if (day > 0) {
    return `${day}天 ${hour}小时 ${minute}分钟 ${second}秒`;
  }
  if (hour > 0) {
    return `${hour}小时 ${minute}分钟 ${second}秒`;
  }
  if (minute > 0) {
    return `${minute}分钟 ${second}秒`;
  }
  return `${second}秒`;
}

export default function DashboardSysInfo({
  cpu_percent,
  ram_total_mb,
  ram_used_mb,
  uptime_seconds,
  ...rest
}: Data) {
  const cpuValue = Math.max(0, Math.min(100, toNumber(cpu_percent)));
  const totalRam = toNumber(ram_total_mb);
  const usedRam = Math.min(toNumber(ram_used_mb), totalRam);
  const freeRam = Math.max(totalRam - usedRam, 0);
  const uptime = toNumber(uptime_seconds);

  const cpuOption: EChartsOption = {
    title: {
      text: "CPU 使用率",
      left: "center",
      top: 10,
      textStyle: {
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      },
    },
    series: [
      {
        type: "gauge",
        min: 0,
        max: 100,
        progress: { show: true, width: 16 },
        data: [{ value: cpuValue }],
        axisLine: {
          lineStyle: {
            width: 16,
            color: [
              [0.5, "#22c55e"],
              [0.8, "#f59e0b"],
              [1, "#ef4444"],
            ],
          },
        },
        pointer: {
          length: "70%",
          width: 6,
        },
        axisTick: { show: false },
        splitLine: { length: 12 },
        axisLabel: { distance: 18, fontSize: 10 },
        detail: {
          valueAnimation: true,
          formatter: "{value}%",
          fontSize: 22,
          offsetCenter: [0, "65%"],
        },
      },
    ],
  };

  const memoryOption: EChartsOption = {
    title: {
      text: "内存占用",
      left: "center",
      top: 10,
      textStyle: {
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      },
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      bottom: 0,
      left: "center",
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      },
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "75%"],
        center: ["50%", "48%"],
        avoidLabelOverlap: true,
        label: {
          formatter: "{b}\n{d}%",
          fontSize: 11,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
        data: [
          { value: usedRam, name: "已用内存", itemStyle: { color: "#3b82f6" } },
          { value: freeRam, name: "剩余内存", itemStyle: { color: "#94a3b8" } },
        ],
      },
    ],
  };

  const extraEntries = Object.entries(rest);

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-ink-200/50 bg-ink-50/50 shadow-none">
          <CardHeader className="pb-1">
            <CardDescription>CPU 使用率</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl text-ink-900">
              {cpuValue.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-ink-200/50 bg-ink-50/50 shadow-none">
          <CardHeader className="pb-1">
            <CardDescription>内存</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl text-ink-900">
              {usedRam.toFixed(0)} / {totalRam.toFixed(0)} MB
            </p>
          </CardContent>
        </Card>
        <Card className="border-ink-200/50 bg-ink-50/50 shadow-none">
          <CardHeader className="pb-1">
            <CardDescription>运行时长</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl text-ink-900">
              {formatDuration(uptime)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-ink-200/60 bg-white shadow-none lg:col-span-2">
          <CardContent className="p-3">
            <ReactEcharts option={cpuOption} style={{ height: 300 }} />
          </CardContent>
        </Card>
        <Card className="border-ink-200/60 bg-white shadow-none lg:col-span-3">
          <CardContent className="p-3">
            <div className="grid gap-3 lg:grid-cols-2">
              <ReactEcharts option={memoryOption} style={{ height: 300 }} />
              <div className="flex flex-col justify-center rounded-xl border border-ink-200/60 bg-ink-50/50 p-5">
                <p className="text-sm text-ink-500">已用内存</p>
                <p className="mt-1 font-display text-2xl text-ink-900">
                  {usedRam.toFixed(0)} MB
                </p>
                <p className="mt-4 text-sm text-ink-500">剩余内存</p>
                <p className="mt-1 font-display text-2xl text-ink-900">
                  {freeRam.toFixed(0)} MB
                </p>
                <p className="mt-4 text-xs text-ink-400">
                  占用率{" "}
                  {totalRam > 0
                    ? ((usedRam / totalRam) * 100).toFixed(1)
                    : "0.0"}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extra Fields */}
      {extraEntries.length > 0 && (
        <Card className="border-ink-200/50 bg-ink-50/50 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>附加字段</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {extraEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-start justify-between gap-4 border-b border-ink-200/50 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-sm text-ink-500">{key}</span>
                <span className="max-w-[70%] break-all text-right text-sm font-medium text-ink-700">
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
