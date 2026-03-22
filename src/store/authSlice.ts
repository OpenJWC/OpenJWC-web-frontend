import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { loginAdmin } from "../services/authService";
import type { AuthState, LoginPayload, LoginResponse } from "../types/auth";

const initialState: AuthState = {
  jwt: null,
  expiresAt: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

type ApiErrorResponse = {
  msg?: string;
  message?: string;
};

function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.msg ??
      error.response?.data?.message ??
      error.message
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "登录失败，请稍后重试";
}

export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, thunkApi) => {
  try {
    return await loginAdmin(payload);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.jwt = null;
      state.expiresAt = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.jwt = action.payload.token;
        state.expiresAt = action.payload.expiresAt;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "登录失败，请稍后重试";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
