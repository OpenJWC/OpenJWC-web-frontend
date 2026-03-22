export interface SettingsData {
  llm_api_key?: string;
  deepseek_api_key?: string;
  zhipu_api_key?: string;
  system_prompt?: string;
  crawler_interval_minutes?: number | string;
  crawler_days_gap?: number | string;
  search_max_day_diff?: number | string;
  prompt_debug?: number | string;
  prompt_preview_length?: number | string;
  [property: string]: unknown;
}

export interface SettingItem {
  key: string;
  value: string;
}

export interface SettingsResponse {
  msg: string;
  data: {
    settings: SettingItem[];
    [property: string]: unknown;
  };
  [property: string]: unknown;
}

export type UpdateSettingsPayload = Partial<SettingsData> &
  Record<string, unknown>;

export interface UpdateSettingsResponse {
  msg: string;
  data: Record<string, never>;
  [property: string]: unknown;
}

export interface UpdateSettingsRequest {
  settings: SettingItem[];
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  msg: string;
  data: Record<string, never>;
  [property: string]: unknown;
}

export type ResetSettingsPayload = string[];

export interface ResetSettingsResponse {
  msg: string;
  data: Record<string, never>;
  [property: string]: unknown;
}
