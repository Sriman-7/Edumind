"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Theme = "light" | "dark";

const courses = [
  {
    code: "CS401",
    name: "Cybersecurity Fundamentals",
    credits: 4,
    tag: "Security",
  },
  {
    code: "CS402",
    name: "Artificial Intelligence",
    credits: 4,
    tag: "AI",
  },
  {
    code: "CS403",
    name: "Database Management Systems",
    credits: 4,
    tag: "Data",
  },
  {
    code: "CS404",
    name: "Full Stack Development",
    credits: 4,
    tag: "Development",
  },
];

const studyTips = [
  "Review difficult subjects before your next assessment.",
  "Track assignment deadlines before they become urgent.",
  "Maintain consistent attendance to protect your performance.",
];

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("edumind-public-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("edumind-public-theme", theme);
  }, [theme]);

  const dark = theme === "dark";

  const styles = {
    bg: dark ? "#0B0B0A" : "#F5F2EA",
    surface: dark ? "#141411" : "#FFFFFF",
    surface2: dark ? "#1A1A16" : "#F8F6F0",
    border: dark ? "#34342C" : "#E7E1D6",
    text: dark ? "#F4F1E8" : "#1E1D19",
    muted: dark ? "#B7B4A8" : "#5F5A50",
    subtle: dark ? "#817E74" : "#7A7469",
    primary: dark ? "#D8B36A" : "#9A6C27",
    primaryHover: dark ? "#E5C98E" : "#845A20",
    success: dark ? "#8FB09A" : "#447357",
    hero:
      dark
        ? "linear-gradient(135deg,#161612 0%,#0F100E 58%,#2A2418 100%)"
        : "linear-gradient(135deg,#FFFDFC 0%,#F7F2E8 58%,#F1E5CC 100%)",
  };

  return (
    <main
      className="min-h-screen transition-colors duration-300"
      style={{
        background: styles.bg,
        color: styles.text,
      }}
    >
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          background: dark
            ? "rgba(11,11,10,.88)"
            : "rgba(245,242,234,.88)",
          borderColor: styles.border,
        }}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
            aria-label="EduMind home"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg,#D8B36A,#9D7A43)",
                color: "#0B0B0A",
              }}
            >
              E
            </div>

            <div className="text-left">
              <p className="font-semibold tracking-tight">EduMind</p>
              <p
                className="text-xs"
                style={{ color: styles.subtle }}
              >
                Intelligent education platform
              </p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            <button
              onClick={() => router.push("/")}
              className="text-sm font-medium"
              style={{ color: styles.text }}
            >
              Home
            </button>

            <button
              onClick={() => router.push("/courses")}
              className="text-sm transition"
              style={{ color: styles.muted }}
            >
              Courses
            </button>

            <button
              onClick={() => router.push("/contact")}
              className="text-sm transition"
              style={{ color: styles.muted }}
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme switch */}
            <button
              type="button"
              onClick={() =>
                setTheme((current) =>
                  current === "dark" ? "light" : "dark"
                )
              }
              className="flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition"
              style={{
                borderColor: styles.border,
                background: styles.surface,
                color: styles.muted,
              }}
              aria-label="Toggle color theme"
            >
              <span>{dark ? "☀" : "☾"}</span>
              <span className="hidden sm:inline">
                {dark ? "Light" : "Dark"}
              </span>
            </button>

            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border md:hidden"
              style={{
                borderColor: styles.border,
                background: styles.surface,
                color: styles.text,
              }}
              aria-label="Open navigation"
            >
              ☰
            </button>

            <button
              onClick={() => router.push("/login")}
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition sm:block"
              style={{ background: styles.primary }}
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          />

          <aside
            className="relative h-full w-[82%] max-w-sm border-r p-5 shadow-2xl"
            style={{
              background: styles.surface,
              borderColor: styles.border,
            }}
          >
            <div
              className="flex items-center justify-between border-b pb-5"
              style={{ borderColor: styles.border }}
            >
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/");
                }}
                className="flex items-center gap-3 text-left"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg,#D8B36A,#9D7A43)",
                    color: "#0B0B0A",
                  }}
                >
                  E
                </div>
                <div>
                  <p className="font-semibold">EduMind</p>
                  <p
                    className="text-xs"
                    style={{ color: styles.subtle }}
                  >
                    Main menu
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="h-10 w-10 rounded-xl border"
                style={{
                  borderColor: styles.border,
                  color: styles.muted,
                }}
                aria-label="Close navigation"
              >
                ×
              </button>
            </div>

            <nav className="mt-6 space-y-1">
              {[
                ["Home", "/"],
                ["Courses", "/courses"],
                ["Contact", "/contact"],
                ["Sign in", "/login"],
              ].map(([label, href]) => (
                <button
                  key={label}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(href);
                  }}
                  className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition"
                  style={{ color: styles.muted }}
                >
                  {label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-32 -top-20 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "#D8B36A22" }}
        />
        <div
          className="pointer-events-none absolute -right-20 top-20 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "#8FB09A1D" }}
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 lg:pb-28 lg:pt-28">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide"
              style={{
                borderColor: styles.border,
                background: styles.surface,
                color: styles.primary,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: styles.success,
                  boxShadow: `0 0 10px ${styles.success}88`,
                }}
              />
              WEB DEVELOPMENT × INTEGRATED AI
            </div>

            <h1
              className="mt-7 text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl"
              style={{ color: styles.text }}
            >
              Education that
              <span
                className="block"
                style={{ color: styles.primary }}
              >
                understands you.
              </span>
            </h1>

            <p
              className="mt-7 max-w-2xl text-lg leading-8"
              style={{ color: styles.muted }}
            >
              EduMind connects students, teachers and administrators
              through academic management, performance intelligence
              and personalized AI-powered insights.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/courses")}
                className="rounded-xl px-6 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                style={{
                  background: styles.primary,
                  boxShadow: `0 12px 30px ${styles.primary}22`,
                }}
              >
                Explore Courses →
              </button>

              <button
                onClick={() => router.push("/login")}
                className="rounded-xl border px-6 py-3.5 font-semibold transition"
                style={{
                  borderColor: styles.border,
                  background: styles.surface,
                  color: styles.text,
                }}
              >
                Sign in
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              ["AI", "Academic Intelligence"],
              ["3", "Connected Roles"],
              ["24/7", "Academic Visibility"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5"
                style={{
                  borderColor: styles.border,
                  background: styles.surface,
                }}
              >
                <p
                  className="text-3xl font-bold"
                  style={{ color: styles.primary }}
                >
                  {value}
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: styles.subtle }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section
        className="border-y"
        style={{
          borderColor: styles.border,
          background: styles.surface,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: styles.primary }}
              >
                Featured Courses
              </p>
              <h2
                className="mt-2 text-3xl font-semibold tracking-tight"
                style={{ color: styles.text }}
              >
                Explore the academic catalog
              </h2>
              <p
                className="mt-2 text-sm"
                style={{ color: styles.subtle }}
              >
                Discover courses designed for modern technical education.
              </p>
            </div>

            <button
              onClick={() => router.push("/courses")}
              className="text-sm font-semibold"
              style={{ color: styles.primary }}
            >
              View all courses →
            </button>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <button
                key={course.code}
                onClick={() =>
                  router.push(`/courses/${course.code}`)
                }
                className="group rounded-2xl border p-5 text-left transition duration-300 hover:-translate-y-1"
                style={{
                  borderColor: styles.border,
                  background: dark ? styles.surface2 : "#FCFBF7",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: styles.primary }}
                  >
                    {course.code}
                  </span>

                  <span
                    className="rounded-full px-2.5 py-1 text-[10px]"
                    style={{
                      background: dark ? "#24241E" : "#F1EEE6",
                      color: styles.subtle,
                    }}
                  >
                    {course.credits} credits
                  </span>
                </div>

                <h3
                  className="mt-5 text-lg font-semibold"
                  style={{ color: styles.text }}
                >
                  {course.name}
                </h3>

                <p
                  className="mt-2 text-sm"
                  style={{ color: styles.subtle }}
                >
                  {course.tag}
                </p>

                <p
                  className="mt-6 text-sm font-medium"
                  style={{ color: styles.primary }}
                >
                  View course →
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: styles.primary }}
          >
            Built for every role
          </p>
          <h2
            className="mt-2 text-3xl font-semibold"
            style={{ color: styles.text }}
          >
            One platform. Three experiences.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            [
              "Student",
              "Learn with clarity",
              "Track courses, assignments, attendance, grades, progress and personalized AI recommendations.",
              styles.primary,
            ],
            [
              "Teacher",
              "Teach with insight",
              "Manage courses, academic activity, attendance, assessments and students requiring attention.",
              styles.success,
            ],
            [
              "Administrator",
              "Manage the bigger picture",
              "Monitor users, academic infrastructure, performance, AI risk and institutional insights.",
              styles.primary,
            ],
          ].map(([label, title, description, accent]) => (
            <div
              key={String(label)}
              className="rounded-3xl border p-7"
              style={{
                borderColor: styles.border,
                background: dark ? styles.surface : "#F8F6F0",
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: String(accent) }}
              >
                {label}
              </p>
              <h3
                className="mt-2 text-xl font-semibold"
                style={{ color: styles.text }}
              >
                {title}
              </h3>
              <p
                className="mt-3 text-sm leading-6"
                style={{ color: styles.muted }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div
          className="rounded-[30px] border p-7 sm:p-10"
          style={{
            background: styles.hero,
            borderColor: styles.border,
          }}
        >
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: styles.primary }}
              >
                AI Powered Academic Intelligence
              </p>
              <h2
                className="mt-3 text-3xl font-semibold"
                style={{ color: styles.text }}
              >
                From academic data to meaningful action.
              </h2>
              <p
                className="mt-4 max-w-2xl text-sm leading-7"
                style={{ color: styles.muted }}
              >
                EduMind analyzes attendance, assignments,
                examination marks and academic performance to
                identify risk, weak subjects and useful next steps.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                "Performance analysis",
                "Academic risk detection",
                "Weak subject identification",
                "Personalized recommendations",
                "Teacher early-warning insights",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border px-4 py-3.5 text-sm font-medium"
                  style={{
                    borderColor: styles.border,
                    background: styles.surface,
                    color: styles.text,
                  }}
                >
                  <span
                    className="mr-2"
                    style={{ color: styles.primary }}
                  >
                    ✦
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STUDY TIPS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: styles.primary }}
          >
            AI Study Tips
          </p>
          <h2
            className="mt-2 text-3xl font-semibold"
            style={{ color: styles.text }}
          >
            Small improvements compound.
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {studyTips.map((tip, index) => (
            <div
              key={tip}
              className="rounded-2xl border p-5"
              style={{
                borderColor: styles.border,
                background: styles.surface,
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: styles.primary }}
              >
                0{index + 1}
              </p>
              <p
                className="mt-4 text-sm leading-6"
                style={{ color: styles.muted }}
              >
                {tip}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div
          className="rounded-[30px] p-8 sm:p-10"
          style={{
            background: dark ? "#171713" : "#22221D",
            color: "#F4F1E8",
          }}
        >
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D8B36A]">
                Get started
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                Build a better academic journey.
              </h2>
              <p className="mt-3 text-sm text-[#B7B4A8]">
                Explore courses or sign in to your EduMind workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/courses")}
                className="rounded-xl bg-[#D8B36A] px-5 py-3 font-semibold text-[#171713] hover:bg-[#E5C98E]"
              >
                Explore Courses
              </button>

              <button
                onClick={() => router.push("/login")}
                className="rounded-xl border border-[#404036] bg-[#1F1F1B] px-5 py-3 font-semibold text-[#F4F1E8] hover:bg-[#282821]"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="border-t"
        style={{
          borderColor: styles.border,
          background: dark ? "#11110F" : "#F1EEE6",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="font-semibold">EduMind</p>
            <p
              className="mt-1 text-xs"
              style={{ color: styles.subtle }}
            >
              AI-Powered Education Management Portal
            </p>
          </div>

          <div
            className="text-xs"
            style={{ color: styles.subtle }}
          >
            Buildathon 2026
          </div>
        </div>
      </footer>
    </main>
  );
}