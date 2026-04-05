import type { StatsData } from "../types/stats";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";

function formatCount(value: number): string {
  return new Intl.NumberFormat("zh-CN").format(value);
}

export default function DashboardBusinessStats({
  active_keys_count,
  total_api_calls,
  total_notices,
}: StatsData) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card className="border-ink-200/50 bg-ink-50/50 shadow-none">
        <CardHeader className="pb-1">
          <CardDescription>启用 Key 数</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl text-ink-900">
            {formatCount(active_keys_count)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-ink-200/50 bg-ink-50/50 shadow-none">
        <CardHeader className="pb-1">
          <CardDescription>历史总请求量</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl text-ink-900">
            {formatCount(total_api_calls)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-ink-200/50 bg-ink-50/50 shadow-none">
        <CardHeader className="pb-1">
          <CardDescription>资讯总数</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl text-ink-900">
            {formatCount(total_notices)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
