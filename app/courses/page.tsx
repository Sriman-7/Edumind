"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number | null;
  department: string | null;
  semester: number | null;

  teacher: {
    name: string;
    teacherProfile: {
      department: string | null;
    } | null;
  } | null;

  _count: {
    enrollments: number;
    assignments: number;
    exams: number;
  };
};

type CoursesResponse = {
  success: boolean;
  courses: Course[];
  filters: {
    departments: string[];
    semesters: number[];
  };
  total: number;
};

export default function CoursesPage() {
  const router = useRouter();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [semester, setSemester] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("edumind-public-theme");

    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("edumind-public-theme", theme);
  }, [theme]);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (department !== "all") {
        params.set("department", department);
      }

      if (semester !== "all") {
        params.set("semester", semester);
      }

      const response = await fetch(`/api/courses?${params.toString()}`, {
        cache: "no-store",
      });

      const data: CoursesResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load courses");
      }

      setCourses(data.courses);
      setDepartments(data.filters.departments);
      setSemesters(data.filters.semesters);
    } catch (err) {
      console.error("Courses loading error:", err);
      setError("Unable to load courses right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCourses();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, department, semester]);

  const featuredCourses = useMemo(() => {
    return courses.slice(0, 4);
  }, [courses]);

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
    hero: dark
      ? "linear-gradient(135deg,#161612 0%,#0F100E 60%,#2A2418 100%)"
      : "linear-gradient(135deg,#FFFDFC 0%,#F7F2E8 60%,#F1E5CC 100%)",
  };

  return (
    <main
      className="min-h-screen transition-colors duration-300"
      style={{
        background: styles.bg,
        color: styles.text,
      }}
    >
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
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
              <p className="font-semibold">EduMind</p>
              <p
                className="text-xs"
                style={{ color: styles.subtle }}
              >
                Intelligent education platform
              </p>
            </div>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            <button
              onClick={() => router.push("/")}
              style={{ color: styles.muted }}
              className="text-sm"
            >
              Home
            </button>

            <button
              style={{ color: styles.primary }}
              className="text-sm font-semibold"
            >
              Courses
            </button>

            <button
              onClick={() => router.push("/contact")}
              style={{ color: styles.muted }}
              className="text-sm"
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setTheme((current) =>
                  current === "dark" ? "light" : "dark"
                )
              }
              className="flex h-10 items-center gap-2 rounded-xl border px-3 text-xs"
              style={{
                borderColor: styles.border,
                background: styles.surface,
                color: styles.muted,
              }}
            >
              {dark ? "☀ Light" : "☾ Dark"}
            </button>

            <button
              onClick={() => router.push("/login")}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{
                background: dark ? "#B9914F" : "#9A6C27",
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
        <div
          className="rounded-[30px] border p-7 sm:p-10"
          style={{
            background: styles.hero,
            borderColor: styles.border,
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: styles.primary }}
          >
            Course Catalog
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Find your next course.
          </h1>

          <p
            className="mt-4 max-w-2xl text-sm leading-7"
            style={{ color: styles.muted }}
          >
            Search, filter and explore the academic courses
            available through EduMind.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <div
          className="rounded-3xl border p-5"
          style={{
            background: styles.surface,
            borderColor: styles.border,
          }}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
            <div>
              <label
                className="mb-2 block text-xs font-semibold"
                style={{ color: styles.subtle }}
              >
                Search courses
              </label>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by course name or code..."
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={{
                  borderColor: styles.border,
                  background: styles.surface2,
                  color: styles.text,
                }}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-semibold"
                style={{ color: styles.subtle }}
              >
                Department
              </label>

              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={{
                  borderColor: styles.border,
                  background: styles.surface2,
                  color: styles.text,
                }}
              >
                <option value="all">All departments</option>

                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-semibold"
                style={{ color: styles.subtle }}
              >
                Semester
              </label>

              <select
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={{
                  borderColor: styles.border,
                  background: styles.surface2,
                  color: styles.text,
                }}
              >
                <option value="all">All semesters</option>

                {semesters.map((item) => (
                  <option key={item} value={item}>
                    Semester {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: styles.primary }}
            >
              Available courses
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Course listing
            </h2>
          </div>

          <p
            className="text-sm"
            style={{ color: styles.subtle }}
          >
            {courses.length} results
          </p>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border"
                style={{
                  borderColor: styles.border,
                  background: styles.surface,
                }}
              />
            ))}
          </div>
        ) : error ? (
          <div
            className="mt-8 rounded-2xl border p-8 text-center"
            style={{
              borderColor: styles.border,
              background: styles.surface,
            }}
          >
            <p className="font-semibold">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div
            className="mt-8 rounded-2xl border p-12 text-center"
            style={{
              borderColor: styles.border,
              background: styles.surface,
            }}
          >
            <p className="text-3xl">⌕</p>

            <p className="mt-3 font-semibold">
              No courses found
            </p>

            <p
              className="mt-1 text-sm"
              style={{ color: styles.subtle }}
            >
              Try another search or filter.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="group flex flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-1"
                style={{
                  borderColor: styles.border,
                  background: styles.surface,
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
                    className="rounded-full px-3 py-1 text-[10px]"
                    style={{
                      background: dark ? "#24241E" : "#F1EEE6",
                      color: styles.subtle,
                    }}
                  >
                    {course.credits ?? "-"} credits
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  {course.name}
                </h3>

                <p
                  className="mt-3 line-clamp-3 text-sm leading-6"
                  style={{ color: styles.muted }}
                >
                  {course.description ??
                    "Explore this course and discover its academic structure."}
                </p>

                <div className="mt-6 space-y-2 text-xs">
                  <p style={{ color: styles.subtle }}>
                    Department:{" "}
                    <span style={{ color: styles.text }}>
                      {course.department ?? "-"}
                    </span>
                  </p>

                  <p style={{ color: styles.subtle }}>
                    Semester:{" "}
                    <span style={{ color: styles.text }}>
                      {course.semester ?? "-"}
                    </span>
                  </p>

                  <p style={{ color: styles.subtle }}>
                    Teacher:{" "}
                    <span style={{ color: styles.text }}>
                      {course.teacher?.name ?? "Not assigned"}
                    </span>
                  </p>
                </div>

                <div
                  className="mt-6 flex items-center justify-between border-t pt-4"
                  style={{ borderColor: styles.border }}
                >
                  <div
                    className="text-xs"
                    style={{ color: styles.subtle }}
                  >
                    {course._count.enrollments} enrolled
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/courses/${course.id}`)
                    }
                    className="text-sm font-semibold"
                    style={{ color: styles.primary }}
                  >
                    View details →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {featuredCourses.length > 0 && (
        <section
          className="border-y"
          style={{
            borderColor: styles.border,
            background: styles.surface,
          }}
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: styles.primary }}
            >
              Featured selection
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Popular courses
            </h2>

            <div className="mt-6 flex flex-wrap gap-3">
              {featuredCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() =>
                    router.push(`/courses/${course.id}`)
                  }
                  className="rounded-full border px-4 py-2 text-sm transition"
                  style={{
                    borderColor: styles.border,
                    background: styles.surface2,
                    color: styles.text,
                  }}
                >
                  {course.code} · {course.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

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

          <button
            onClick={() => router.push("/")}
            className="text-xs font-medium"
            style={{ color: styles.primary }}
          >
            ← Back to home
          </button>
        </div>
      </footer>
    </main>
  );
}