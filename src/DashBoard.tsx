import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DashboardBusinessStats from "./components/DashboardBusinessStats";
import DashboardSysInfo from "./components/DashboardSysInfo";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Skeleton } from "./components/ui/skeleton";
import { getStats, getSysInfo } from "./services/monitorService";
import type { Data } from "./types/monitor";
import type { StatsData } from "./types/stats";

type DashboardState = {
  sysInfo: Data | null;
  stats: StatsData | null;
  loading: boolean;
  error: string | null;
  lastUpdatedAt: number | null;
};

export default function DashBoard() {
  const [state, setState] = useState<DashboardState>({
    sysInfo: null,
    stats: null,
    loading: true,
    error: null,
    lastUpdatedAt: null,
  });

  const fetchSysInfo = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [sysInfo, stats] = await Promise.all([getSysInfo(), getStats()]);
      setState({
        sysInfo,
        stats,
        loading: false,
        error: null,
        lastUpdatedAt: Date.now(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "获取系统信息失败";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => {
    void fetchSysInfo();
    const timer = window.setInterval(() => {
      void fetchSysInfo();
    }, 30000);
    return () => {
      window.clearInterval(timer);
    };
  }, [fetchSysInfo]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>系统概览</CardTitle>
              <CardDescription>每 30 秒自动刷新</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => void fetchSysInfo()}
              disabled={state.loading}
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertTitle>获取失败</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.loading && (
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          )}

          {!state.loading &&
            !state.error &&
            (!state.sysInfo || Object.keys(state.sysInfo).length === 0) &&
            (!state.stats || Object.keys(state.stats).length === 0) && (
              <Alert>
                <AlertTitle>暂无数据</AlertTitle>
                <AlertDescription>
                  接口返回成功，但 data 为空对象。
                </AlertDescription>
              </Alert>
            )}

          {!state.loading &&
            state.sysInfo &&
            Object.keys(state.sysInfo).length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-slate-700">
                  系统信息
                </h2>
                <DashboardSysInfo {...state.sysInfo} />
              </div>
            )}

          {!state.loading &&
            state.stats &&
            Object.keys(state.stats).length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-slate-700">
                  业务信息
                </h2>
                <DashboardBusinessStats {...state.stats} />
              </div>
            )}

          {state.lastUpdatedAt && (
            <p className="text-xs text-slate-500">
              上次更新时间：
              {new Date(state.lastUpdatedAt).toLocaleString("zh-CN")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
