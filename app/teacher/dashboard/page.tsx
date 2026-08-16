"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  attendance: number;
  averageScore: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
};

type DashboardData = {
  teacher: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    employeeId: string | null;
    department: string | null;
  };
  summary: {
    totalStudents: number;
    totalCourses: number;
    totalAssignments: number;
    totalExams: number;
    averageAttendance: number;
    averagePerformance: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
  courses: {
    id: string;
    code: string;
    name: string;
    credits: number | null;
    department: string | null;
    semester: number | null;
    studentCount: number;
    assignmentCount: number;
    examCount: number;
  }[];
  students: Student[];
};

const themeVars = (theme: "dark" | "light") => ({
  "--tm-bg": theme === "dark" ? "#0B0B0A" : "#F5F2EA",
  "--tm-sidebar": theme === "dark" ? "#11110F" : "#FBF9F3",
  "--tm-surface": theme === "dark" ? "#141411" : "#FFFFFF",
  "--tm-surface-2": theme === "dark" ? "#171713" : "#F1EEE6",
  "--tm-border": theme === "dark" ? "#34342C" : "#D9D2C5",
  "--tm-border-soft": theme === "dark" ? "#26261F" : "#E7E1D6",
  "--tm-border-strong": theme === "dark" ? "#404036" : "#C9C0B1",
  "--tm-text": theme === "dark" ? "#F4F1E8" : "#1E1D19",
  "--tm-muted": theme === "dark" ? "#B7B4A8" : "#5F5A50",
  "--tm-muted-2": theme === "dark" ? "#817E74" : "#7A7469",
  "--tm-primary": theme === "dark" ? "#B9914F" : "#9A6C27",
  "--tm-primary-light": theme === "dark" ? "#D8B36A" : "#A8752F",
  "--tm-success": theme === "dark" ? "#8FB09A" : "#447357",
  "--tm-danger": theme === "dark" ? "#D98C83" : "#A64E45",
  "--tm-warning": theme === "dark" ? "#D8B36A" : "#9A6C27",
  "--tm-hero-bg":
    theme === "dark"
      ? "linear-gradient(135deg,#161612 0%,#0F100E 58%,#2A2418 100%)"
      : "linear-gradient(135deg,#FFFDFC 0%,#F7F2E8 58%,#F1E5CC 100%)",
});

