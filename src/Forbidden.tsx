import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-4xl font-bold text-slate-900">403</h1>
        <p className="mt-3 text-slate-600">您没有权限访问当前页面</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
