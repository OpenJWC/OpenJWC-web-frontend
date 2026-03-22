import { apiClient } from "../api/client";
import type {
  ApiKeysData,
  ApiKeysResponse,
  CreateApiKeyData,
  CreateApiKeyPayload,
  CreateApiKeyResponse,
  DeleteApiKeyResponse,
  GetApiKeysParams,
  UpdateApiKeyStatusPayload,
  UpdateApiKeyStatusResponse,
} from "../types/apikey";

function createApiKeyHeaders() {
  return {
    Accept: "application/json",
    "X-Client-Version": "1.0.0",
    "X-Request-ID": crypto.randomUUID(),
    "Content-Type": "application/json",
  };
}

function parseApiKeysResponse(response: ApiKeysResponse): ApiKeysData {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("apikey 列表返回格式不正确");
  }
  if (
    typeof response.data.total !== "number" ||
    !Array.isArray(response.data.items)
  ) {
    throw new Error("apikey 列表字段类型不正确");
  }
  return response.data;
}

export async function getApiKeys(
  params: GetApiKeysParams
): Promise<ApiKeysData> {
  const normalizedPage = Math.max(1, params.page ?? 1);
  const normalizedSize = Math.max(1, params.size ?? 10);
  const normalizedKeyword = params.keyword?.trim() ?? "";
  const response = await apiClient.get<ApiKeysResponse>(
    "/api/v1/admin/apikeys",
    {
      headers: createApiKeyHeaders(),
      params: {
        page: String(normalizedPage),
        size: String(normalizedSize),
        ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
      },
    }
  );
  return parseApiKeysResponse(response.data);
}

function parseCreateApiKeyResponse(
  response: CreateApiKeyResponse
): CreateApiKeyData {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("创建 apikey 返回格式不正确");
  }
  if (
    typeof response.data.new_key !== "string" ||
    response.data.new_key.length === 0
  ) {
    throw new Error("创建 apikey 未返回有效 key");
  }
  return response.data;
}

export async function createApiKey(
  payload: CreateApiKeyPayload
): Promise<CreateApiKeyData> {
  const ownerName = payload.owner_name.trim();
  const maxDevices = Math.max(1, Math.floor(payload.max_devices));
  if (!ownerName) {
    throw new Error("owner_name 不能为空");
  }
  const response = await apiClient.post<CreateApiKeyResponse>(
    "/api/v1/admin/apikeys",
    {
      owner_name: ownerName,
      max_devices: maxDevices,
    },
    {
      headers: createApiKeyHeaders(),
    }
  );
  return parseCreateApiKeyResponse(response.data);
}

function parseUpdateApiKeyStatusResponse(response: UpdateApiKeyStatusResponse): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("启停 apikey 返回格式不正确");
  }
  return response.msg;
}

export async function updateApiKeyStatus(
  keyId: number,
  payload: UpdateApiKeyStatusPayload
): Promise<string> {
  const normalizedKeyId = Math.floor(keyId);
  if (!Number.isFinite(normalizedKeyId) || normalizedKeyId <= 0) {
    throw new Error("无效的 key_id");
  }
  const response = await apiClient.put<UpdateApiKeyStatusResponse>(
    `/api/v1/admin/apikeys/${normalizedKeyId}/status`,
    {
      is_active: payload.is_active,
    },
    {
      headers: createApiKeyHeaders(),
    }
  );
  return parseUpdateApiKeyStatusResponse(response.data);
}

function parseDeleteApiKeyResponse(response: DeleteApiKeyResponse): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("删除 apikey 返回格式不正确");
  }
  return response.msg;
}

export async function deleteApiKey(keyId: number): Promise<string> {
  const normalizedKeyId = Math.floor(keyId);
  if (!Number.isFinite(normalizedKeyId) || normalizedKeyId <= 0) {
    throw new Error("无效的 key_id");
  }
  const response = await apiClient.delete<DeleteApiKeyResponse>(
    `/api/v1/admin/apikeys/${normalizedKeyId}`,
    {
      headers: createApiKeyHeaders(),
    }
  );
  return parseDeleteApiKeyResponse(response.data);
}