export default function TeacherDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
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
        const response = await fetch("/api/teacher/dashboard", {
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
        console.error("Teacher dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  const vars = themeVars(theme);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--tm-bg)] text-[var(--tm-text)]" style={vars as React.CSSProperties}>
        <div className="rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tm-primary)]/10 text-2xl text-[var(--tm-primary-light)]">✦</div>
          <h1 className="mt-5 text-xl font-semibold">Loading EduMind</h1>
          <p className="mt-2 text-sm text-[var(--tm-muted)]">Preparing teacher intelligence...</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--tm-bg)] px-6 text-[var(--tm-text)]" style={vars as React.CSSProperties}>
        <div className="rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-8 text-center">
          <p className="text-lg font-semibold">Unable to load teacher dashboard</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-[var(--tm-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Try again
          </button>
        </div>
      </main>
    );
  }

  const { summary, teacher, courses, students } = data;
  const initials = teacher.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-[var(--tm-bg)] text-[var(--tm-text)] transition-colors duration-300" style={vars as React.CSSProperties}>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-[var(--tm-border-soft)] bg-[var(--tm-sidebar)] xl:flex xl:flex-col">
          <button
            onClick={() => router.push("/")}
            className="flex h-20 w-full items-center gap-3 border-b border-[var(--tm-border-soft)] px-6 text-left transition hover:bg-[var(--tm-surface)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--tm-primary-light)] to-[var(--tm-primary)] font-bold text-[var(--tm-bg)]">E</div>
            <div>
              <p className="font-semibold">EduMind</p>
              <p className="text-xs text-[var(--tm-muted-2)]">Teacher workspace</p>
            </div>
          </button>

          <nav className="flex-1 space-y-1 px-3 py-6">
            {["Overview", "Students", "Courses", "Risk Monitor"].map((item, index) => (
              <button
                key={item}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                  index === 0
                    ? "bg-[var(--tm-primary)]/15 text-[var(--tm-primary-light)]"
                    : "text-[var(--tm-muted)] hover:bg-[var(--tm-surface-2)] hover:text-[var(--tm-text)]"
                }`}
              >
                <span className="w-5 text-center">{["⌂", "◉", "▣", "✦"][index]}</span>
                {item}
              </button>
            ))}
          </nav>

          <div className="border-t border-[var(--tm-border-soft)] p-4">
            <div className="rounded-2xl border border-[var(--tm-border-soft)] bg-[var(--tm-surface)] p-4">
              <p className="text-xs text-[var(--tm-muted-2)]">Employee</p>
              <p className="mt-1 font-semibold">{teacher.employeeId ?? "-"}</p>
              <p className="mt-1 text-xs text-[var(--tm-muted-2)]">{teacher.department ?? "CSE"}</p>
              <button onClick={() => router.push("/")} className="mt-4 w-full rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface-2)] px-3 py-2 text-xs font-medium text-[var(--tm-muted)] hover:text-[var(--tm-text)]">
                ← Back to main menu
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[var(--tm-border-soft)] bg-[var(--tm-bg)]/90 backdrop-blur-2xl">
            <div className="flex h-20 items-center justify-between px-5 sm:px-8 xl:px-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] xl:hidden" aria-label="Open navigation">
                  ☰
                </button>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--tm-primary-light)]">Teacher Dashboard</p>
                  <h1 className="mt-1 text-lg font-semibold">Academic monitoring</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  className="flex h-10 items-center gap-2 rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 text-xs font-medium text-[var(--tm-muted)]"
                >
                  {theme === "dark" ? "☀ Light" : "☾ Dark"}
                </button>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">{teacher.name}</p>
                  <p className="text-xs text-[var(--tm-muted-2)]">{teacher.email}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--tm-border)] bg-[var(--tm-surface-2)] text-sm font-semibold">{initials}</div>
              </div>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 xl:hidden">
              <button onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Close menu" />
              <aside className="relative h-full w-[82%] max-w-sm border-r border-[var(--tm-border)] bg-[var(--tm-sidebar)] p-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--tm-border-soft)] pb-5">
                  <button onClick={() => router.push("/")} className="flex items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--tm-primary-light)] to-[var(--tm-primary)] font-bold text-[var(--tm-bg)]">E</div>
                    <div>
                      <p className="font-semibold">EduMind</p>
                      <p className="text-xs text-[var(--tm-muted-2)]">Main menu</p>
                    </div>
                  </button>
                  <button onClick={() => setMobileMenuOpen(false)} className="h-10 w-10 rounded-xl border border-[var(--tm-border)]" aria-label="Close menu">×</button>
                </div>
                <nav className="mt-6 space-y-1">
                  {["Overview", "Students", "Courses", "Risk Monitor"].map((item) => (
                    <button key={item} onClick={() => setMobileMenuOpen(false)} className="flex w-full rounded-xl px-4 py-3 text-left text-sm text-[var(--tm-muted)] hover:bg-[var(--tm-surface-2)] hover:text-[var(--tm-text)]">
                      {item}
                    </button>
                  ))}
                </nav>
              </aside>
            </div>
          )}

          <div className="mx-auto max-w-[1450px] px-5 py-8 sm:px-8 xl:px-10">
            <section className="relative overflow-hidden rounded-[28px] border border-[var(--tm-border)] p-6 shadow-lg shadow-black/5 sm:p-8" style={{ background: "var(--tm-hero-bg)" }}>
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[var(--tm-primary)]/10 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-[var(--tm-border)] bg-[var(--tm-surface)]/60 px-3 py-1 text-xs font-semibold text-[var(--tm-primary-light)]">{teacher.department ?? "CSE"}</span>
                    <span className="rounded-full border border-[var(--tm-border)] bg-[var(--tm-surface)]/60 px-3 py-1 text-xs text-[var(--tm-muted)]">{teacher.employeeId ?? "TCH001"}</span>
                  </div>
                  <p className="mt-5 text-sm text-[var(--tm-muted)]">Teacher intelligence</p>
                  <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Welcome, {teacher.name}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--tm-muted)]">Monitor academic performance, attendance and AI risk across your students.</p>
                </div>
                <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)]/65 px-5 py-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-wider text-[var(--tm-muted-2)]">Early warning</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--tm-success)]">AI monitoring active</p>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Students", summary.totalStudents, "text-[var(--tm-primary-light)]", "Total assigned"],
                ["Avg Attendance", `${summary.averageAttendance}%`, "text-[var(--tm-success)]", "Across students"],
                ["Avg Performance", `${summary.averagePerformance}%`, "text-[var(--tm-primary-light)]", "Academic average"],
                ["High Risk", summary.highRisk, "text-[var(--tm-danger)]", "Needs attention"],
              ].map(([label, value, tone, meta]) => (
                <div key={String(label)} className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 shadow-lg shadow-black/5 transition hover:-translate-y-0.5">
                  <p className="text-sm text-[var(--tm-muted)]">{label}</p>
                  <p className={`mt-4 text-3xl font-bold ${tone}`}>{value}</p>
                  <p className="mt-1 text-xs text-[var(--tm-muted-2)]">{meta}</p>
                </div>
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[28px] border border-[var(--tm-border)] bg-[var(--tm-surface)] p-6 shadow-lg shadow-black/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--tm-muted-2)]">Early warning</p>
                    <h3 className="mt-1 text-xl font-semibold">Student risk distribution</h3>
                  </div>
                  <span className="rounded-full border border-[var(--tm-border)] bg-[var(--tm-surface-2)] px-3 py-1 text-xs text-[var(--tm-muted)]">
                    {students.length} tracked
                  </span>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    ["High", summary.highRisk, "text-[var(--tm-danger)]", "bg-[var(--tm-danger)]/10"],
                    ["Medium", summary.mediumRisk, "text-[var(--tm-warning)]", "bg-[var(--tm-warning)]/10"],
                    ["Low", summary.lowRisk, "text-[var(--tm-success)]", "bg-[var(--tm-success)]/10"],
                  ].map(([label, value, tone, surface]) => (
                    <div key={String(label)} className={`rounded-2xl border border-[var(--tm-border)] p-5 ${surface}`}>
                      <p className={`text-sm font-medium ${tone}`}>{label} risk</p>
                      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--tm-border)] bg-[var(--tm-surface)] p-6 shadow-lg shadow-black/5">
                <p className="text-xs uppercase tracking-wider text-[var(--tm-muted-2)]">Courses</p>
                <h3 className="mt-1 text-xl font-semibold">Your teaching load</h3>
                <div className="mt-5 space-y-3">
                  {courses.map((course) => (
                    <div key={course.id} className="rounded-2xl border border-[var(--tm-border-soft)] bg-[var(--tm-surface-2)] p-4">
                      <p className="text-xs font-semibold text-[var(--tm-primary-light)]">{course.code}</p>
                      <p className="mt-1 text-sm font-medium">{course.name}</p>
                      <p className="mt-2 text-xs text-[var(--tm-muted-2)]">{course.studentCount} students · {course.assignmentCount} assignments · {course.examCount} exams</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-[28px] border border-[var(--tm-border)] bg-[var(--tm-surface)] p-6 shadow-lg shadow-black/5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--tm-muted-2)]">Intervention queue</p>
                  <h3 className="mt-1 text-xl font-semibold">Students requiring attention</h3>
                  <p className="mt-1 text-sm text-[var(--tm-muted)]">AI-ranked by academic risk.</p>
                </div>
                <p className="text-xs text-[var(--tm-muted-2)]">Higher risk appears first</p>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-[var(--tm-border-soft)] text-left text-xs uppercase tracking-wider text-[var(--tm-muted-2)]">
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Roll No.</th>
                      <th className="pb-3">Attendance</th>
                      <th className="pb-3">Average</th>
                      <th className="pb-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const tone =
                        student.riskLevel === "HIGH"
                          ? "text-[var(--tm-danger)] bg-[var(--tm-danger)]/10"
                          : student.riskLevel === "MEDIUM"
                            ? "text-[var(--tm-warning)] bg-[var(--tm-warning)]/10"
                            : "text-[var(--tm-success)] bg-[var(--tm-success)]/10";

                      return (
                        <tr key={student.id} className="border-b border-[var(--tm-border-soft)]">
                          <td className="py-4">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-[var(--tm-muted-2)]">{student.email}</p>
                          </td>
                          <td className="py-4 text-sm text-[var(--tm-muted)]">{student.rollNumber}</td>
                          <td className="py-4 text-sm">{student.attendance}%</td>
                          <td className="py-4 text-sm">{student.averageScore}%</td>
                          <td className="py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
                              {student.riskLevel} · {student.riskScore}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}