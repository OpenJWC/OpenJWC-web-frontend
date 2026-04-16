import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import logoIcon from "./assets/icon_test.png";
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
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-ink-200/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="rounded-3xl border border-ink-200/60 bg-white p-8 shadow-nav">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <img
              src={logoIcon}
              alt="OPENJWC"
              className="h-14 w-14 rounded-2xl object-cover shadow-md"
            />
            <div>
              <h1 className="font-display text-3xl text-ink-900">管理员登录</h1>
              <p className="mt-1 text-sm text-ink-500">
                登录后可访问控制面板功能
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-ink-700"
                htmlFor="username"
              >
                用户名
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                placeholder="输入用户名"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-ink-700"
                htmlFor="password"
              >
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 pr-12 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  placeholder="输入密码"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-ink-400 transition-colors hover:text-ink-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-ink-900 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-ink-800 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-md"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-ink-400">
          OpenJWC 教务管理系统
        </p>
      </div>
    </div>
  );
}
