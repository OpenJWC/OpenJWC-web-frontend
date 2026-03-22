export interface ApiKeyItem {
  id: number;
  key_string: string;
  owner_name: string;
  is_active: boolean;
  max_devices: number;
  bound_devices: string[];
  total_requests: number;
  created_at: string;
  [property: string]: unknown;
}

export interface ApiKeysData {
  total: number;
  items: ApiKeyItem[];
}

export interface ApiKeysResponse {
  msg: string;
  data: ApiKeysData;
  [property: string]: unknown;
}

export interface GetApiKeysParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export interface CreateApiKeyPayload {
  owner_name: string;
  max_devices: number;
}

export interface CreateApiKeyData {
  new_key: string;
}

export interface CreateApiKeyResponse {
  msg: string;
  data: CreateApiKeyData;
  [property: string]: unknown;
}

export interface UpdateApiKeyStatusPayload {
  is_active: boolean;
}

export interface UpdateApiKeyStatusResponse {
  msg: string;
  data: Record<string, never>;
  [property: string]: unknown;
}

export interface DeleteApiKeyResponse {
  msg: string;
  data: Record<string, never>;
  [property: string]: unknown;
}
