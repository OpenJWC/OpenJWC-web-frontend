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
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">日志列表</h1>
            <p className="text-sm text-slate-500">共 {state.total} 条</p>
          </div>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={state.loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            刷新
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-4 grid gap-3 md:grid-cols-5"
        >
          <input
            value={levelInput}
            onChange={(event) => setLevelInput(event.target.value)}
            placeholder="level（可选）"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={moduleInput}
            onChange={(event) => setModuleInput(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <input
            value={sizeInput}
            onChange={(event) => setSizeInput(event.target.value)}
            type="number"
            min={1}
            placeholder="size"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Search size={16} />
            查询
          </button>
        </form>
        {moduleError && (
          <p className="mt-2 text-xs text-red-500">{moduleError}</p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">等级</th>
                <th className="px-4 py-3 font-medium">模块</th>
                <th className="px-4 py-3 font-medium">位置</th>
                <th className="px-4 py-3 font-medium">日志正文</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.loading &&
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="h-4 animate-pulse rounded bg-slate-200" />
                    </td>
                  </tr>
                ))}
              {!state.loading &&
                state.logs.map((log, index) => (
                  <tr
                    key={`${log.timestamp}-${index}`}
                    className="text-slate-700"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3">{log.level}</td>
                    <td className="px-4 py-3">{log.module}</td>
                    <td className="px-4 py-3">{log.location}</td>
                    <td className="max-w-[520px] break-all px-4 py-3">
                      {log.message}
                    </td>
                  </tr>
                ))}
              {!state.loading && state.logs.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
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
