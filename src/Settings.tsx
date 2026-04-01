import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
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
import {
  changeAdminPassword,
  getSettings,
  refreshMotto,
  runCrawler,
  resetSettings,
  updateSettings,
} from "./services/settingsService";
import type { SettingsData } from "./types/settings";
type SettingsState = {
  data: SettingsData | null;
  loading: boolean;
  error: string | null;
  lastUpdatedAt: number | null;
};

function toEditableString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

const SETTING_FIELD_HINTS: Record<string, string> = {
  prompt_debug:
    "设置为 1 会在日志中打印更多 prompt 注入调试信息，设置为 0 则关闭。",
  prompt_preview_length: "指定 prompt 文本预览部分长度。",
  preview_length: "指定 prompt 文本预览部分长度。",
  crawler_interval_minutes: "爬虫周期，单位为分钟。",
  crawler_days_gap: "爬虫只抓取从今天往前 crawler_days_gap 天内的资讯。",
  search_max_day_diff: "语义搜索仅检索最近 search_max_day_diff 天内的资讯。",
  search_max_diff: "语义搜索仅检索最近 search_max_diff 天内的资讯。",
};

function isSensitiveSettingKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return (
    normalized.includes("api_key") ||
    normalized.includes("secret") ||
    normalized.includes("token") ||
    normalized.includes("password")
  );
}

