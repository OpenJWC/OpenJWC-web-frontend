export interface StatsResponse {
  data: StatsData;
  msg: string;
  [property: string]: unknown;
}

export interface StatsData {
  active_keys_count: number;
  total_api_calls: number;
  total_notices: number;
  [property: string]: unknown;
}
