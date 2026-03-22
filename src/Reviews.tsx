import { RefreshCw } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  deleteNotice,
  getNoticeLabels,
  getNotices,
} from "./services/noticeService";
import {
  getSubmissionDetail,
  getSubmissions,
  reviewSubmission,
} from "./services/submissionService";
import type { NoticeItem } from "./types/notice";
import type { SubmissionDetail, SubmissionNotice } from "./types/submission";
type ReviewsState = {
  total: number;
  notices: SubmissionNotice[];
  loading: boolean;
  error: string | null;
};
type StoredNoticesState = {
  totalReturned: number;
  totalLabel: number;
  notices: NoticeItem[];
  loading: boolean;
  error: string | null;
};
const PAGE_SIZE = 20;
function getStatusClass(status: string): string {
  if (status === "approved") {
    return "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700";
  }
  if (status === "rejected") {
    return "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700";
  }
  return "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700";
}
export default function Reviews() {
  const [state, setState] = useState<ReviewsState>({
    total: 0,
    notices: [],
    loading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const [statusInput, setStatusInput] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [reviewInput, setReviewInput] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [storedState, setStoredState] = useState<StoredNoticesState>({
    totalReturned: 0,
    totalLabel: 0,
    notices: [],
    loading: true,
    error: null,
  });
  const [storedPage, setStoredPage] = useState(1);
  const [labelInput, setLabelInput] = useState("");
  const [label, setLabel] = useState("");
  const [deletingNoticeIds, setDeletingNoticeIds] = useState<string[]>([]);
  const [labelOptions, setLabelOptions] = useState<string[]>([]);
  const [labelOptionsError, setLabelOptionsError] = useState<string | null>(
    null
  );
  const storedTotalPages = useMemo(
    () => Math.max(1, Math.ceil(storedState.totalReturned / PAGE_SIZE)),
    [storedState.totalReturned]
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.total / PAGE_SIZE)),
    [state.total]
  );
  const fetchSubmissions = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getSubmissions({ page, size: PAGE_SIZE, status });
      setState({
        total: data.total,
        notices: data.notices,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "获取待审资讯失败",
      }));
    }
  }, [page, status]);
  useEffect(() => {
    void fetchSubmissions();
  }, [fetchSubmissions]);
  const fetchStoredNotices = useCallback(async () => {
    setStoredState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getNotices({
        page: storedPage,
        size: PAGE_SIZE,
        label,
      });
      setStoredState({
        totalReturned: data.total_returned,
        totalLabel: data.total_label,
        notices: data.notices,
        loading: false,
        error: null,
      });
    } catch (error) {
      setStoredState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "获取入库资讯失败",
      }));
    }
  }, [label, storedPage]);
  useEffect(() => {
    void fetchStoredNotices();
  }, [fetchStoredNotices]);
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const labels = await getNoticeLabels();
        setLabelOptions(labels);
        setLabelOptionsError(null);
      } catch (error) {
        setLabelOptionsError(
          error instanceof Error ? error.message : "获取标签列表失败"
        );
      }
    };
    void fetchLabels();
  }, []);
  const handleFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setStatus(statusInput.trim());
  };
  const handleStoredFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStoredPage(1);
    setLabel(labelInput.trim());
  };
  const handleDeleteNotice = async (notice: NoticeItem) => {
    const confirmed = window.confirm(
      `确认删除入库资讯：${notice.title}（ID: ${notice.id}）？`
    );
    if (!confirmed) {
      return;
    }
    setDeletingNoticeIds((prev) => [...prev, notice.id]);
    try {
      const msg = await deleteNotice(notice.id);
      toast.success(msg || "删除成功");
      await fetchStoredNotices();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除入库资讯失败");
    } finally {
      setDeletingNoticeIds((prev) => prev.filter((id) => id !== notice.id));
    }
  };
  const handleViewDetail = async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const data = await getSubmissionDetail(id);
      setDetail(data);
      setReviewInput(data.review ?? "");
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "获取详情失败");
    } finally {
      setDetailLoading(false);
    }
  };
  const handleReview = async (action: "approved" | "rejected") => {
    if (!selectedId) {
      return;
    }
    const reason = reviewInput.trim();
    if (!reason) {
      toast.error("请先填写审核理由");
      return;
    }
    setReviewing(true);
    try {
      const msg = await reviewSubmission(selectedId, {
        action,
        review: reason,
      });
      toast.success(msg || "审核成功");
      await Promise.all([handleViewDetail(selectedId), fetchSubmissions()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "审核失败");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              待审资讯列表
            </h1>
            <p className="text-sm text-slate-500">共 {state.total} 条</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchSubmissions()}
            disabled={state.loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            刷新
          </button>
        </div>
        <form
          onSubmit={handleFilter}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              状态筛选
            </label>
            <input
              value={statusInput}
              onChange={(event) => setStatusInput(event.target.value)}
              placeholder="pending/rejected/approved"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">标签</th>
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">来源类型</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">详情链接</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.loading &&
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3" colSpan={8}>
                      <div className="h-4 animate-pulse rounded bg-slate-200" />
                    </td>
                  </tr>
                ))}
              {!state.loading &&
                state.notices.map((notice) => (
                  <tr key={notice.id} className="text-slate-700">
                    <td className="px-4 py-3">{notice.id}</td>
                    <td className="px-4 py-3">{notice.label}</td>
                    <td className="max-w-[320px] px-4 py-3 break-all">
                      {notice.title}
                    </td>
                    <td className="px-4 py-3">{notice.date}</td>
                    <td className="px-4 py-3">
                      {notice.is_page ? "页面" : "文件"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusClass(notice.status)}>
                        {notice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={notice.detail_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        打开
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void handleViewDetail(notice.id)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              {!state.loading && state.notices.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={8}
                  >
                    暂无匹配资讯
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedId && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">资讯详情</h2>
          <p className="mt-1 text-xs text-slate-500">当前 ID：{selectedId}</p>
          {detailLoading && (
            <p className="mt-3 text-sm text-slate-500">加载中...</p>
          )}
          {detailError && (
            <p className="mt-3 text-sm text-red-500">{detailError}</p>
          )}
          {detail && (
            <div className="mt-3 grid gap-2 text-sm">
              <div className="grid gap-2 md:grid-cols-2">
                <p>
                  <span className="text-slate-500">标题：</span>
                  {detail.title}
                </p>
                <p>
                  <span className="text-slate-500">状态：</span>
                  {detail.status}
                </p>
                <p>
                  <span className="text-slate-500">标签：</span>
                  {detail.label}
                </p>
                <p>
                  <span className="text-slate-500">日期：</span>
                  {detail.date}
                </p>
                <p>
                  <span className="text-slate-500">创建时间：</span>
                  {detail.created_at}
                </p>
                <p>
                  <span className="text-slate-500">更新时间：</span>
                  {detail.updated_at}
                </p>
              </div>
              <p className="break-all">
                <span className="text-slate-500">来源：</span>
                {detail.detail_url}
              </p>
              <p>
                <span className="text-slate-500">审核意见：</span>
                {detail.review || "-"}
              </p>
              <div>
                <p className="text-slate-500">正文：</p>
                <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-800">
                  {detail.content_text || "-"}
                </pre>
              </div>
              <div>
                <p className="text-slate-500">附件：</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {detail.attachments.length > 0 ? (
                    detail.attachments.map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">无附件</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-slate-500">审核操作</p>
                <textarea
                  value={reviewInput}
                  onChange={(event) => setReviewInput(event.target.value)}
                  rows={3}
                  placeholder="填写审核理由"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => void handleReview("rejected")}
                    disabled={reviewing}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {reviewing ? "提交中..." : "驳回"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReview("approved")}
                    disabled={reviewing}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {reviewing ? "提交中..." : "通过"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              已入库资讯列表
            </h2>
            <p className="text-sm text-slate-500">
              当前标签总数 {storedState.totalLabel}，本次匹配{" "}
              {storedState.totalReturned}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void fetchStoredNotices();
              void (async () => {
                try {
                  const labels = await getNoticeLabels();
                  setLabelOptions(labels);
                  setLabelOptionsError(null);
                } catch (error) {
                  setLabelOptionsError(
                    error instanceof Error ? error.message : "获取标签列表失败"
                  );
                }
              })();
            }}
            disabled={storedState.loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            刷新
          </button>
        </div>
        <form
          onSubmit={handleStoredFilter}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              标签筛选
            </label>
            <select
              value={labelInput}
              onChange={(event) => setLabelInput(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">全部标签</option>
              {labelOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            查询
          </button>
        </form>
        {labelOptionsError && (
          <p className="mt-2 text-xs text-red-500">{labelOptionsError}</p>
        )}

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">标签</th>
                  <th className="px-4 py-3 font-medium">标题</th>
                  <th className="px-4 py-3 font-medium">日期</th>
                  <th className="px-4 py-3 font-medium">详情链接</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storedState.loading &&
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3" colSpan={6}>
                        <div className="h-4 animate-pulse rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))}
                {!storedState.loading &&
                  storedState.notices.map((notice) => (
                    <tr key={notice.id} className="text-slate-700">
                      <td className="px-4 py-3">{notice.id}</td>
                      <td className="px-4 py-3">{notice.label}</td>
                      <td className="max-w-[360px] break-all px-4 py-3">
                        {notice.title}
                      </td>
                      <td className="px-4 py-3">{notice.date}</td>
                      <td className="px-4 py-3">
                        <a
                          href={notice.detail_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          打开
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void handleDeleteNotice(notice)}
                          disabled={deletingNoticeIds.includes(notice.id)}
                          className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingNoticeIds.includes(notice.id)
                            ? "删除中..."
                            : "删除"}
                        </button>
                      </td>
                    </tr>
                  ))}
                {!storedState.loading && storedState.notices.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-slate-500"
                      colSpan={6}
                    >
                      暂无匹配资讯
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {storedState.error && (
          <p className="mt-3 text-sm text-red-500">{storedState.error}</p>
        )}

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setStoredPage((prev) => Math.max(1, prev - 1))}
            disabled={storedPage <= 1 || storedState.loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-sm text-slate-600">
            {storedPage} / {storedTotalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setStoredPage((prev) => Math.min(storedTotalPages, prev + 1))
            }
            disabled={storedPage >= storedTotalPages || storedState.loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
