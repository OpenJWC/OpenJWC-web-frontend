export interface AdminUserItem {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  [property: string]: unknown;
}

export interface AdminUsersData {
  total: number;
  users: AdminUserItem[];
}

export interface AdminUsersResponse {
  msg: string;
  data: AdminUsersData;
  [property: string]: unknown;
}

export interface GetAdminUsersParams {
  page: number;
  size: number;
  is_active?: string;
}

export interface UpdateAdminUserStatusPayload {
  is_active: boolean;
}

export interface UpdateAdminUserStatusResponse {
  msg: string;
  data: Record<string, never>;
  [property: string]: unknown;
}

export interface DeleteAdminUserResponse {
  msg: string;
  data: Record<string, never>;
  [property: string]: unknown;
}
