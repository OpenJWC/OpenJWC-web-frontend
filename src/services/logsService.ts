import { apiClient } from "../api/client";
import type {
  GetLogsParams,
  LogModulesResponse,
  LogsData,
  LogsResponse,
} from "../types/logs";

function createLogsHeaders() {
  return {
    Accept: "application/json",
    "X-Client-Version": "1.0.0",
    "X-Request-ID": crypto.randomUUID(),
    "Content-Type": "application/json",
  };
}

function parseLogsResponse(response: LogsResponse): LogsData {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("日志返回格式不正确");
  }
  if (typeof response.data.total !== "number" || !Array.isArray(response.data.logs)) {
    throw new Error("日志返回字段类型不正确");
  }
  return response.data;
}

export async function getLogs(params: GetLogsParams): Promise<LogsData> {
  const normalizedPage = Math.max(1, Math.floor(params.page));
  const normalizedSize = Math.max(1, Math.floor(params.size));
  const normalizedLevel = params.level?.trim() ?? "";
  const normalizedModule = params.module?.trim() ?? "";
  const normalizedKeyword = params.keyword?.trim() ?? "";

  const response = await apiClient.get<LogsResponse>("/api/v1/admin/logs/", {
    headers: createLogsHeaders(),
    params: {
      page: normalizedPage,
      size: normalizedSize,
      ...(normalizedLevel ? { level: normalizedLevel } : {}),
      ...(normalizedModule ? { module: normalizedModule } : {}),
      ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
    },
  });
  return parseLogsResponse(response.data);
}

function parseLogModulesResponse(response: LogModulesResponse): string[] {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("日志模块返回格式不正确");
  }
  if (!Array.isArray(response.data.modules)) {
    throw new Error("日志模块字段类型不正确");
  }
  return response.data.modules.filter((item): item is string => typeof item === "string");
}

export async function getLogModules(): Promise<string[]> {
  const response = await apiClient.get<LogModulesResponse>("/api/v1/admin/logs/modules", {
    headers: createLogsHeaders(),
  });
  return parseLogModulesResponse(response.data);
}
