"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type AIRiskData = {
  success: boolean;
  analysis: {
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    attendanceRate: number;
    averageScore: number;
    assignmentCompletionRate: number;
    averageExamScore: number;
    weakSubjects: string[];
    summary: string;
  };
};

type AIAdvisorData = {
  success: boolean;
  advisor: {
    student: {
      name: string;
      rollNumber: string;
    };
    summary: string;
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    prediction: string;
    metrics: {
      attendanceRate: number;
      averageScore: number;
      assignmentCompletionRate: number;
      averageExamScore: number;
      present: number;
      late: number;
      absent: number;
    };
    strengths: string[];
    weakSubjects: string[];
    recommendations: {
      priority: "HIGH" | "MEDIUM" | "LOW";
      title: string;
      message: string;
      action: string;
    }[];
  };
};

type DashboardData = {
  student: {
    rollNumber: string;
    department: string | null;
    semester: number | null;
    year: number | null;
  };

  summary: {
    attendance: number;
    totalAttendance: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    courses: number;
    assignments: number;
    pendingAssignments: number;
    averageScore: number;
    exams: number;
    aiRiskScore: number;
    aiRiskLevel: "LOW" | "MEDIUM" | "HIGH";
  };

  courses: {
    id: string;
    code: string;
    name: string;
    credits: number | null;
    department: string | null;
    semester: number | null;
  }[];

  assignments: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    maxMarks: number;
    course: {
      id: string;
      code: string;
      name: string;
    };
    submission: {
      id: string;
      status: string;
      marks: number | null;
      submittedAt: string | null;
    } | null;
  }[];

  grades: {
    id: string;
    score: number;
    grade: string | null;
    semester: number | null;
    remarks: string | null;
    course: {
      id: string;
      code: string;
      name: string;
    };
  }[];

  exams: {
    marks: number;
    grade: string | null;
    exam: {
      id: string;
      title: string;
      totalMarks: number;
      examDate: string;
      course: {
        code: string;
        name: string;
      };
    };
  }[];

  ai: {
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    analysis: {
      overallScore: number | null;
      attendanceRate: number | null;
      weakSubjects: unknown;
      summary: string | null;
      createdAt: string;
    } | null;
  };
};

