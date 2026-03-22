import { apiClient } from "../api/client";
import type {
  GetSubmissionsParams,
  ReviewSubmissionPayload,
  ReviewSubmissionResponse,
  SubmissionDetail,
  SubmissionDetailResponse,
  SubmissionsData,
  SubmissionsResponse,
} from "../types/submission";

function createSubmissionHeaders() {
  return {
    Accept: "application/json",
    "X-Client-Version": "1.0.0",
    "X-Request-ID": crypto.randomUUID(),
    "Content-Type": "application/json",
  };
}

function parseSubmissionsResponse(response: SubmissionsResponse): SubmissionsData {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("待审资讯返回格式不正确");
  }
  if (typeof response.data.total !== "number" || !Array.isArray(response.data.notices)) {
    throw new Error("待审资讯字段类型不正确");
  }
  return response.data;
}

export async function getSubmissions(params: GetSubmissionsParams): Promise<SubmissionsData> {
  const normalizedPage = Math.max(1, Math.floor(params.page));
  const normalizedSize = Math.max(1, Math.floor(params.size));
  const normalizedStatus = params.status?.trim() ?? "";

  const response = await apiClient.get<SubmissionsResponse>("/api/v1/admin/submissions", {
    headers: createSubmissionHeaders(),
    params: {
      page: normalizedPage,
      size: normalizedSize,
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
    },
  });
  return parseSubmissionsResponse(response.data);
}

function parseSubmissionDetailResponse(response: SubmissionDetailResponse): SubmissionDetail {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("资讯详情返回格式不正确");
  }
  if (
    typeof response.data.id !== "string" ||
    typeof response.data.title !== "string" ||
    typeof response.data.status !== "string" ||
    !Array.isArray(response.data.attachments)
  ) {
    throw new Error("资讯详情字段类型不正确");
  }
  return response.data;
}

export async function getSubmissionDetail(id: string): Promise<SubmissionDetail> {
  const normalizedId = id.trim();
  if (!normalizedId) {
    throw new Error("无效的资讯 id");
  }
  const response = await apiClient.get<SubmissionDetailResponse>(
    `/api/v1/admin/submissions/${encodeURIComponent(normalizedId)}`,
    {
      headers: createSubmissionHeaders(),
    }
  );
  return parseSubmissionDetailResponse(response.data);
}

function parseReviewSubmissionResponse(response: ReviewSubmissionResponse): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("审核返回格式不正确");
  }
  return response.msg;
}

export async function reviewSubmission(id: string, payload: ReviewSubmissionPayload): Promise<string> {
  const normalizedId = id.trim();
  const normalizedReview = payload.review.trim();
  if (!normalizedId) {
    throw new Error("无效的资讯 id");
  }
  if (!normalizedReview) {
    throw new Error("审核理由不能为空");
  }
  const response = await apiClient.post<ReviewSubmissionResponse>(
    `/api/v1/admin/submissions/${encodeURIComponent(normalizedId)}/review`,
    {
      action: payload.action,
      review: normalizedReview,
    },
    {
      headers: createSubmissionHeaders(),
    }
  );
  return parseReviewSubmissionResponse(response.data);
}
