"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminDashboardData = {
  summary: {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
    totalCourses: number;
    totalClasses: number;
    totalAssignments: number;
    totalExams: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    averageRiskScore: number;
  };
  system: {
    status: string;
    database: string;
    aiEngine: string;
  };
};

const themeVars = (theme: "dark" | "light") => ({
  "--am-bg": theme === "dark" ? "#0B0B0A" : "#F5F2EA",
  "--am-sidebar": theme === "dark" ? "#11110F" : "#FBF9F3",
  "--am-surface": theme === "dark" ? "#141411" : "#FFFFFF",
  "--am-surface-2": theme === "dark" ? "#171713" : "#F1EEE6",
  "--am-border": theme === "dark" ? "#34342C" : "#D9D2C5",
  "--am-border-soft": theme === "dark" ? "#26261F" : "#E7E1D6",
  "--am-text": theme === "dark" ? "#F4F1E8" : "#1E1D19",
  "--am-muted": theme === "dark" ? "#B7B4A8" : "#5F5A50",
  "--am-muted-2": theme === "dark" ? "#817E74" : "#7A7469",
  "--am-primary": theme === "dark" ? "#B9914F" : "#9A6C27",
  "--am-primary-light": theme === "dark" ? "#D8B36A" : "#A8752F",
  "--am-success": theme === "dark" ? "#8FB09A" : "#447357",
  "--am-danger": theme === "dark" ? "#D98C83" : "#A64E45",
  "--am-warning": theme === "dark" ? "#D8B36A" : "#9A6C27",
  "--am-hero-bg":
    theme === "dark"
      ? "linear-gradient(135deg,#161612 0%,#0F100E 58%,#2A2418 100%)"
      : "linear-gradient(135deg,#FFFDFC 0%,#F7F2E8 58%,#F1E5CC 100%)",
});

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("edumind-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("edumind-theme", theme);
  }, [theme]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin/dashboard", {
          credentials: "include",
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          router.replace("/");
          return;
        }
        setData(result);
      } catch (error) {
        console.error("Admin dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  const vars = themeVars(theme);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--am-bg)] text-[var(--am-text)]" style={vars as React.CSSProperties}>
        <div className="rounded-3xl border border-[var(--am-border)] bg-[var(--am-surface)] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--am-primary)]/10 text-2xl text-[var(--am-primary-light)]">✦</div>
          <h1 className="mt-5 text-xl font-semibold">Loading EduMind</h1>
          <p className="mt-2 text-sm text-[var(--am-muted)]">Preparing administration intelligence...</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--am-bg)] px-6 text-[var(--am-text)]" style={vars as React.CSSProperties}>
        <div className="rounded-3xl border border-[var(--am-border)] bg-[var(--am-surface)] p-8 text-center">
          <p className="text-lg font-semibold">Unable to load admin dashboard</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-[var(--am-primary)] px-5 py-2.5 text-sm font-semibold text-white">
            Try again
          </button>
        </div>
      </main>
    );
  }

  const { summary, system } = data;

  return (
    <main className="min-h-screen bg-[var(--am-bg)] text-[var(--am-text)] transition-colors duration-300" style={vars as React.CSSProperties}>
      <div className="mx-auto flex max-w-[1450px] justify-end gap-3 px-5 pt-5 sm:px-8 xl:px-10">
        <button
          type="button"
          onClick={() => router.push("/admin/management")}
          className="rounded-xl border border-[var(--am-border)] bg-[var(--am-surface)] px-4 py-2 text-sm font-semibold text-[var(--am-text)] transition hover:border-[var(--am-primary)]"
        >
          Management
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/reports")}
          className="rounded-xl border border-[var(--am-border)] bg-[var(--am-surface)] px-4 py-2 text-sm font-semibold text-[var(--am-text)] transition hover:border-[var(--am-primary)]"
        >
          Reports
        </button>
      </div>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-[var(--am-border-soft)] bg-[var(--am-sidebar)] xl:flex xl:flex-col">
          <button onClick={() => router.push("/")} className="flex h-20 w-full items-center gap-3 border-b border-[var(--am-border-soft)] px-6 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--am-primary-light)] to-[var(--am-primary)] font-bold text-[var(--am-bg)]">E</div>
            <div>
              <p className="font-semibold">EduMind</p>
              <p className="text-xs text-[var(--am-muted-2)]">Admin workspace</p>
            </div>
          </button>

          <nav className="flex-1 space-y-1 px-3 py-6">
            {["Overview", "Users", "Academic", "AI Intelligence"].map((item, index) => (
              <button key={item} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${index === 0 ? "bg-[var(--am-primary)]/15 text-[var(--am-primary-light)]" : "text-[var(--am-muted)] hover:bg-[var(--am-surface-2)] hover:text-[var(--am-text)]"}`}>
                <span className="w-5 text-center">{["⌂", "◉", "▣", "✦"][index]}</span>
                {item}
              </button>
            ))}
          </nav>

          <div className="border-t border-[var(--am-border-soft)] p-4">
            <div className="rounded-2xl border border-[var(--am-border-soft)] bg-[var(--am-surface)] p-4">
              <p className="text-xs text-[var(--am-muted-2)]">Platform</p>
              <p className="mt-1 font-semibold">System Admin</p>
              <button onClick={() => router.push("/")} className="mt-4 w-full rounded-xl border border-[var(--am-border)] bg-[var(--am-surface-2)] px-3 py-2 text-xs font-medium text-[var(--am-muted)] hover:text-[var(--am-text)]">
                ← Back to main menu
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[var(--am-border-soft)] bg-[var(--am-bg)]/90 backdrop-blur-2xl">
            <div className="flex h-20 items-center justify-between px-5 sm:px-8 xl:px-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--am-border)] bg-[var(--am-surface)] xl:hidden">☰</button>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--am-primary-light)]">Admin Dashboard</p>
                  <h1 className="mt-1 text-lg font-semibold">Platform overview</h1>
                </div>
              </div>

              <button
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                className="flex h-10 items-center gap-2 rounded-xl border border-[var(--am-border)] bg-[var(--am-surface)] px-3 text-xs font-medium text-[var(--am-muted)]"
              >
                {theme === "dark" ? "☀ Light" : "☾ Dark"}
              </button>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 xl:hidden">
              <button onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Close menu" />
              <aside className="relative h-full w-[82%] max-w-sm border-r border-[var(--am-border)] bg-[var(--am-sidebar)] p-5">
                <div className="flex items-center justify-between border-b border-[var(--am-border-soft)] pb-5">
                  <button onClick={() => router.push("/")} className="flex items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--am-primary-light)] to-[var(--am-primary)] font-bold text-[var(--am-bg)]">E</div>
                    <div>
                      <p className="font-semibold">EduMind</p>
                      <p className="text-xs text-[var(--am-muted-2)]">Main menu</p>
                    </div>
                  </button>
                  <button onClick={() => setMobileMenuOpen(false)} className="h-10 w-10 rounded-xl border border-[var(--am-border)]">×</button>
                </div>
                <nav className="mt-6 space-y-1">
                  {["Overview", "Users", "Academic", "AI Intelligence"].map((item) => (
                    <button key={item} onClick={() => setMobileMenuOpen(false)} className="flex w-full rounded-xl px-4 py-3 text-left text-sm text-[var(--am-muted)] hover:bg-[var(--am-surface-2)]">
                      {item}
                    </button>
                  ))}
                </nav>
              </aside>
            </div>
          )}

          <div className="mx-auto max-w-[1450px] px-5 py-8 sm:px-8 xl:px-10">
            <section className="relative overflow-hidden rounded-[28px] border border-[var(--am-border)] p-6 shadow-lg shadow-black/5 sm:p-8" style={{ background: "var(--am-hero-bg)" }}>
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[var(--am-primary)]/10 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-[var(--am-border)] bg-[var(--am-surface)]/60 px-3 py-1 text-xs font-semibold text-[var(--am-primary-light)]">ADMIN</span>
                    <span className="rounded-full border border-[var(--am-border)] bg-[var(--am-surface)]/60 px-3 py-1 text-xs text-[var(--am-muted)]">EduMind Platform</span>
                  </div>
                  <p className="mt-5 text-sm text-[var(--am-muted)]">Administration intelligence</p>
                  <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Platform overview</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--am-muted)]">Monitor users, academic infrastructure, system health and AI risk across EduMind.</p>
                </div>
                <div className="rounded-2xl border border-[var(--am-border)] bg-[var(--am-surface)]/65 px-5 py-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-wider text-[var(--am-muted-2)]">System status</p>
                  <p className="mt-2 font-semibold text-[var(--am-success)]">● {system.status}</p>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Users", summary.totalUsers, "text-[var(--am-primary-light)]"],
                ["Students", summary.totalStudents, "text-[var(--am-success)]"],
                ["Teachers", summary.totalTeachers, "text-[var(--am-primary-light)]"],
                ["Courses", summary.totalCourses, "text-[var(--am-warning)]"],
              ].map(([label, value, tone]) => (
                <div key={String(label)} className="rounded-2xl border border-[var(--am-border)] bg-[var(--am-surface)] p-5 shadow-lg shadow-black/5 transition hover:-translate-y-0.5">
                  <p className="text-sm text-[var(--am-muted)]">{label}</p>
                  <p className={`mt-4 text-3xl font-bold ${tone}`}>{value}</p>
                </div>
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[28px] border border-[var(--am-border)] bg-[var(--am-surface)] p-6 shadow-lg shadow-black/5">
                <p className="text-xs uppercase tracking-wider text-[var(--am-muted-2)]">Academic infrastructure</p>
                <h3 className="mt-1 text-xl font-semibold">Platform scale</h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    ["Classes", summary.totalClasses],
                    ["Assignments", summary.totalAssignments],
                    ["Exams", summary.totalExams],
                    ["Admins", summary.totalAdmins],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-2xl border border-[var(--am-border-soft)] bg-[var(--am-surface-2)] p-5">
                      <p className="text-sm text-[var(--am-muted)]">{label}</p>
                      <p className="mt-2 text-2xl font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--am-border)] bg-[var(--am-surface)] p-6 shadow-lg shadow-black/5">
                <p className="text-xs uppercase tracking-wider text-[var(--am-muted-2)]">AI intelligence</p>
                <h3 className="mt-1 text-xl font-semibold">Risk distribution</h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    ["High Risk", summary.highRisk, "text-[var(--am-danger)]", "bg-[var(--am-danger)]/10"],
                    ["Medium Risk", summary.mediumRisk, "text-[var(--am-warning)]", "bg-[var(--am-warning)]/10"],
                    ["Low Risk", summary.lowRisk, "text-[var(--am-success)]", "bg-[var(--am-success)]/10"],
                    ["Avg Risk", summary.averageRiskScore, "text-[var(--am-primary-light)]", "bg-[var(--am-primary)]/10"],
                  ].map(([label, value, tone, surface]) => (
                    <div key={String(label)} className={`rounded-2xl border border-[var(--am-border)] p-5 ${surface}`}>
                      <p className={`text-sm ${tone}`}>{label}</p>
                      <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-[28px] border border-[var(--am-border)] bg-[var(--am-surface)] p-6 shadow-lg shadow-black/5">
              <p className="text-xs uppercase tracking-wider text-[var(--am-muted-2)]">System health</p>
              <h3 className="mt-1 text-xl font-semibold">Services</h3>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ["Platform", system.status, "text-[var(--am-success)]"],
                  ["Database", system.database, "text-[var(--am-success)]"],
                  ["AI Engine", system.aiEngine, "text-[var(--am-primary-light)]"],
                ].map(([label, value, tone]) => (
                  <div key={String(label)} className="rounded-2xl border border-[var(--am-border-soft)] bg-[var(--am-surface-2)] p-5">
                    <p className="text-sm text-[var(--am-muted)]">{label}</p>
                    <p className={`mt-2 font-semibold ${tone}`}>● {value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}