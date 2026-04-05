import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Subtle grain texture overlay */}
      <div className="grain-overlay" aria-hidden="true" />
      <NavBar />
      <main className="mx-auto w-full max-w-6xl px-6 py-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
