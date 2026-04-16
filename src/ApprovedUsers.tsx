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
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserStatus,
} from "./services/adminUserService";
import type { AdminUserItem } from "./types/adminUser";

type ApprovedUsersState = {
  total: number;
  users: AdminUserItem[];
  loading: boolean;
  error: string | null;
};

const PAGE_SIZE = 10;

const ACTIVE_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "true", label: "可用" },
  { value: "false", label: "停用" },
];

function formatCreatedAt(value: string) {
  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  const timestamp = Date.parse(normalized);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Date(timestamp).toLocaleString("zh-CN");
}

export default function ApprovedUsers() {
  const [state, setState] = useState<ApprovedUsersState>({
    total: 0,
    users: [],
    loading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const [isActiveInput, setIsActiveInput] = useState("");
  const [isActive, setIsActive] = useState("");
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.total / PAGE_SIZE)),
    [state.total]
  );

  const fetchAdminUsers = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getAdminUsers({
        page,
        size: PAGE_SIZE,
        is_active: isActive,
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
        error: error instanceof Error ? error.message : "获取用户列表失败",
      }));
    }
  }, [isActive, page]);

  useEffect(() => {
    void fetchAdminUsers();
  }, [fetchAdminUsers]);

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setIsActive(isActiveInput);
  };

  const handleToggleStatus = async (user: AdminUserItem) => {
    const targetActive = !user.is_active;
    setUpdatingIds((prev) => [...prev, user.id]);
    try {
      const msg = await updateAdminUserStatus(user.id, {
        is_active: targetActive,
      });
      toast.success(msg || "账号状态修改成功");
      await fetchAdminUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "账号状态修改失败");
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== user.id));
    }
  };

  const handleDelete = async (user: AdminUserItem) => {
    const confirmed = window.confirm(
      `确认删除账号（ID: ${user.id}，用户名: ${user.username}）？该操作不可恢复。`
    );

    if (!confirmed) {
      return;
    }

    setDeletingIds((prev) => [...prev, user.id]);
    try {
      const msg = await deleteAdminUser(user.id);
      toast.success(msg || "账号删除成功");
      await fetchAdminUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "账号删除失败");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== user.id));
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">已通过用户列表</CardTitle>
              <CardDescription>
                管理所有可登录账号，共 {state.total} 条
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchAdminUsers()}
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
                账号状态
              </label>
              <select
                value={isActiveInput}
                onChange={(event) => setIsActiveInput(event.target.value)}
                className="min-w-40 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                {ACTIVE_OPTIONS.map((option) => (
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
                    <th className="px-4 py-3.5 font-semibold">账号状态</th>
                    <th className="px-4 py-3.5 font-semibold">创建时间</th>
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
                    state.users.map((user) => (
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
                          <Badge
                            variant={user.is_active ? "success" : "default"}
                          >
                            {user.is_active ? "可用" : "停用"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-500">
                          {formatCreatedAt(user.created_at)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void handleToggleStatus(user)}
                              disabled={
                                updatingIds.includes(user.id) ||
                                deletingIds.includes(user.id)
                              }
                              className={
                                user.is_active
                                  ? "border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                                  : "border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
                              }
                            >
                              {updatingIds.includes(user.id)
                                ? "提交中..."
                                : user.is_active
                                ? "停用"
                                : "启用"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void handleDelete(user)}
                              disabled={
                                deletingIds.includes(user.id) ||
                                updatingIds.includes(user.id)
                              }
                              className="border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                            >
                              {deletingIds.includes(user.id)
                                ? "删除中..."
                                : "删除"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {!state.loading && state.users.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-12 text-center text-ink-400"
                        colSpan={6}
                      >
                        暂无匹配用户
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
    </div>
  );
}
