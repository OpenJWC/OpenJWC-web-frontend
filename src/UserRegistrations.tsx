import { RefreshCw } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  getUserRegistrationDetail,
  getUserRegistrations,
  reviewUserRegistration,
} from "./services/userRegistrationService";
import type {
  UserRegistrationDetail,
  UserRegistrationItem,
  UserRegistrationStatus,
} from "./types/userRegistration";

type UserRegistrationsState = {
  total: number;
  users: UserRegistrationItem[];
  loading: boolean;
  error: string | null;
};

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "pending", label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "rejected", label: "已驳回" },
];

function getStatusMeta(status: UserRegistrationStatus) {
  if (status === "approved") {
    return { label: "已通过", variant: "success" as const };
  }
  if (status === "rejected") {
    return { label: "已驳回", variant: "danger" as const };
  }
  if (status === "pending") {
    return { label: "待审核", variant: "warning" as const };
  }
  return { label: status, variant: "default" as const };
}

function formatCreatedAt(value: string) {
  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  const timestamp = Date.parse(normalized);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Date(timestamp).toLocaleString("zh-CN");
}

export default function UserRegistrations() {
  const [state, setState] = useState<UserRegistrationsState>({
    total: 0,
    users: [],
    loading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const [statusInput, setStatusInput] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserRegistrationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [reviewInput, setReviewInput] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.total / PAGE_SIZE)),
    [state.total]
  );

  const fetchUserRegistrations = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getUserRegistrations({
        page,
        size: PAGE_SIZE,
        status,
      });
      setState({
        total: data.total,
        users: data.users,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "获取注册请求列表失败",
      }));
    }
  }, [page, status]);

  useEffect(() => {
    void fetchUserRegistrations();
  }, [fetchUserRegistrations]);

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setStatus(statusInput);
  };

  const handleViewDetail = async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const data = await getUserRegistrationDetail(id);
      setDetail(data);
      setReviewInput("");
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "获取注册请求详情失败"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReview = async (action: "approved" | "rejected") => {
    if (!selectedId || !detail) {
      return;
    }

    if (detail.status !== "pending") {
      toast.error("当前注册请求已审核，不能重复提交");
      return;
    }

    const reason = reviewInput.trim();
    if (!reason) {
      toast.error("请先填写审核理由");
      return;
    }

    setReviewing(true);
    try {
      const msg = await reviewUserRegistration(selectedId, {
        action,
        review: reason,
      });
      toast.success(msg || "审核成功");
      await Promise.all([handleViewDetail(selectedId), fetchUserRegistrations()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "审核注册请求失败");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">注册审核列表</CardTitle>
              <CardDescription>
                查看并筛选用户注册申请，共 {state.total} 条
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchUserRegistrations()}
              disabled={state.loading}
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={handleFilterSubmit}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                审核状态
              </label>
              <select
                value={statusInput}
                onChange={(event) => setStatusInput(event.target.value)}
                className="min-w-40 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">查询</Button>
          </form>

          {state.error && (
            <Alert variant="destructive">
              <AlertTitle>获取失败</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="overflow-hidden rounded-xl border border-ink-200/60">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-ink-200/50 text-sm">
                <thead className="bg-ink-50/50">
                  <tr className="text-left text-ink-500">
                    <th className="px-4 py-3.5 font-semibold">ID</th>
                    <th className="px-4 py-3.5 font-semibold">用户名</th>
                    <th className="px-4 py-3.5 font-semibold">邮箱</th>
                    <th className="px-4 py-3.5 font-semibold">审核状态</th>
                    <th className="px-4 py-3.5 font-semibold">申请时间</th>
                    <th className="px-4 py-3.5 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200/50">
                  {state.loading &&
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3.5" colSpan={6}>
                          <div className="h-4 animate-pulse rounded-lg bg-gradient-to-r from-ink-100 via-ink-200 to-ink-100 bg-[length:200%_100%]" />
                        </td>
                      </tr>
                    ))}

                  {!state.loading &&
                    state.users.map((user) => {
                      const statusMeta = getStatusMeta(user.status);
                      return (
                        <tr
                          key={user.id}
                          className="text-ink-700 transition-colors hover:bg-ink-50/50"
                        >
                          <td className="px-4 py-3.5 font-mono text-xs">
                            {user.id}
                          </td>
                          <td className="px-4 py-3.5 font-medium">
                            {user.username}
                          </td>
                          <td className="px-4 py-3.5 text-ink-600">
                            {user.email}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant={statusMeta.variant}>
                              {statusMeta.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-ink-500">
                            {formatCreatedAt(user.created_at)}
                          </td>
                          <td className="px-4 py-3.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void handleViewDetail(user.id)}
                              disabled={detailLoading && selectedId === user.id}
                            >
                              {detailLoading && selectedId === user.id
                                ? "加载中..."
                                : "查看详情"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}

                  {!state.loading && state.users.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-12 text-center text-ink-400"
                        colSpan={6}
                      >
                        暂无匹配的注册请求
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || state.loading}
            >
              上一页
            </Button>
            <span className="px-3 text-sm text-ink-600">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={page >= totalPages || state.loading}
            >
              下一页
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedId && (
        <Card>
          <CardHeader className="pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl">注册请求详情</CardTitle>
              <CardDescription>当前请求 ID：{selectedId}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailLoading && (
              <p className="text-sm text-ink-500">详情加载中...</p>
            )}

            {detailError && (
              <Alert variant="destructive">
                <AlertTitle>获取失败</AlertTitle>
                <AlertDescription>{detailError}</AlertDescription>
              </Alert>
            )}

            {detail && (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-ink-200/60 bg-ink-50/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                      用户名
                    </p>
                    <p className="mt-2 text-base font-medium text-ink-900">
                      {detail.username}
                    </p>
                  </div>
                  <div className="rounded-xl border border-ink-200/60 bg-ink-50/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                      邮箱
                    </p>
                    <p className="mt-2 break-all text-base font-medium text-ink-900">
                      {detail.email}
                    </p>
                  </div>
                  <div className="rounded-xl border border-ink-200/60 bg-ink-50/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                      审核状态
                    </p>
                    <div className="mt-2">
                      <Badge variant={getStatusMeta(detail.status).variant}>
                        {getStatusMeta(detail.status).label}
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-xl border border-ink-200/60 bg-ink-50/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                      申请时间
                    </p>
                    <p className="mt-2 text-base font-medium text-ink-900">
                      {formatCreatedAt(detail.created_at)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-ink-200/60 bg-ink-50/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-ink-800">审核操作</p>
                    {detail.status !== "pending" && (
                      <span className="text-xs text-ink-500">
                        当前请求已完成审核
                      </span>
                    )}
                  </div>
                  <textarea
                    value={reviewInput}
                    onChange={(event) => setReviewInput(event.target.value)}
                    rows={3}
                    placeholder="填写审核理由"
                    disabled={reviewing || detail.status !== "pending"}
                    className="mt-3 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-ink-50"
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleReview("rejected")}
                      disabled={reviewing || detail.status !== "pending"}
                      className="border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                    >
                      {reviewing ? "提交中..." : "驳回"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void handleReview("approved")}
                      disabled={reviewing || detail.status !== "pending"}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {reviewing ? "提交中..." : "通过"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
