export interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  location: string;
  message: string;
  [property: string]: unknown;
}

export interface LogsData {
  total: number;
  logs: LogEntry[];
}

export interface LogsResponse {
  msg: string;
  data: LogsData;
  [property: string]: unknown;
}

export interface GetLogsParams {
  page: number;
  size: number;
  level?: string;
  module?: string;
  keyword?: string;
}

export interface LogModulesData {
  modules: string[];
}

export interface LogModulesResponse {
  msg: string;
  data: LogModulesData;
  [property: string]: unknown;
}
