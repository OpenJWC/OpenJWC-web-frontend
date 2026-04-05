import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-ink-200/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-scale-in">
        <div className="rounded-3xl border border-ink-200/60 bg-white p-10 text-center shadow-nav">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-ink-900 text-3xl font-bold text-white shadow-md">
            403
          </div>
          <h1 className="mt-6 font-display text-3xl text-ink-900">
            访问受限
          </h1>
          <p className="mt-3 text-ink-500">
            您没有权限访问当前页面
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-ink-800 hover:shadow-lg active:scale-[0.98]"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
