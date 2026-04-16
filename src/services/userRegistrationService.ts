import { apiClient } from "../api/client";
import type {
  GetUserRegistrationsParams,
  ReviewUserRegistrationPayload,
  ReviewUserRegistrationResponse,
  UserRegistrationDetail,
  UserRegistrationDetailResponse,
  UserRegistrationsData,
  UserRegistrationsResponse,
} from "../types/userRegistration";

function createUserRegistrationHeaders() {
  return {
    Accept: "application/json",
    "X-Client-Version": "1.0.0",
    "X-Request-ID": crypto.randomUUID(),
  };
}

function parseUserRegistrationsResponse(
  response: UserRegistrationsResponse
): UserRegistrationsData {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("注册请求列表返回格式不正确");
  }

  const { total, users } = response.data;
  if (typeof total !== "number" || !Array.isArray(users)) {
    throw new Error("注册请求列表字段类型不正确");
  }

  users.forEach((user) => {
    if (
      typeof user?.id !== "string" ||
      typeof user?.username !== "string" ||
      typeof user?.email !== "string" ||
      typeof user?.status !== "string" ||
      typeof user?.created_at !== "string"
    ) {
      throw new Error("注册请求列表用户字段类型不正确");
    }
  });

  return response.data;
}

function parseUserRegistrationDetailResponse(
  response: UserRegistrationDetailResponse
): UserRegistrationDetail {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("注册请求详情返回格式不正确");
  }

  const { id, username, email, status, created_at } = response.data;
  if (
    typeof id !== "string" ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof status !== "string" ||
    typeof created_at !== "string"
  ) {
    throw new Error("注册请求详情字段类型不正确");
  }

  return response.data;
}

function parseReviewUserRegistrationResponse(
  response: ReviewUserRegistrationResponse
): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("审核注册请求返回格式不正确");
  }

  return response.msg;
}

export async function getUserRegistrations(
  params: GetUserRegistrationsParams
): Promise<UserRegistrationsData> {
  const normalizedPage = Math.max(1, Math.floor(params.page));
  const normalizedSize = Math.max(1, Math.floor(params.size));
  const normalizedStatus = params.status?.trim() ?? "";

  const response = await apiClient.get<UserRegistrationsResponse>(
    "/api/v2/admin/user-registrations",
    {
      headers: createUserRegistrationHeaders(),
      params: {
        page: normalizedPage,
        size: normalizedSize,
        ...(normalizedStatus ? { status: normalizedStatus } : {}),
      },
    }
  );

  return parseUserRegistrationsResponse(response.data);
}

export async function getUserRegistrationDetail(
  id: string
): Promise<UserRegistrationDetail> {
  const normalizedId = id.trim();
  if (!normalizedId) {
    throw new Error("无效的注册请求 id");
  }

  const response = await apiClient.get<UserRegistrationDetailResponse>(
    `/api/v2/admin/user-registrations/${encodeURIComponent(normalizedId)}`,
    {
      headers: createUserRegistrationHeaders(),
    }
  );

  return parseUserRegistrationDetailResponse(response.data);
}

export async function reviewUserRegistration(
  id: string,
  payload: ReviewUserRegistrationPayload
): Promise<string> {
  const normalizedId = id.trim();
  const normalizedReview = payload.review.trim();

  if (!normalizedId) {
    throw new Error("无效的注册请求 id");
  }

  if (!normalizedReview) {
    throw new Error("审核理由不能为空");
  }

  const response = await apiClient.post<ReviewUserRegistrationResponse>(
    `/api/v2/admin/user-registrations/${encodeURIComponent(normalizedId)}/review`,
    {
      action: payload.action,
      review: normalizedReview,
    },
    {
      headers: createUserRegistrationHeaders(),
    }
  );

  return parseReviewUserRegistrationResponse(response.data);
}
