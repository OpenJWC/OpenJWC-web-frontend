import { apiClient } from "../api/client";
import type { Data, Response } from "../types/monitor";
import type { StatsData, StatsResponse } from "../types/stats";

function toDebugString(value: unknown): string {
  try {
    const text = JSON.stringify(value);
    return text.length > 2000 ? `${text.slice(0, 2000)}...(truncated)` : text;
  } catch {
    return String(value);
  }
}

function createMonitorHeaders() {
  return {
    Accept: "application/json",
    "X-Client-Version": "1.0.0",
    "X-Request-ID": crypto.randomUUID(),
    "Content-Type": "application/json",
  };
}

function parseSysInfoResponse(response: Response): Data {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("系统信息返回格式不正确");
  }
  return response.data;
}

export async function getSysInfo(): Promise<Data> {
  const response = await apiClient.get<Response>("/api/v1/admin/monitor/sysinfo", {
    headers: createMonitorHeaders(),
  });
  return parseSysInfoResponse(response.data);
}

function parseStatsResponse(response: StatsResponse): StatsData {
  if (!response.data || typeof response.data !== "object") {
    throw new Error("业务信息返回格式不正确");
  }
  const activeKeysCount =
    typeof response.data.active_keys_count === "number"
      ? response.data.active_keys_count
      : typeof response.data.activate_keys_count === "number"
        ? response.data.activate_keys_count
        : undefined;
  const { total_api_calls, total_notices } = response.data;
  if (
    typeof activeKeysCount !== "number" ||
    typeof total_api_calls !== "number" ||
    typeof total_notices !== "number"
  ) {
    throw new Error(
      `业务信息字段类型不正确：active_keys_count=${typeof activeKeysCount}，total_api_calls=${typeof total_api_calls}，total_notices=${typeof total_notices}。原始返回=${toDebugString(
        response.data
      )}`
    );
  }
  return {
    ...response.data,
    active_keys_count: activeKeysCount,
  };
}

export async function getStats(): Promise<StatsData> {
  const response = await apiClient.get<StatsResponse>("/api/v1/admin/monitor/stats", {
    headers: createMonitorHeaders(),
  });
  return parseStatsResponse(response.data);
}
