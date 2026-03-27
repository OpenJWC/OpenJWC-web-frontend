import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { clearAuthError, login } from "./store/authSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";

const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(6, "密码至少 6 位"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LocationState = {
  from?: {
    pathname: string;
  };
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [dispatch, error]);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    const resultAction = await dispatch(login(values));
    if (login.fulfilled.match(resultAction)) {
      toast.success("登录成功");
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
            OW
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              管理员登录
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              登录后可访问控制面板功能
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="username"
            >
              用户名
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              密码
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 inline-flex items-center text-slate-500 transition hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
