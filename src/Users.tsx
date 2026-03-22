import { Copy, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  createApiKey,
  deleteApiKey,
  getApiKeys,
  updateApiKeyStatus,
} from "./services/apikeyService";
import type { ApiKeyItem } from "./types/apikey";
type UsersState = {
  total: number;
  items: ApiKeyItem[];
  loading: boolean;
  error: string | null;
};
const PAGE_SIZE = 10;
function formatCreatedAt(value: string): string {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) {
    return value;
  }
  const ms = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
  return new Date(ms).toLocaleString("zh-CN");
}
export default function Users() {
  const [state, setState] = useState<UsersState>({
    total: 0,
    items: [],
    loading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [createOwnerName, setCreateOwnerName] = useState("");
  const [createMaxDevices, setCreateMaxDevices] = useState("1");
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<number[]>([]);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(state.total / PAGE_SIZE));
  }, [state.total]);
  const fetchApiKeys = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getApiKeys({ page, size: PAGE_SIZE, keyword });
      setState({
        total: data.total,
        items: data.items,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "获取 apikey 列表失败",
      }));
    }
  }, [keyword, page]);
  useEffect(() => {
    void fetchApiKeys();
  }, [fetchApiKeys]);
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  };
  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    try {
      const result = await createApiKey({
        owner_name: createOwnerName,
        max_devices: Number(createMaxDevices),
      });
      setCreatedKey(result.new_key);
      toast.success("创建 apikey 成功");
      void fetchApiKeys();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建 apikey 失败");
    } finally {
      setCreating(false);
    }
  };
  const handleCopyKey = async () => {
    if (!createdKey) {
      return;
    }
    try {
      await navigator.clipboard.writeText(createdKey);
      toast.success("已复制新 key");
    } catch {
      toast.error("复制失败，请手动复制");
    }
  };
  const handleToggleStatus = async (item: ApiKeyItem) => {
    const targetActive = !item.is_active;
    setTogglingIds((prev) => [...prev, item.id]);
    try {
      const msg = await updateApiKeyStatus(item.id, {
        is_active: targetActive,
      });
      toast.success(msg || "状态更新成功");
      void fetchApiKeys();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新状态失败");
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };
  const handleDelete = async (item: ApiKeyItem) => {
    const confirmed = window.confirm(
      `确认删除 apikey（ID: ${item.id}，用户: ${item.owner_name}）？该操作不可恢复。`
    );
    if (!confirmed) {
      return;
    }
    setDeletingIds((prev) => [...prev, item.id]);
    try {
      const msg = await deleteApiKey(item.id);
      toast.success(msg || "删除成功");
      void fetchApiKeys();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除失败");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              API Key 列表
            </h1>
            <p className="text-sm text-slate-500">共 {state.total} 条</p>
          </div>
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-sm items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="按用户名搜索"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              查询
            </button>
          </form>
        </div>

        <form
          onSubmit={handleCreate}
          className="mt-4 grid gap-3 md:grid-cols-[1fr_140px_auto]"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              owner_name
            </label>
            <input
              value={createOwnerName}
              onChange={(event) => setCreateOwnerName(event.target.value)}
              placeholder="输入用户名"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              max_devices
            </label>
            <input
              value={createMaxDevices}
              onChange={(event) => setCreateMaxDevices(event.target.value)}
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={16} />
              {creating ? "创建中..." : "创建 Key"}
            </button>
          </div>
        </form>

        {createdKey && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs text-emerald-700">
              新创建的 API Key（请立即保存）
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="flex-1 break-all font-mono text-xs text-emerald-900">
                {createdKey}
              </p>
              <button
                type="button"
                onClick={() => void handleCopyKey()}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs text-emerald-700 transition hover:bg-emerald-100"
              >
                <Copy size={14} />
                复制
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">用户名</th>
                <th className="px-4 py-3 font-medium">API Key</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">设备绑定</th>
                <th className="px-4 py-3 font-medium">总请求</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3" colSpan={7}>
                      <div className="h-4 animate-pulse rounded bg-slate-200" />
                    </td>
                  </tr>
                ))}
              {!state.loading &&
                state.items.map((item) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3">{item.owner_name}</td>
                    <td className="max-w-[240px] px-4 py-3 font-mono text-xs text-slate-600">
                      {item.key_string}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            item.is_active
                              ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {item.is_active ? "启用" : "停用"}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleToggleStatus(item)}
                          disabled={
                            togglingIds.includes(item.id) ||
                            deletingIds.includes(item.id)
                          }
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {togglingIds.includes(item.id)
                            ? "更新中..."
                            : item.is_active
                            ? "停用"
                            : "启用"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(item)}
                          disabled={
                            deletingIds.includes(item.id) ||
                            togglingIds.includes(item.id)
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          {deletingIds.includes(item.id) ? "删除中..." : "删除"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.bound_devices.length}/{item.max_devices}
                    </td>
                    <td className="px-4 py-3">{item.total_requests}</td>
                    <td className="px-4 py-3">
                      {formatCreatedAt(item.created_at)}
                    </td>
                  </tr>
                ))}
              {!state.loading && state.items.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={7}
                  >
                    暂无匹配数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || state.loading}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          上一页
        </button>
        <span className="text-sm text-slate-600">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages || state.loading}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
}
