import axios from "axios";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const method = String(error.config?.method ?? "GET").toUpperCase();
    const requestUrl = `${error.config?.baseURL ?? ""}${
      error.config?.url ?? ""
    }`;
    if (!error.response) {
      return Promise.reject(
        new Error(
          `请求失败：${method} ${requestUrl}。可能是跨域拦截、服务不可达或后端重定向导致。请检查是否通过 /api 代理访问，并确认后端可用。`
        )
      );
    }
    if (error.response?.status === 401) {
      return Promise.reject(new Error("登录状态已过期，请重新登录"));
    }
    if (error.response?.status === 403) {
      return Promise.reject(new Error("没有访问权限"));
    }
    if (error.response?.status === 404) {
      return Promise.reject(
        new Error(`接口不存在（404）：${method} ${requestUrl}`)
      );
    }
    if (error.response?.status >= 500) {
      return Promise.reject(
        new Error(`服务异常（${error.response.status}）：请稍后重试`)
      );
    }
    if (error.response?.data?.msg) {
      return Promise.reject(new Error(error.response.data.msg as string));
    }
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message as string));
    }
    return Promise.reject(error);
  }
);
