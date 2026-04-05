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
    <div className="space-y-4 animate-slide-up">
      {/* Header Card */}
      <div className="rounded-2xl border border-ink-200/60 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-200/50 pb-4">
          <div>
            <h1 className="font-display text-xl text-ink-900">API Key 列表</h1>
            <p className="mt-0.5 text-sm text-ink-500">共 {state.total} 条</p>
          </div>
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-sm items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="按用户名搜索"
                className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-ink-800 hover:shadow active:scale-[0.98]"
            >
              查询
            </button>
          </form>
        </div>

        {/* Create Form */}
        <form
          onSubmit={handleCreate}
          className="mt-4 grid gap-3 md:grid-cols-[1fr_140px_auto]"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              owner_name
            </label>
            <input
              value={createOwnerName}
              onChange={(event) => setCreateOwnerName(event.target.value)}
              placeholder="输入用户名"
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              max_devices
            </label>
            <input
              value={createMaxDevices}
              onChange={(event) => setCreateMaxDevices(event.target.value)}
              type="number"
              min={1}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={16} />
              {creating ? "创建中..." : "创建 Key"}
            </button>
          </div>
        </form>

        {/* Created Key Display */}
        {createdKey && (
          <div className="mt-4 rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4">
            <p className="text-xs font-semibold text-emerald-700">
              新创建的 API Key（请立即保存）
            </p>
            <div className="mt-2 flex items-center gap-3">
              <p className="flex-1 break-all font-mono text-xs text-emerald-900">
                {createdKey}
              </p>
              <button
                type="button"
                onClick={() => void handleCopyKey()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-100"
              >
                <Copy size={14} />
                复制
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-200/50 text-sm">
            <thead className="bg-ink-50/50">
              <tr className="text-left text-ink-500">
                <th className="px-4 py-3.5 font-semibold">ID</th>
                <th className="px-4 py-3.5 font-semibold">用户名</th>
                <th className="px-4 py-3.5 font-semibold">API Key</th>
                <th className="px-4 py-3.5 font-semibold">状态</th>
                <th className="px-4 py-3.5 font-semibold">设备绑定</th>
                <th className="px-4 py-3.5 font-semibold">总请求</th>
                <th className="px-4 py-3.5 font-semibold">创建时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/50">
              {state.loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3.5" colSpan={7}>
                      <div className="h-4 animate-pulse rounded-lg bg-gradient-to-r from-ink-100 via-ink-200 to-ink-100 bg-[length:200%_100%]" />
                    </td>
                  </tr>
                ))}
              {!state.loading &&
                state.items.map((item) => (
                  <tr key={item.id} className="text-ink-700 transition-colors hover:bg-ink-50/50">
                    <td className="px-4 py-3.5 font-mono text-xs">{item.id}</td>
                    <td className="px-4 py-3.5 font-medium">{item.owner_name}</td>
                    <td className="max-w-[240px] px-4 py-3.5 font-mono text-xs text-ink-500">
                      {item.key_string}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            item.is_active
                              ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600"
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
                          className="rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600 transition-all duration-200 hover:border-ink-300 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-all duration-200 hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          {deletingIds.includes(item.id) ? "删除中..." : "删除"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {item.bound_devices.length}/{item.max_devices}
                    </td>
                    <td className="px-4 py-3.5">{item.total_requests}</td>
                    <td className="px-4 py-3.5 text-xs">
                      {formatCreatedAt(item.created_at)}
                    </td>
                  </tr>
                ))}
              {!state.loading && state.items.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-ink-400"
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

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || state.loading}
          className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-all duration-200 hover:border-ink-300 hover:bg-ink-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          上一页
        </button>
        <span className="px-3 text-sm text-ink-600">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages || state.loading}
          className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-all duration-200 hover:border-ink-300 hover:bg-ink-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
}
