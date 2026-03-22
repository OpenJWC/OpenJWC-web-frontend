import { apiClient } from "../api/client";
import type { LoginPayload, LoginResponse } from "../types/auth";

type ApiLoginResponse = {
  msg: string;
  data?: {
    token?: string;
    expires_in?: number;
  };
};

function parseLoginResponse(response: ApiLoginResponse): LoginResponse {
  const token = response.data?.token;
  const expiresIn = response.data?.expires_in;
  if (!token || typeof expiresIn !== "number") {
    throw new Error("登录成功但返回数据不完整");
  }
  const expiresAt = Date.now() + expiresIn * 1000;
  return { token, expiresAt };
}

export async function loginAdmin(
  payload: LoginPayload
): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append("username", payload.username);
  formData.append("password", payload.password);

  const response = await apiClient.post<ApiLoginResponse>(
    "/api/v1/admin/auth/login",
    formData,
    {
      headers: {
        Accept: "application/json",
        "X-Client-Version": "1.0.0",
        "X-Request-ID": crypto.randomUUID(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return parseLoginResponse(response.data);
}