function getRiskMeta(level: "LOW" | "MEDIUM" | "HIGH") {
  if (level === "HIGH") {
    return {
      label: "High risk",
      text: "text-[var(--em-danger)]",
      bg: "bg-[var(--em-danger-soft)]",
      border: "border-[var(--em-danger-border)]",
      dot: "bg-red-400",
    };
  }

  if (level === "MEDIUM") {
    return {
      label: "Medium risk",
      text: "text-[var(--em-primary-light)]",
      bg: "bg-[var(--em-primary)]/10",
      border: "border-[#B9914F]/25",
      dot: "bg-amber-400",
    };
  }

  return {
    label: "Low risk",
    text: "text-[var(--em-success)]",
    bg: "bg-[var(--em-success)]/10",
    border: "border-[var(--em-success-border)]",
    dot: "bg-emerald-400",
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StudentDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [aiRisk, setAiRisk] = useState<AIRiskData | null>(null);
  const [aiAdvisor, setAiAdvisor] = useState<AIAdvisorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("edumind-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("edumind-theme", theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    async function safeJson(response: Response, name: string) {
      const text = await response.text();

      console.log(
        `[${name}]`,
        response.status,
        response.headers.get("content-type")
      );

      if (!text) {
        throw new Error(`${name} returned an empty response`);
      }

      try {
        return JSON.parse(text);
      } catch {
        console.error(
          `${name} returned non-JSON:`,
          text.substring(0, 300)
        );

        throw new Error(`${name} returned an invalid response`);
      }
    }

    async function fetchWithTimeout(
      url: string,
      name: string,
      timeout = 10000
    ) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        return await safeJson(response, name);
      } finally {
        clearTimeout(timer);
      }
    }

    async function loadDashboard() {
      try {
        const authData = await fetchWithTimeout(
          "/api/auth/me",
          "AUTH"
        );

        if (!authData.success || !authData.user) {
          if (mounted) setLoading(false);
          router.replace("/");
          return;
        }

        if (authData.user.role !== "STUDENT") {
          if (mounted) setLoading(false);
          router.replace("/");
          return;
        }

        if (!mounted) return;
        setUser(authData.user);

        const dashboardData = await fetchWithTimeout(
          "/api/student/dashboard",
          "STUDENT DASHBOARD"
        );

        if (!dashboardData.success || !dashboardData.student) {
          if (mounted) setLoading(false);
          return;
        }

        if (!mounted) return;

        setDashboard(dashboardData);
        setLoading(false);

        fetchWithTimeout("/api/ai/risk", "AI RISK", 10000)
          .then((data) => {
            if (!data.success || !data.analysis || !mounted) return;

            setAiRisk(data);

            setDashboard((current) => {
              if (!current) return current;

              return {
                ...current,
                summary: {
                  ...current.summary,
                  aiRiskScore: data.analysis.riskScore,
                  aiRiskLevel: data.analysis.riskLevel,
                },
                ai: {
                  riskScore: data.analysis.riskScore,
                  riskLevel: data.analysis.riskLevel,
                  analysis: {
                    overallScore: data.analysis.averageScore,
                    attendanceRate: data.analysis.attendanceRate,
                    weakSubjects: data.analysis.weakSubjects,
                    summary: data.analysis.summary,
                    createdAt: new Date().toISOString(),
                  },
                },
              };
            });
          })
          .catch((error) => {
            console.warn("AI Risk unavailable:", error);
          });

        fetchWithTimeout("/api/ai/advisor", "AI ADVISOR", 10000)
          .then((data) => {
            if (!data.success || !data.advisor || !mounted) return;
            setAiAdvisor(data);
          })
          .catch((error) => {
            console.warn("AI Advisor unavailable:", error);
          });
      } catch (error) {
        console.error("Student dashboard loading error:", error);
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [router]);

  const themeStyle = {
    "--em-bg": theme === "dark" ? "#0B0B0A" : "#F5F2EA",
    "--em-sidebar": theme === "dark" ? "#11110F" : "#FBF9F3",
    "--em-surface": theme === "dark" ? "#141411" : "#FFFFFF",
    "--em-surface-2": theme === "dark" ? "#171713" : "#F1EEE6",
    "--em-surface-3": theme === "dark" ? "#1A1A16" : "#EAE6DC",
    "--em-surface-deep": theme === "dark" ? "#151512" : "#EFECE3",
    "--em-border-soft": theme === "dark" ? "#26261F" : "#E7E1D6",
    "--em-border": theme === "dark" ? "#34342C" : "#D9D2C5",
    "--em-border-strong": theme === "dark" ? "#404036" : "#C9C0B1",
    "--em-text": theme === "dark" ? "#F4F1E8" : "#1E1D19",
    "--em-muted": theme === "dark" ? "#B7B4A8" : "#5F5A50",
    "--em-muted-2": theme === "dark" ? "#817E74" : "#7A7469",
    "--em-muted-3": theme === "dark" ? "#625F56" : "#979083",
    "--em-primary": theme === "dark" ? "#B9914F" : "#9A6C27",
    "--em-primary-hover": theme === "dark" ? "#C9A45F" : "#845A20",
    "--em-primary-light": theme === "dark" ? "#D8B36A" : "#A8752F",
    "--em-primary-light-2": theme === "dark" ? "#E5C98E" : "#8A5F1F",
    "--em-primary-light-3": theme === "dark" ? "#F0DBAB" : "#6F4D1A",
    "--em-primary-dark": theme === "dark" ? "#9D7A43" : "#7A531D",
    "--em-primary-soft": theme === "dark" ? "rgba(185,145,79,0.12)" : "rgba(154,108,39,0.12)",
    "--em-primary-faint": theme === "dark" ? "rgba(185,145,79,0.06)" : "rgba(154,108,39,0.06)",
    "--em-primary-border": theme === "dark" ? "rgba(185,145,79,0.26)" : "rgba(154,108,39,0.26)",
    "--em-primary-shadow": theme === "dark" ? "rgba(185,145,79,0.15)" : "rgba(154,108,39,0.12)",

    "--em-hero-bg":
      theme === "dark"
        ? "linear-gradient(135deg, #161612 0%, #0F100E 55%, #2A2418 100%)"
        : "linear-gradient(135deg, #FFFDFC 0%, #F7F2E8 55%, #F1E5CC 100%)",

    "--em-hero-text":
      theme === "dark"
        ? "#F4F1E8"
        : "#1E1D19",

    "--em-hero-muted":
      theme === "dark"
        ? "#B7B4A8"
        : "#5F5A50",

    "--em-hero-border":
      theme === "dark"
        ? "rgba(185,145,79,0.28)"
        : "rgba(154,108,39,0.24)",

    "--em-hero-chip-bg":
      theme === "dark"
        ? "rgba(185,145,79,0.12)"
        : "rgba(154,108,39,0.08)",

    "--em-hero-status-bg":
      theme === "dark"
        ? "rgba(0,0,0,0.22)"
        : "rgba(255,255,255,0.66)",

    "--em-success": theme === "dark" ? "#8FB09A" : "#447357",
    "--em-success-light": theme === "dark" ? "#A8C3AF" : "#356047",
    "--em-success-soft": theme === "dark" ? "rgba(109,143,119,0.12)" : "rgba(68,115,87,0.11)",
    "--em-success-faint": theme === "dark" ? "rgba(109,143,119,0.06)" : "rgba(68,115,87,0.06)",
    "--em-success-border": theme === "dark" ? "rgba(109,143,119,0.25)" : "rgba(68,115,87,0.24)",
    "--em-danger": theme === "dark" ? "#D98C83" : "#A64E45",
    "--em-danger-light": theme === "dark" ? "#E8A7A0" : "#8E3D35",
    "--em-danger-soft": theme === "dark" ? "rgba(169,94,86,0.12)" : "rgba(166,78,69,0.10)",
    "--em-danger-faint": theme === "dark" ? "rgba(169,94,86,0.06)" : "rgba(166,78,69,0.06)",
    "--em-danger-border": theme === "dark" ? "rgba(169,94,86,0.25)" : "rgba(166,78,69,0.22)",
  } as CSSProperties;

  if (loading) {
    return (
      <main
        className="min-h-screen bg-[var(--em-bg)] text-[var(--em-text)] transition-colors duration-300"
        style={themeStyle}
      >
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-[var(--em-border)] bg-[var(--em-surface)]/90 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--em-primary-soft)] text-2xl">
              ✦
            </div>
            <h1 className="mt-5 text-xl font-semibold">
              Loading EduMind
            </h1>
            <p className="mt-2 text-sm text-[var(--em-muted)]">
              Preparing your academic intelligence...
            </p>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[var(--em-surface-3)]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--em-primary)]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--em-bg)] px-6 text-[var(--em-text)]">
        <div className="rounded-3xl border border-[var(--em-border)] bg-[var(--em-surface)]/90 p-8 text-center">
          <p className="text-lg font-semibold">Unable to load dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-[var(--em-primary)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--em-primary-hover)]"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const { summary } = dashboard;
  const riskScore =
    aiRisk?.analysis?.riskScore ?? summary.aiRiskScore;
  const riskLevel =
    aiRisk?.analysis?.riskLevel ?? summary.aiRiskLevel;
  const riskMeta = getRiskMeta(riskLevel);

  const assignmentStats = {
    total: dashboard.assignments.length,
    completed: dashboard.assignments.filter(
      (a) =>
        a.submission?.status === "SUBMITTED" ||
        a.submission?.status === "GRADED"
    ).length,
    pending: dashboard.assignments.filter(
      (a) =>
        !a.submission ||
        a.submission.status === "PENDING"
    ).length,
  };

  const assignmentCompletionRate =
    assignmentStats.total > 0
      ? Math.round(
          (assignmentStats.completed /
            assignmentStats.total) *
            100
        )
      : 0;

  const upcomingAssignments = [...dashboard.assignments]
    .filter((assignment) => {
      const submitted =
        assignment.submission?.status === "SUBMITTED" ||
        assignment.submission?.status === "GRADED";
      return (
        new Date(assignment.dueDate) >= new Date() &&
        !submitted
      );
    })
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() -
        new Date(b.dueDate).getTime()
    )
    .slice(0, 3);

  const averageScore =
    aiRisk?.analysis?.averageScore ?? summary.averageScore;

  const insightSummary =
    aiRisk?.analysis?.summary ??
    dashboard.ai.analysis?.summary ??
    "Your academic profile is being analyzed.";

  const topGrades = [...dashboard.grades]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const weakSubjects =
    aiAdvisor?.advisor.weakSubjects ??
    aiRisk?.analysis?.weakSubjects ??
    [];

  const strengths =
    aiAdvisor?.advisor.strengths ?? topGrades
      .filter((grade) => grade.score >= 85)
      .slice(0, 3)
      .map(
        (grade) =>
          `${grade.course.name} (${Math.round(grade.score)}%)`
      );

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[var(--em-bg)] text-[var(--em-text)] transition-colors duration-300" style={themeStyle}>
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-[var(--em-border-soft)] bg-[var(--em-sidebar)] xl:flex xl:flex-col">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Go to EduMind main menu"
            className="flex h-20 w-full items-center gap-3 border-b border-[var(--em-border-soft)] px-6 text-left transition hover:bg-[var(--em-surface)]/90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--em-primary-light)] to-[var(--em-primary-dark)] font-bold text-[var(--em-bg)] shadow-lg shadow-[var(--em-primary-shadow)]">
              E
            </div>
            <div className="min-w-0">
              <p className="font-semibold tracking-tight">
                EduMind
              </p>
              <p className="text-xs text-[var(--em-muted-2)]">
                Main menu
              </p>
            </div>
          </button>

          <nav className="flex-1 space-y-1 px-3 py-6">
            {[
              ["Overview", "⌂"],
              ["Analytics", "◫"],
              ["Courses", "▣"],
              ["Assignments", "✓"],
              ["AI Advisor", "✦"],
            ].map(([label, icon], index) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  index === 0
                    ? "bg-[var(--em-primary)]/15 text-[var(--em-primary-light-3)] ring-1 ring-inset ring-[var(--em-primary-border)] shadow-lg shadow-[var(--em-primary-shadow)]"
                    : "text-[var(--em-muted)] hover:bg-[var(--em-surface-2)] hover:text-[var(--em-text)]"
                }`}
              >
                <span className="w-5 text-center">
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </nav>

          <div className="border-t border-[var(--em-border-soft)] p-4">
            <div className="rounded-2xl border border-[var(--em-border-soft)] bg-[var(--em-surface)]/90 p-4">
              <p className="text-xs text-[var(--em-muted-2)]">
                Semester
              </p>
              <p className="mt-1 font-semibold">
                {dashboard.student.semester ?? "-"} ·{" "}
                {dashboard.student.department ?? "CSE"}
              </p>
              <p className="mt-1 text-xs text-[var(--em-muted-2)]">
                Roll No. {dashboard.student.rollNumber}
              </p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-4 w-full rounded-xl border border-[var(--em-border)] bg-[var(--em-surface)]/90 px-3 py-2 text-xs font-medium text-[var(--em-muted)] transition hover:bg-[var(--em-surface-3)] hover:text-[var(--em-text)]"
              >
                ← Back to main menu
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">

          {/* TOP BAR */}
          <header className="sticky top-0 z-20 border-b border-[var(--em-border-soft)] bg-[var(--em-bg)]/80 backdrop-blur-2xl">
            <div className="flex h-20 items-center justify-between px-5 sm:px-8 xl:px-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  aria-label="Go to EduMind main menu"
                  className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[var(--em-border)] bg-[var(--em-surface)] text-sm font-bold text-[var(--em-primary-light)] transition hover:border-[var(--em-primary-border)] sm:flex xl:hidden"
                >
                  E
                </button>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--em-primary-light)]">
                    Student Dashboard
                  </p>
                <h1 className="mt-1 text-lg font-semibold">
                  Academic overview
                </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--em-border)] bg-[var(--em-surface)] text-[var(--em-text)] xl:hidden"
                  aria-label="Open navigation menu"
                >
                  ☰
                </button>

                <button
                  type="button"
                  onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
                  className="flex h-10 items-center gap-2 rounded-xl border border-[var(--em-border)] bg-[var(--em-surface)] px-3 text-xs font-medium text-[var(--em-muted)] transition hover:text-[var(--em-text)]"
                  aria-label="Toggle color theme"
                >
                  <span className="text-sm">{theme === "dark" ? "☀" : "☾"}</span>
                  <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
                </button>

                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">
                    {user.name}
                  </p>
                  <p className="text-xs text-[var(--em-muted-2)]">
                    {user.email}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--em-border)] bg-[var(--em-surface-3)] text-sm font-semibold">
                  {initials}
                </div>
              </div>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 xl:hidden">
              <button
                type="button"
                aria-label="Close navigation menu"
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />

              <aside className="relative h-full w-[82%] max-w-sm border-r border-[var(--em-border)] bg-[var(--em-sidebar)] p-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--em-border-soft)] pb-5">
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--em-primary-light)] to-[var(--em-primary-dark)] font-bold text-[var(--em-bg)]">E</div>
                    <div>
                      <p className="font-semibold">EduMind</p>
                      <p className="text-xs text-[var(--em-muted-2)]">Main menu</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-10 w-10 rounded-xl border border-[var(--em-border)] text-[var(--em-muted)]"
                    aria-label="Close navigation menu"
                  >
                    ×
                  </button>
                </div>

                <nav className="mt-6 space-y-1">
                  {["Overview", "Analytics", "Courses", "Assignments", "AI Advisor"].map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${index === 0 ? "bg-[var(--em-primary-soft)] text-[var(--em-primary-light-2)]" : "text-[var(--em-muted)] hover:bg-[var(--em-surface-2)] hover:text-[var(--em-text)]"}`}
                    >
                      <span className="w-5 text-center">{["⌂", "◫", "▣", "✓", "✦"][index]}</span>
                      {label}
                    </button>
                  ))}
                </nav>

                <div className="mt-8 rounded-2xl border border-[var(--em-border-soft)] bg-[var(--em-surface)] p-4">
                  <p className="text-xs text-[var(--em-muted-2)]">Profile</p>
                  <p className="mt-1 font-semibold">{user.name}</p>
                  <p className="mt-1 text-xs text-[var(--em-muted-2)]">{dashboard.student.rollNumber}</p>
                </div>
              </aside>
            </div>
          )}

          <div className="mx-auto max-w-[1450px] px-5 py-8 sm:px-8 xl:px-10">

            {/* MOBILE CONTEXT */}
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Go to EduMind main menu"
              className="mb-6 flex items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-[var(--em-surface)]/90 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--em-primary-light)] to-[var(--em-primary-dark)] font-bold text-[var(--em-bg)]">
                E
              </div>
              <div>
                <p className="font-semibold">EduMind</p>
                <p className="text-xs text-[var(--em-muted-2)]">
                  Main menu
                </p>
              </div>
            </button>

            {/* HERO */}
            <section
              className="relative overflow-hidden rounded-[28px] border p-6 shadow-2xl shadow-black/10 transition-colors duration-300 sm:p-8"
              style={{
                background: "var(--em-hero-bg)",
                borderColor: "var(--em-hero-border)",
              }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[var(--em-primary)]/8 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[var(--em-primary-light-2)]/5 blur-3xl" />

              <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[var(--em-hero-border)] bg-[var(--em-hero-chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--em-primary-light-2)]">
                      {dashboard.student.department ?? "CSE"}
                    </span>
                    <span className="rounded-full border border-[var(--em-hero-border)] bg-[var(--em-hero-chip-bg)] px-3 py-1 text-xs text-[var(--em-hero-muted)]">
                      Semester {dashboard.student.semester ?? "-"}
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-[var(--em-hero-muted)]">
                    Welcome back
                  </p>

                  <h2 className="mt-1 text-3xl font-bold tracking-tight text-[var(--em-hero-text)] sm:text-4xl">
                    {user.name} <span className="text-[var(--em-primary-light)]">✦</span>
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--em-hero-muted)]">
                    Your academic performance, workload and AI insights are
                    in one place.
                  </p>
                </div>

                <div className="rounded-2xl border px-5 py-4 backdrop-blur-md" style={{ borderColor: "var(--em-hero-border)", background: "var(--em-hero-status-bg)" }}>
                  <p className="text-xs uppercase tracking-wider text-[var(--em-hero-muted)]">
                    Current AI status
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${riskMeta.dot}`}
                    />
                    <p className={`font-semibold ${riskMeta.text}`}>
                      {riskMeta.label}
                    </p>
                    <span className="text-[var(--em-hero-muted)]">·</span>
                    <p className="font-semibold">
                      Score {riskScore}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* KPI GRID */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Attendance",
                  value: `${summary.attendance}%`,
                  meta: `${summary.present} present · ${summary.absent} absent`,
                  icon: "◷",
                  tone: "text-[var(--em-success)]",
                },
                {
                  label: "Average Score",
                  value: `${averageScore}%`,
                  meta: `${summary.courses} active courses`,
                  icon: "↗",
                  tone: "text-[var(--em-primary-light)]",
                },
                {
                  label: "Assignments",
                  value: `${assignmentStats.pending}`,
                  meta: `${assignmentCompletionRate}% completion`,
                  icon: "✓",
                  tone: "text-[var(--em-primary-light)]",
                },
                {
                  label: "AI Risk",
                  value: `${riskScore}`,
                  meta: riskMeta.label,
                  icon: "✦",
                  tone: riskMeta.text,
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="group rounded-2xl border border-[var(--em-border)] bg-[var(--em-surface)]/90 p-5 shadow-lg shadow-black/5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--em-border-strong)] hover:bg-[var(--em-surface-2)]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--em-muted)]">
                      {card.label}
                    </p>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--em-surface-3)] ${card.tone}`}
                    >
                      {card.icon}
                    </span>
                  </div>
                  <p className={`mt-4 text-3xl font-bold ${card.tone}`}>
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-[var(--em-muted-2)]">
                    {card.meta}
                  </p>
                </div>
              ))}
            </section>

            {/* MAIN GRID */}
            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">

              {/* PERFORMANCE */}
              <div className="rounded-[28px] border border-[var(--em-border)] bg-[var(--em-surface)]/90 p-6 shadow-xl shadow-black/10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--em-muted-2)]">
                      Performance
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      Subject performance
                    </h3>
                  </div>
                  <span className="rounded-full border border-[var(--em-border)] bg-[var(--em-surface)]/90 px-3 py-1 text-xs text-[var(--em-muted)]">
                    {summary.averageScore}% overall
                  </span>
                </div>

                <div className="mt-7 space-y-5">
                  {topGrades.map((grade) => {
                    const score = Math.max(
                      0,
                      Math.min(100, grade.score)
                    );
                    const bar =
                      score >= 85
                        ? "bg-[var(--em-success)]"
                        : score >= 70
                          ? "bg-[var(--em-primary-light)]"
                          : score >= 50
                            ? "bg-[var(--em-primary-dark)]"
                            : "bg-[var(--em-danger)]";

                    return (
                      <div key={grade.id}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {grade.course.name}
                            </p>
                            <p className="mt-1 text-xs text-[var(--em-muted-2)]">
                              {grade.course.code}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-semibold">
                              {grade.score}%
                            </p>
                            <p className="text-xs text-[var(--em-muted-2)]">
                              Grade {grade.grade ?? "-"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-2 rounded-full bg-[var(--em-surface-3)]">
                          <div
                            className={`h-full rounded-full ${bar}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI PANEL */}
              <div className={`rounded-3xl border ${riskMeta.border} ${riskMeta.bg} p-6`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--em-muted)]">
                      AI Academic Intelligence
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      Your academic signal
                    </h3>
                  </div>
                  <span className="text-xl text-[var(--em-primary-light-2)]">✦</span>
                </div>

                <div className="mt-7 flex items-center gap-5">
                  <div className="relative h-24 w-24 shrink-0 rounded-full border-8 border-[var(--em-border-soft)]">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(var(--em-primary) ${
                          Math.max(0, Math.min(100, riskScore)) * 3.6
                        }deg, transparent 0deg)`,
                        mask:
                          "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7px))",
                        WebkitMask:
                          "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7px))",
                      }}
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-[var(--em-surface-deep)]">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {riskScore}
                        </p>
                        <p className="text-[10px] text-[var(--em-muted-2)]">
                          RISK
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className={`text-lg font-semibold ${riskMeta.text}`}>
                      {riskMeta.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--em-muted)]">
                      {insightSummary}
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[var(--em-border-soft)] bg-black/20 p-4">
                    <p className="text-xs text-[var(--em-muted-2)]">
                      Attendance
                    </p>
                    <p className="mt-1 font-semibold">
                      {aiRisk?.analysis?.attendanceRate ??
                        summary.attendance}
                      %
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--em-border-soft)] bg-black/20 p-4">
                    <p className="text-xs text-[var(--em-muted-2)]">
                      Exam average
                    </p>
                    <p className="mt-1 font-semibold">
                      {aiRisk?.analysis?.averageExamScore ??
                        (dashboard.exams.length > 0
                          ? Math.round(
                              dashboard.exams.reduce(
                                (sum, exam) =>
                                  sum +
                                  (exam.exam.totalMarks
                                    ? (exam.marks /
                                        exam.exam.totalMarks) *
                                      100
                                    : 0),
                                0
                              ) / dashboard.exams.length
                            )
                          : 0)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECONDARY GRID */}
            <section className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* ASSIGNMENTS */}
              <div className="rounded-[28px] border border-[var(--em-border)] bg-[var(--em-surface)]/90 p-6 shadow-xl shadow-black/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--em-muted-2)]">
                      Workload
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      Upcoming assignments
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[var(--em-primary-light)]">
                      {assignmentStats.pending}
                    </p>
                    <p className="text-xs text-[var(--em-muted-2)]">
                      pending
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {upcomingAssignments.map((assignment) => {
                    const days = Math.ceil(
                      (new Date(
                        assignment.dueDate
                      ).getTime() -
                        Date.now()) /
                        (1000 * 60 * 60 * 24)
                    );

                    const urgent = days <= 1;

                    return (
                      <button
                        key={assignment.id}
                        type="button"
                        onClick={() =>
                          router.push(
                            `/student/assignments/${assignment.id}`
                          )
                        }
                        aria-label={`Open assignment ${assignment.title}`}
                        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--em-border-soft)] bg-black/20 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[var(--em-primary-border)] hover:bg-[var(--em-surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--em-primary)]/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {assignment.title}
                          </p>
                          <p className="mt-1 text-xs text-[var(--em-muted-2)]">
                            {assignment.course.code} ·{" "}
                            {formatDate(assignment.dueDate)}
                          </p>
                          <p className="mt-2 text-[11px] font-medium text-[var(--em-primary-light)]">
                            Open submission →
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                            urgent
                              ? "bg-[var(--em-danger-soft)] text-[var(--em-danger)]"
                              : "bg-[var(--em-primary)]/10 text-[var(--em-primary-light)]"
                          }`}
                        >
                          {days <= 0
                            ? "Due today"
                            : days === 1
                              ? "Tomorrow"
                              : `${days} days`}
                        </span>
                      </button>
                    );
                  })}

                  {upcomingAssignments.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[var(--em-border)] p-8 text-center">
                      <p className="text-2xl">✓</p>
                      <p className="mt-2 font-medium text-[var(--em-success)]">
                        All caught up
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* COURSES */}
              <div className="rounded-[28px] border border-[var(--em-border)] bg-[var(--em-surface)]/90 p-6 shadow-xl shadow-black/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--em-muted-2)]">
                      Academics
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      Your courses
                    </h3>
                  </div>
                  <span className="rounded-full border border-[var(--em-border)] bg-[var(--em-surface)]/90 px-3 py-1 text-xs text-[var(--em-muted)]">
                    {dashboard.courses.length} active
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {dashboard.courses.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-2xl border border-[var(--em-border-soft)] bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[var(--em-primary-light)]">
                            {course.code}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm font-medium">
                            {course.name}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[var(--em-surface-2)] px-2.5 py-1 text-[10px] text-[var(--em-muted-2)]">
                          {course.credits ?? "-"} cr
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* AI ADVISOR */}
            {aiAdvisor && (
              <section className="mt-6">
                <div className="rounded-3xl border border-blue-400/10 bg-gradient-to-br from-[var(--em-primary-soft)] via-[var(--em-surface-2)]/30 to-transparent p-6">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--em-primary-light-2)]">
                        AI Academic Advisor
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold">
                        What should you focus on next?
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[var(--em-muted)]">
                        {aiAdvisor.advisor.summary}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[var(--em-border)] bg-black/20 px-5 py-4 xl:min-w-44">
                      <p className="text-xs text-[var(--em-muted-2)]">
                        Predicted performance
                      </p>
                      <p className="mt-1 text-2xl font-bold text-[var(--em-primary-light-2)]">
                        {aiAdvisor.advisor.prediction}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--em-border-soft)] bg-black/20 p-5">
                      <p className="text-sm font-semibold">
                        📈 Strengths
                      </p>
                      <div className="mt-4 space-y-2">
                        {strengths.length > 0 ? (
                          strengths.slice(0, 3).map((strength, index) => (
                            <div
                              key={`${strength}-${index}`}
                              className="rounded-xl bg-[var(--em-success)]/5 px-4 py-3 text-sm text-[var(--em-success-light)]"
                            >
                              ✓ {strength}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-[var(--em-muted-2)]">
                            Keep building your academic strengths.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--em-border-soft)] bg-black/20 p-5">
                      <p className="text-sm font-semibold">
                        🎯 Priority recommendations
                      </p>
                      <div className="mt-4 space-y-3">
                        {aiAdvisor.advisor.recommendations
                          .slice(0, 3)
                          .map((item, index) => {
                            const priority =
                              item.priority === "HIGH"
                                ? "text-[var(--em-danger)]"
                                : item.priority === "MEDIUM"
                                  ? "text-[var(--em-primary-light)]"
                                  : "text-[var(--em-success)]";

                            return (
                              <div
                                key={`${item.title}-${index}`}
                                className="rounded-xl border border-[var(--em-border-soft)] bg-[var(--em-surface-2)] p-4"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-sm font-medium">
                                      {index + 1}. {item.title}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-[var(--em-muted-2)]">
                                      {item.action}
                                    </p>
                                  </div>
                                  <span
                                    className={`text-[10px] font-semibold uppercase ${priority}`}
                                  >
                                    {item.priority}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {weakSubjects.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-[var(--em-danger-border)] bg-red-500/[0.03] p-5">
                      <p className="text-sm font-semibold text-[var(--em-danger-light)]">
                        ⚠ Areas to improve
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {weakSubjects.map((subject, index) => (
                          <span
                            key={`${String(subject)}-${index}`}
                            className="rounded-full bg-[var(--em-danger-soft)] px-3 py-1.5 text-xs text-[var(--em-danger-light)]"
                          >
                            {String(subject)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ATTENDANCE */}
            <section className="mt-6">
              <div className="rounded-[28px] border border-[var(--em-border)] bg-[var(--em-surface)]/90 p-6 shadow-xl shadow-black/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--em-muted-2)]">
                      Attendance
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      Attendance overview
                    </h3>
                  </div>
                  <span className="text-2xl font-bold text-[var(--em-success)]">
                    {summary.attendance}%
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  {[
                    ["Present", summary.present, "text-[var(--em-success)]"],
                    ["Late", summary.late, "text-[var(--em-primary-light)]"],
                    ["Absent", summary.absent, "text-[var(--em-danger)]"],
                    ["Total", summary.totalAttendance, "text-[var(--em-text)]"],
                  ].map(([label, value, tone]) => (
                    <div
                      key={String(label)}
                      className="rounded-2xl border border-[var(--em-border-soft)] bg-black/20 p-4"
                    >
                      <p className="text-xs text-[var(--em-muted-2)]">
                        {label}
                      </p>
                      <p className={`mt-2 text-2xl font-semibold ${tone}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="mt-10 flex flex-col gap-2 border-t border-[var(--em-border-soft)] py-6 text-xs text-[var(--em-muted-3)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                EduMind · AI-Powered Education Management Portal
              </p>
              <p>Buildathon 2026</p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}