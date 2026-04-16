import { apiClient } from "../api/client";
import type {
  AdminUsersData,
  AdminUsersResponse,
  DeleteAdminUserResponse,
  GetAdminUsersParams,
  UpdateAdminUserStatusPayload,
  UpdateAdminUserStatusResponse,
} from "../types/adminUser";

function createAdminUserHeaders() {
  return {
    Accept: "application/json",
    "X-Client-Version": "1.0.0",
    "X-Request-ID": crypto.randomUUID(),
    "Content-Type": "application/json",
  };
}

function parseUpdateAdminUserStatusResponse(
  response: UpdateAdminUserStatusResponse
): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("修改账号状态返回格式不正确");
  }

  return response.msg;
}

function parseDeleteAdminUserResponse(response: DeleteAdminUserResponse): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("删除账号返回格式不正确");
  }

  return response.msg;
}

function parseAdminUsersResponse(response: AdminUsersResponse): AdminUsersData {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("用户列表返回格式不正确");
  }

  const { total, users } = response.data;
  if (typeof total !== "number" || !Array.isArray(users)) {
    throw new Error("用户列表字段类型不正确");
  }

  users.forEach((user) => {
    if (
      typeof user?.id !== "string" ||
      typeof user?.username !== "string" ||
      typeof user?.email !== "string" ||
      typeof user?.is_active !== "boolean" ||
      typeof user?.created_at !== "string"
    ) {
      throw new Error("用户列表用户字段类型不正确");
    }
  });

  return response.data;
}

export async function getAdminUsers(
  params: GetAdminUsersParams
): Promise<AdminUsersData> {
  const normalizedPage = Math.max(1, Math.floor(params.page));
  const normalizedSize = Math.max(1, Math.floor(params.size));
  const normalizedIsActive = params.is_active?.trim() ?? "";

  const response = await apiClient.get<AdminUsersResponse>("/api/v2/admin/users", {
    headers: createAdminUserHeaders(),
    params: {
      page: normalizedPage,
      size: normalizedSize,
      ...(normalizedIsActive ? { is_active: normalizedIsActive } : {}),
    },
  });

  return parseAdminUsersResponse(response.data);
}

export async function updateAdminUserStatus(
  id: string,
  payload: UpdateAdminUserStatusPayload
): Promise<string> {
  const normalizedId = id.trim();

  if (!normalizedId) {
    throw new Error("无效的用户 id");
  }

  if (typeof payload.is_active !== "boolean") {
    throw new Error("账号可用状态参数不正确");
  }

  const response = await apiClient.post<UpdateAdminUserStatusResponse>(
    `/api/v2/admin/users/${encodeURIComponent(normalizedId)}/status`,
    {
      is_active: payload.is_active,
    },
    {
      headers: createAdminUserHeaders(),
    }
  );

  return parseUpdateAdminUserStatusResponse(response.data);
}

export async function deleteAdminUser(id: string): Promise<string> {
  const normalizedId = id.trim();

  if (!normalizedId) {
    throw new Error("无效的用户 id");
  }

  const response = await apiClient.delete<DeleteAdminUserResponse>(
    `/api/v2/admin/users/${encodeURIComponent(normalizedId)}/status`,
    {
      headers: createAdminUserHeaders(),
    }
  );

  return parseDeleteAdminUserResponse(response.data);
}
