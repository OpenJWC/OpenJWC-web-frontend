export interface Response {
  data: Data;
  msg: string;
  [property: string]: unknown;
}

export interface Data {
  cpu_percent: string;
  ram_total_mb: string;
  ram_used_mb: string;
  uptime_seconds: string;
  [property: string]: unknown;
}