export default function Settings() {
  const [state, setState] = useState<SettingsState>({
    data: null,
    loading: true,
    error: null,
    lastUpdatedAt: null,
  });
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>(
    {}
  );
  const [visibleSensitiveFields, setVisibleSensitiveFields] = useState<
    Record<string, boolean>
  >({});
  const [saving, setSaving] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [refreshingMotto, setRefreshingMotto] = useState(false);
  const [runningCrawler, setRunningCrawler] = useState(false);
  const [resetting, setResetting] = useState(false);
  const fetchSettings = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getSettings();
      setState({
        data,
        loading: false,
        error: null,
        lastUpdatedAt: Date.now(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "获取系统设置失败",
      }));
    }
  }, []);
  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);
  useEffect(() => {
    if (!state.data) {
      return;
    }
    const nextDraft: Record<string, string> = {};
    Object.entries(state.data).forEach(([key, value]) => {
      nextDraft[key] = toEditableString(value);
    });
    setSettingsDraft(nextDraft);
  }, [state.data]);
  const entries = useMemo(() => Object.entries(state.data ?? {}), [state.data]);
  const handleUpdate = async () => {
    const payload: Record<string, unknown> = {};
    Object.entries(settingsDraft).forEach(([key, value]) => {
      const currentValue = toEditableString(state.data?.[key]);
      if (value !== currentValue) {
        payload[key] = value;
      }
    });
    if (Object.keys(payload).length === 0) {
      toast.info("没有检测到变更字段");
      return;
    }
    setSaving(true);
    try {
      const msg = await updateSettings(payload);
      toast.success(msg || "设置更新成功");
      await fetchSettings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新设置失败");
    } finally {
      setSaving(false);
    }
  };
  const handleChangePassword = async () => {
    const oldPassword = oldPasswordInput.trim();
    const newPassword = newPasswordInput.trim();
    const confirmPassword = confirmPasswordInput.trim();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("请完整填写旧密码和新密码");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("新密码至少 6 位");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致");
      return;
    }
    setChangingPassword(true);
    try {
      const msg = await changeAdminPassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success(msg || "密码修改成功");
      setOldPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "修改密码失败");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResetSettings = async () => {
    const confirmed = window.confirm("确认重置全部系统设置？");
    if (!confirmed) {
      return;
    }
    setResetting(true);
    try {
      const msg = await resetSettings([]);
      toast.success(msg || "重置成功");
      await fetchSettings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "重置设置失败");
    } finally {
      setResetting(false);
    }
  };

  const handleRefreshMotto = async () => {
    setRefreshingMotto(true);
    try {
      const msg = await refreshMotto();
      toast.success(msg || "刷新每日一言成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "刷新每日一言失败");
    } finally {
      setRefreshingMotto(false);
    }
  };

  const handleRunCrawler = async () => {
    setRunningCrawler(true);
    try {
      const msg = await runCrawler();
      toast.success(msg || "手动执行爬虫成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "手动执行爬虫失败");
    } finally {
      setRunningCrawler(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>系统设置</CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={() => void fetchSettings()}
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
            <div className="grid gap-3 md:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          )}
          {!state.loading && !state.error && entries.length === 0 && (
            <Alert>
              <AlertTitle>暂无数据</AlertTitle>
              <AlertDescription>
                接口返回成功，但 data 为空对象。
              </AlertDescription>
            </Alert>
          )}
          {!state.loading && entries.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-none">
              <CardHeader className="pb-2">
                <CardDescription>修改系统设置</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {entries.map(([key]) => (
                    <div className="space-y-1" key={key}>
                      <label className="text-xs font-medium text-slate-600">
                        {key}
                      </label>
                      {key.includes("prompt") ? (
                        <textarea
                          value={settingsDraft[key] ?? ""}
                          onChange={(event) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              [key]: event.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      ) : (
                        <div className="relative">
                          <input
                            type={
                              isSensitiveSettingKey(key) &&
                              !visibleSensitiveFields[key]
                                ? "password"
                                : "text"
                            }
                            autoComplete="off"
                            value={settingsDraft[key] ?? ""}
                            onChange={(event) =>
                              setSettingsDraft((prev) => ({
                                ...prev,
                                [key]: event.target.value,
                              }))
                            }
                            className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                              isSensitiveSettingKey(key) ? "pr-10" : ""
                            }`}
                          />
                          {isSensitiveSettingKey(key) && (
                            <button
                              type="button"
                              onClick={() =>
                                setVisibleSensitiveFields((prev) => ({
                                  ...prev,
                                  [key]: !prev[key],
                                }))
                              }
                              className="absolute inset-y-0 right-2 inline-flex items-center text-slate-500 transition hover:text-slate-700"
                            >
                              {visibleSensitiveFields[key] ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                      {SETTING_FIELD_HINTS[key] && (
                        <p className="text-xs text-slate-500">
                          {SETTING_FIELD_HINTS[key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => void handleUpdate()} disabled={saving}>
                    {saving ? "保存中..." : "保存设置"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {!state.loading && entries.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-none">
              <CardHeader className="pb-2">
                <CardDescription>修改管理员密码</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <input
                  value={oldPasswordInput}
                  onChange={(event) => setOldPasswordInput(event.target.value)}
                  type="password"
                  placeholder="旧密码"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <input
                  value={newPasswordInput}
                  onChange={(event) => setNewPasswordInput(event.target.value)}
                  type="password"
                  placeholder="新密码（至少 6 位）"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <input
                  value={confirmPasswordInput}
                  onChange={(event) =>
                    setConfirmPasswordInput(event.target.value)
                  }
                  type="password"
                  placeholder="确认新密码"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <Button
                  onClick={() => void handleChangePassword()}
                  disabled={changingPassword}
                >
                  {changingPassword ? "提交中..." : "修改密码"}
                </Button>
              </CardContent>
            </Card>
          )}
          {!state.loading && entries.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-none">
              <CardHeader className="pb-2">
                <CardDescription>每日一言</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    onClick={() => void handleRefreshMotto()}
                    disabled={refreshingMotto}
                  >
                    {refreshingMotto ? "刷新中..." : "手动刷新每日一言"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {!state.loading && entries.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-none">
              <CardHeader className="pb-2">
                <CardDescription>爬虫</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    onClick={() => void handleRunCrawler()}
                    disabled={runningCrawler}
                  >
                    {runningCrawler ? "执行中..." : "手动执行爬虫"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {!state.loading && entries.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-none">
              <CardHeader className="pb-2">
                <CardDescription>重置系统设置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => void handleResetSettings()}
                    disabled={resetting}
                  >
                    {resetting ? "重置中..." : "重置全部设置"}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
