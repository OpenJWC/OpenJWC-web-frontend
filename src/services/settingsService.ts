import { apiClient } from "../api/client";
import { isAxiosError } from "axios";
import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
  RefreshMottoResponse,
  RunCrawlerResponse,
  ResetSettingsPayload,
  ResetSettingsResponse,
  SettingItem,
  SettingsData,
  SettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsPayload,
  UpdateSettingsResponse,
} from "../types/settings";

function createSettingsHeaders() {
  return {
    Accept: "application/json",
    "X-Client-Version": "1.0.0",
    "X-Request-ID": crypto.randomUUID(),
    "Content-Type": "application/json",
  };
}

function parseSettingsResponse(response: SettingsResponse): SettingsData {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("系统设置返回格式不正确");
  }
  if (!Array.isArray(response.data.settings)) {
    throw new Error("系统设置返回格式不正确：缺少 settings 数组");
  }
  return response.data.settings.reduce<SettingsData>((acc, item) => {
    if (
      item &&
      typeof item === "object" &&
      typeof item.key === "string" &&
      typeof item.value === "string"
    ) {
      acc[item.key] = item.value;
    }
    return acc;
  }, {});
}

export async function getSettings(): Promise<SettingsData> {
  const response = await apiClient.get<SettingsResponse>("/api/v1/admin/settings", {
    headers: createSettingsHeaders(),
  });
  return parseSettingsResponse(response.data);
}

function parseUpdateSettingsResponse(response: UpdateSettingsResponse): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("更新系统设置返回格式不正确");
  }
  return response.msg;
}

export async function updateSettings(payload: UpdateSettingsPayload): Promise<string> {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    throw new Error("没有可更新的设置字段");
  }
  const settings: SettingItem[] = entries.map(([key, value]) => {
    if (typeof value === "string") {
      return { key, value };
    }
    if (value === null) {
      return { key, value: "null" };
    }
    if (typeof value === "object") {
      return { key, value: JSON.stringify(value) };
    }
    return { key, value: String(value) };
  });
  const requestBody: UpdateSettingsRequest = { settings };
  const response = await apiClient.put<UpdateSettingsResponse>(
    "/api/v1/admin/settings",
    requestBody,
    {
      headers: createSettingsHeaders(),
    }
  );
  return parseUpdateSettingsResponse(response.data);
}

function parseChangePasswordResponse(response: ChangePasswordResponse): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("修改密码返回格式不正确");
  }
  return response.msg;
}

export async function changeAdminPassword(payload: ChangePasswordPayload): Promise<string> {
  const oldPassword = payload.old_password.trim();
  const newPassword = payload.new_password.trim();
  if (!oldPassword || !newPassword) {
    throw new Error("旧密码和新密码不能为空");
  }
  const response = await apiClient.put<ChangePasswordResponse>(
    "/api/v1/admin/settings/password",
    {
      old_password: oldPassword,
      new_password: newPassword,
    },
    {
      headers: createSettingsHeaders(),
    }
  );
  return parseChangePasswordResponse(response.data);
}

function parseResetSettingsResponse(response: ResetSettingsResponse): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("重置设置返回格式不正确");
  }
  return response.msg;
}

export async function resetSettings(payload: ResetSettingsPayload = []): Promise<string> {
  const normalized = payload
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const response = await apiClient.put<ResetSettingsResponse>(
    "/api/v1/admin/settings/reset",
    normalized,
    {
      headers: createSettingsHeaders(),
    }
  );
  return parseResetSettingsResponse(response.data);
}

function parseRefreshMottoResponse(response: RefreshMottoResponse): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("刷新每日一言返回格式不正确");
  }
  return response.msg;
}

export async function refreshMotto(): Promise<string> {
  const response = await apiClient.put<RefreshMottoResponse>(
    "/api/v1/admin/settings/motto",
    {},
    {
      headers: createSettingsHeaders(),
    }
  );
  return parseRefreshMottoResponse(response.data);
}

function parseRunCrawlerResponse(response: RunCrawlerResponse): string {
  if (typeof response.msg !== "string" || response.msg.length === 0) {
    throw new Error("手动执行爬虫返回格式不正确");
  }
  return response.msg;
}

export async function runCrawler(): Promise<string> {
  try {
    const response = await apiClient.put<RunCrawlerResponse>(
      "/api/v1/admin/settings/crawler",
      {},
      {
        headers: createSettingsHeaders(),
      }
    );
    return parseRunCrawlerResponse(response.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      const response = await apiClient.put<RunCrawlerResponse>(
        "/api/v1/admin/settings/crawler/",
        {},
        {
          headers: createSettingsHeaders(),
        }
      );
      return parseRunCrawlerResponse(response.data);
    }
    throw error;
  }
}
