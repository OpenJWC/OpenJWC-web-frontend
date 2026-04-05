import { RefreshCw, Search } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getLogModules, getLogs } from "./services/logsService";
import type { LogEntry } from "./types/logs";

type LogsState = {
  total: number;
  logs: LogEntry[];
  loading: boolean;
  error: string | null;
};

const DEFAULT_PAGE_SIZE = 10;

function getLevelClass(level: string): string {
  const normalized = level.trim().toLowerCase();
  if (["fatal", "panic", "critical"].includes(normalized)) {
    return "bg-red-100 text-red-700 ring-red-200";
  }
  if (["error", "err"].includes(normalized)) {
    return "bg-rose-100 text-rose-700 ring-rose-200";
  }
  if (["warn", "warning"].includes(normalized)) {
    return "bg-amber-100 text-amber-700 ring-amber-200";
  }
  if (["info", "information"].includes(normalized)) {
    return "bg-blue-100 text-blue-700 ring-blue-200";
  }
  if (["debug", "trace"].includes(normalized)) {
    return "bg-ink-100 text-ink-600 ring-ink-200";
  }
  if (["success", "ok"].includes(normalized)) {
    return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  }
  return "bg-violet-100 text-violet-700 ring-violet-200";
}

export default function Logs() {
  const [state, setState] = useState<LogsState>({
    total: 0,
    logs: [],
    loading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const [sizeInput, setSizeInput] = useState(String(DEFAULT_PAGE_SIZE));
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [levelInput, setLevelInput] = useState("");
  const [moduleInput, setModuleInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [query, setQuery] = useState({ level: "", module: "", keyword: "" });
  const [moduleOptions, setModuleOptions] = useState<string[]>([]);
  const [moduleError, setModuleError] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.total / size)),
    [size, state.total]
  );

  const fetchLogs = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getLogs({
        page,
        size,
        level: query.level,
        module: query.module,
        keyword: query.keyword,
      });
      setState({
        total: data.total,
        logs: data.logs,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "获取日志失败",
      }));
    }
  }, [page, query.keyword, query.level, query.module, size]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modules = await getLogModules();
        setModuleOptions(modules);
        setModuleError(null);
      } catch (error) {
        setModuleError(
          error instanceof Error ? error.message : "获取模块列表失败"
        );
      }
    };
    void fetchModules();
  }, []);

  const handleRefresh = async () => {
    await fetchLogs();
    try {
      const modules = await getLogModules();
      setModuleOptions(modules);
      setModuleError(null);
    } catch (error) {
      setModuleError(
        error instanceof Error ? error.message : "获取模块列表失败"
      );
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedSize = Number(sizeInput);
    if (!Number.isFinite(parsedSize) || parsedSize < 1) {
      return;
    }
    setSize(Math.floor(parsedSize));
    setPage(1);
    setQuery({
      level: levelInput.trim(),
      module: moduleInput.trim(),
      keyword: keywordInput.trim(),
    });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header Card */}
      <div className="rounded-2xl border border-ink-200/60 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl text-ink-900">日志列表</h1>
            <p className="mt-0.5 text-sm text-ink-500">共 {state.total} 条</p>
          </div>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={state.loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-all duration-200 hover:border-ink-300 hover:bg-ink-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={15} />
            刷新
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-5 grid gap-3 md:grid-cols-5"
        >
          <input
            value={levelInput}
            onChange={(event) => setLevelInput(event.target.value)}
            placeholder="level（可选）"
            className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
          <select
            value={moduleInput}
            onChange={(event) => setModuleInput(event.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="">全部模块</option>
            {moduleOptions.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          <input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="keyword（可选）"
            className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
          <input
            value={sizeInput}
            onChange={(event) => setSizeInput(event.target.value)}
            type="number"
            min={1}
            placeholder="size"
            className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-ink-800 hover:shadow active:scale-[0.98]"
          >
            <Search size={15} />
            查询
          </button>
        </form>
        {moduleError && (
          <p className="mt-3 text-xs text-red-500">{moduleError}</p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-200/50 text-sm">
            <thead className="bg-ink-50/50">
              <tr className="text-left text-ink-500">
                <th className="px-4 py-3.5 font-semibold">时间</th>
                <th className="px-4 py-3.5 font-semibold">等级</th>
                <th className="px-4 py-3.5 font-semibold">模块</th>
                <th className="px-4 py-3.5 font-semibold">位置</th>
                <th className="px-4 py-3.5 font-semibold">日志正文</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/50">
              {state.loading &&
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3.5" colSpan={5}>
                      <div className="h-4 animate-pulse rounded-lg bg-gradient-to-r from-ink-100 via-ink-200 to-ink-100 bg-[length:200%_100%]" />
                    </td>
                  </tr>
                ))}
              {!state.loading &&
                state.logs.map((log, index) => (
                  <tr
                    key={`${log.timestamp}-${index}`}
                    className="text-ink-700 transition-colors hover:bg-ink-50/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getLevelClass(
                          log.level
                        )}`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">{log.module}</td>
                    <td className="px-4 py-3.5 font-mono text-xs">{log.location}</td>
                    <td className="max-w-[520px] break-all px-4 py-3.5">
                      {log.message}
                    </td>
                  </tr>
                ))}
              {!state.loading && state.logs.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-ink-400"
                    colSpan={5}
                  >
                    暂无匹配日志
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
