"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardResponse = {
  success: boolean;
  message?: string;
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

export default function AdminReportsPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        const authResponse = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const authData = await authResponse.json();

        if (
          !authResponse.ok ||
          !authData.success ||
          authData.user?.role !== "ADMIN"
        ) {
          router.replace("/login");
          return;
        }

        const response = await fetch("/api/admin/dashboard", {
          credentials: "include",
          cache: "no-store",
        });

        const result: DashboardResponse =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load reports."
          );
        }

        setData(result);
      } catch (err) {
        console.error("Admin reports error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load reports."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadReports();
  }, [router]);

  const reportMetrics = useMemo(() => {
    if (!data) return null;

    const { summary } = data;

    const totalRisk =
      summary.highRisk +
      summary.mediumRisk +
      summary.lowRisk;

    const highRiskPercent =
      totalRisk > 0
        ? Math.round((summary.highRisk / totalRisk) * 100)
        : 0;

    const mediumRiskPercent =
      totalRisk > 0
        ? Math.round((summary.mediumRisk / totalRisk) * 100)
        : 0;

    const lowRiskPercent =
      totalRisk > 0
        ? Math.round((summary.lowRisk / totalRisk) * 100)
        : 0;

    const activeRate =
      summary.totalUsers > 0
        ? Math.round(
            (summary.activeUsers / summary.totalUsers) * 100
          )
        : 0;

    const studentTeacherRatio =
      summary.totalTeachers > 0
        ? (
            summary.totalStudents / summary.totalTeachers
          ).toFixed(1)
        : "0";

    return {
      totalRisk,
      highRiskPercent,
      mediumRiskPercent,
      lowRiskPercent,
      activeRate,
      studentTeacherRatio,
    };
  }, [data]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EA] text-[#1E1D19]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9A6C2715] text-2xl text-[#9A6C27]">
            ◫
          </div>
          <h1 className="mt-5 text-2xl font-semibold">
            Loading reports...
          </h1>
          <p className="mt-2 text-sm text-[#7A7469]">
            Preparing academic analytics
          </p>
        </div>
      </main>
    );
  }

  if (!data || !reportMetrics) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EA] px-6">
        <div className="rounded-3xl border border-[#E7E1D6] bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-semibold">
            Unable to load reports
          </h1>
          <p className="mt-2 text-sm text-[#7A7469]">
            {error || "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#9A6C27] px-5 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const { summary, system } = data;
  const {
    totalRisk,
    highRiskPercent,
    mediumRiskPercent,
    lowRiskPercent,
    activeRate,
    studentTeacherRatio,
  } = reportMetrics;

  return (
    <main className="min-h-screen bg-[#F5F2EA] text-[#1E1D19]">
      <header className="sticky top-0 z-30 border-b border-[#E7E1D6] bg-[#FBF9F3]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D8B36A] to-[#9D7A43] font-bold text-[#0B0B0A]">
              E
            </div>
            <div>
              <p className="font-semibold">EduMind</p>
              <p className="text-xs text-[#7A7469]">
                Administrator Portal
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="rounded-xl border border-[#E7E1D6] bg-white px-4 py-2 text-sm font-medium"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="mb-6 text-sm font-semibold text-[#9A6C27]"
        >
          ← Back to Admin Dashboard
        </button>

        <section className="rounded-[30px] border border-[#E7E1D6] bg-white p-7 shadow-xl shadow-black/5 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A6C27]">
            Reports & analytics
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Academic intelligence reports
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5F5A50]">
            A consolidated view of platform activity,
            academic risk, user activity and AI status.
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Students", summary.totalStudents],
            ["Teachers", summary.totalTeachers],
            ["Courses", summary.totalCourses],
            ["Assignments", summary.totalAssignments],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-[#E7E1D6] bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-[#7A7469]">
                {label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#9A6C27]">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#E7E1D6] bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A6C27]">
              Risk analysis
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Student risk distribution
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  label: "High risk",
                  count: summary.highRisk,
                  percent: highRiskPercent,
                  color: "bg-red-500",
                },
                {
                  label: "Medium risk",
                  count: summary.mediumRisk,
                  percent: mediumRiskPercent,
                  color: "bg-amber-500",
                },
                {
                  label: "Low risk",
                  count: summary.lowRisk,
                  percent: lowRiskPercent,
                  color: "bg-emerald-500",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {item.label}
                    </span>
                    <span className="text-[#7A7469]">
                      {item.count} · {item.percent}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEE9DE]">
                    <div
                      className={`h-full ${item.color}`}
                      style={{
                        width: `${item.percent}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-[#F8F6F0] p-5">
              <p className="text-xs text-[#7A7469]">
                Average AI risk score
              </p>
              <p className="mt-1 text-3xl font-bold text-[#9A6C27]">
                {summary.averageRiskScore}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E7E1D6] bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A6C27]">
              Activity monitoring
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Platform activity snapshot
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F8F6F0] p-5">
                <p className="text-xs text-[#7A7469]">
                  Active users
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.activeUsers}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  {activeRate}% of all users
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8F6F0] p-5">
                <p className="text-xs text-[#7A7469]">
                  Inactive users
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.inactiveUsers}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8F6F0] p-5">
                <p className="text-xs text-[#7A7469]">
                  Suspended users
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.suspendedUsers}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8F6F0] p-5">
                <p className="text-xs text-[#7A7469]">
                  Student / teacher ratio
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {studentTeacherRatio}:1
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-[#E7E1D6] bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A6C27]">
            Comparative report
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Academic resource comparison
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Students / Course",
                value:
                  summary.totalCourses > 0
                    ? (
                        summary.totalStudents /
                        summary.totalCourses
                      ).toFixed(1)
                    : "0",
              },
              {
                label: "Classes / Course",
                value:
                  summary.totalCourses > 0
                    ? (
                        summary.totalClasses /
                        summary.totalCourses
                      ).toFixed(1)
                    : "0",
              },
              {
                label: "Assignments / Course",
                value:
                  summary.totalCourses > 0
                    ? (
                        summary.totalAssignments /
                        summary.totalCourses
                      ).toFixed(1)
                    : "0",
              },
              {
                label: "Exams / Course",
                value:
                  summary.totalCourses > 0
                    ? (
                        summary.totalExams /
                        summary.totalCourses
                      ).toFixed(1)
                    : "0",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#E7E1D6] bg-[#FAF8F3] p-5"
              >
                <p className="text-xs text-[#7A7469]">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#9A6C27]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-[#E7E1D6] bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A6C27]">
            AI insights
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Decision support overview
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#F8F6F0] p-5">
              <p className="text-xs text-[#7A7469]">
                Average risk
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {summary.averageRiskScore}
              </p>
              <p className="mt-1 text-xs text-[#7A7469]">
                Lower is better
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8F6F0] p-5">
              <p className="text-xs text-[#7A7469]">
                Students requiring attention
              </p>
              <p className="mt-2 text-2xl font-semibold text-red-600">
                {summary.highRisk + summary.mediumRisk}
              </p>
              <p className="mt-1 text-xs text-[#7A7469]">
                High + medium risk
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8F6F0] p-5">
              <p className="text-xs text-[#7A7469]">
                AI engine
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">
                {system.aiEngine}
              </p>
              <p className="mt-1 text-xs text-[#7A7469]">
                Academic intelligence available
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-[#E7E1D6] bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A6C27]">
            System health
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ["Platform", system.status],
              ["Database", system.database],
              ["AI Engine", system.aiEngine],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl bg-[#F8F6F0] p-5"
              >
                <span className="text-sm">{label}</span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}