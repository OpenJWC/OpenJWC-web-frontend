import { apiClient } from "../api/client";
import type {
  DeleteNoticeResponse,
  GetNoticesParams,
  NoticeLabelsResponse,
  NoticesData,
  NoticesResponse,
} from "../types/notice";

function createNoticeHeaders() {
  return {
    Accept: "application/json",
    "X-Client-Version": "1.0.0",
    "X-Request-ID": crypto.randomUUID(),
    "Content-Type": "application/json",
  };
}

function parseNoticesResponse(response: NoticesResponse): NoticesData {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("入库资讯返回格式不正确");
  }
  if (
    !Array.isArray(response.data.notices) ||
    typeof response.data.total_returned !== "number" ||
    typeof response.data.total_label !== "number"
  ) {
    throw new Error("入库资讯字段类型不正确");
  }
  return response.data;
}

export async function getNotices(params: GetNoticesParams): Promise<NoticesData> {
  const normalizedPage = Math.max(1, Math.floor(params.page));
  const normalizedSize = Math.max(1, Math.floor(params.size));
  const normalizedLabel = params.label?.trim() ?? "";
  const response = await apiClient.get<NoticesResponse>("/api/v1/admin/notices", {
    headers: createNoticeHeaders(),
    params: {
      page: normalizedPage,
      size: normalizedSize,
      ...(normalizedLabel ? { label: normalizedLabel } : {}),
    },
  });
  return parseNoticesResponse(response.data);
}

function parseDeleteNoticeResponse(response: DeleteNoticeResponse): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("删除入库资讯返回格式不正确");
  }
  return response.msg;
}

export async function deleteNotice(noticeId: string): Promise<string> {
  const normalizedId = noticeId.trim();
  if (!normalizedId) {
    throw new Error("无效的资讯 id");
  }
  const response = await apiClient.delete<DeleteNoticeResponse>(
    `/api/v1/admin/notices/${encodeURIComponent(normalizedId)}`,
    {
      headers: createNoticeHeaders(),
    }
  );
  return parseDeleteNoticeResponse(response.data);
}

function parseNoticeLabelsResponse(response: NoticeLabelsResponse): string[] {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("入库资讯标签返回格式不正确");
  }
  if (!Array.isArray(response.data.labels)) {
    throw new Error("入库资讯标签字段类型不正确");
  }
  return response.data.labels.filter((item): item is string => typeof item === "string");
}

export async function getNoticeLabels(): Promise<string[]> {
  const response = await apiClient.get<NoticeLabelsResponse>("/api/v1/admin/notices/labels", {
    headers: createNoticeHeaders(),
  });
  return parseNoticeLabelsResponse(response.data);
}
