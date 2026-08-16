"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type CourseData = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number | null;
  department: string | null;
  semester: number | null;
  schedule: string | null;
  syllabus: string | null;

  teacher: {
    name: string;
    teacherProfile: {
      department: string | null;
    } | null;
  } | null;

  assignments: {
    id: string;
    title: string;
    dueDate: string;
    maxMarks: number;
  }[];

  exams: {
    id: string;
    title: string;
    examDate: string;
    totalMarks: number;
    duration: number | null;
  }[];
};

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const courseId = String(params.id);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");

  const [theme, setTheme] = useState<"light" | "dark">(
    "light"
  );

  useEffect(() => {
    const savedTheme =
      window.localStorage.getItem("edumind-public-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "edumind-public-theme",
      theme
    );
  }, [theme]);

  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await fetch(
          `/api/courses/${courseId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setMessage(
            data.message || "Course not found"
          );
          return;
        }

        setCourse(data.course);
      } catch (error) {
        console.error(
          "Course details error:",
          error
        );

        setMessage(
          "Unable to load course details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

async function handleEnroll() {
  try {
    setEnrolling(true);
    setMessage("");

    const response = await fetch(
      `/api/courses/${courseId}/enroll`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      setMessage("Please sign in as a student to enroll.");
      return;
    }

    if (!response.ok || !data.success) {
      setMessage(
        data.message || "Unable to enroll in this course."
      );
      return;
    }

    setMessage(data.message);
  } catch (error) {
    console.error("Enrollment error:", error);

    setMessage(
      "Unable to connect to the enrollment service."
    );
  } finally {
    setEnrolling(false);
  }
}

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
    success: dark ? "#8FB09A" : "#447357",
    hero: dark
      ? "linear-gradient(135deg,#161612 0%,#0F100E 58%,#2A2418 100%)"
      : "linear-gradient(135deg,#FFFDFC 0%,#F7F2E8 58%,#F1E5CC 100%)",
  };

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        style={{
          background: styles.bg,
          color: styles.text,
        }}
      >
        <div
          className="rounded-3xl border p-8 text-center"
          style={{
            background: styles.surface,
            borderColor: styles.border,
          }}
        >
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{
              background: `${styles.primary}18`,
              color: styles.primary,
            }}
          >
            ✦
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Loading course...
          </h1>

          <p
            className="mt-2 text-sm"
            style={{ color: styles.subtle }}
          >
            Preparing course information
          </p>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6"
        style={{
          background: styles.bg,
          color: styles.text,
        }}
      >
        <div
          className="max-w-md rounded-3xl border p-8 text-center"
          style={{
            background: styles.surface,
            borderColor: styles.border,
          }}
        >
          <p className="text-3xl">⌕</p>

          <h1 className="mt-3 text-xl font-semibold">
            Course not found
          </h1>

          <p
            className="mt-2 text-sm"
            style={{ color: styles.muted }}
          >
            {message ||
              "We could not find the requested course."}
          </p>

          <button
            onClick={() => router.push("/courses")}
            className="mt-6 rounded-xl px-5 py-3 text-sm font-semibold text-white"
            style={{
              background: styles.primary,
            }}
          >
            Back to Courses
          </button>
        </div>
      </main>
    );
  }

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
              <p className="font-semibold">
                EduMind
              </p>

              <p
                className="text-xs"
                style={{ color: styles.subtle }}
              >
                Intelligent education platform
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setTheme((current) =>
                  current === "dark"
                    ? "light"
                    : "dark"
                )
              }
              className="rounded-xl border px-3 py-2 text-xs"
              style={{
                borderColor: styles.border,
                background: styles.surface,
                color: styles.muted,
              }}
            >
              {dark
                ? "☀ Light"
                : "☾ Dark"}
            </button>

            <button
              onClick={() =>
                router.push("/courses")
              }
              className="hidden rounded-xl border px-4 py-2 text-sm font-medium sm:block"
              style={{
                borderColor: styles.border,
                background: styles.surface,
                color: styles.text,
              }}
            >
              Courses
            </button>

            <button
              onClick={() =>
                router.push("/login")
              }
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{
                background: styles.primary,
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

        {/* BACK */}
        <button
          onClick={() => router.push("/courses")}
          className="mb-6 text-sm font-medium"
          style={{
            color: styles.primary,
          }}
        >
          ← Back to Courses
        </button>

        {/* HERO */}
        <section
          className="rounded-[30px] border p-7 shadow-lg sm:p-10"
          style={{
            background: styles.hero,
            borderColor: styles.border,
          }}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: `${styles.primary}18`,
                    color: styles.primary,
                  }}
                >
                  {course.code}
                </span>

                <span
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{
                    borderColor: styles.border,
                    color: styles.muted,
                  }}
                >
                  {course.credits ?? "-"} credits
                </span>

                <span
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{
                    borderColor: styles.border,
                    color: styles.muted,
                  }}
                >
                  Semester {course.semester ?? "-"}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                {course.name}
              </h1>

              <p
                className="mt-4 max-w-3xl text-sm leading-7"
                style={{
                  color: styles.muted,
                }}
              >
                {course.description ||
                  "Course information and academic resources."}
              </p>
            </div>

            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                background: styles.primary,
              }}
            >
              {enrolling
                ? "Enrolling..."
                : "Enroll Now"}
            </button>
          </div>

          {message && (
            <div
              className="mt-6 rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor:
                  message.includes("successfully")
                    ? `${styles.success}55`
                    : styles.border,
                background:
                  message.includes("successfully")
                    ? `${styles.success}12`
                    : styles.surface,
                color:
                  message.includes("successfully")
                    ? styles.success
                    : styles.muted,
              }}
            >
              {message}
            </div>
          )}
        </section>

        {/* COURSE INFORMATION */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* COURSE INFO */}
          <div
            className="rounded-3xl border p-6"
            style={{
              background: styles.surface,
              borderColor: styles.border,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: styles.primary }}
            >
              Course information
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <p
                  className="text-xs"
                  style={{ color: styles.subtle }}
                >
                  Department
                </p>

                <p className="mt-1 font-medium">
                  {course.department ?? "-"}
                </p>
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: styles.subtle }}
                >
                  Semester
                </p>

                <p className="mt-1 font-medium">
                  {course.semester ?? "-"}
                </p>
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: styles.subtle }}
                >
                  Credits
                </p>

                <p className="mt-1 font-medium">
                  {course.credits ?? "-"}
                </p>
              </div>
            </div>
          </div>

          {/* TEACHER */}
          <div
            className="rounded-3xl border p-6"
            style={{
              background: styles.surface,
              borderColor: styles.border,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: styles.primary }}
            >
              Teacher information
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full font-semibold"
                style={{
                  background: `${styles.primary}20`,
                  color: styles.primary,
                }}
              >
                {course.teacher?.name
                  ?.split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "T"}
              </div>

              <div>
                <p className="font-semibold">
                  {course.teacher?.name ??
                    "Not assigned"}
                </p>

                <p
                  className="text-xs"
                  style={{ color: styles.subtle }}
                >
                  {course.teacher?.teacherProfile
                    ?.department ||
                    course.department ||
                    "Academic Faculty"}
                </p>
              </div>
            </div>
          </div>

          {/* SCHEDULE */}
          <div
            className="rounded-3xl border p-6"
            style={{
              background: styles.surface,
              borderColor: styles.border,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: styles.primary }}
            >
              Schedule
            </p>

            <div className="mt-6">
              <p className="text-xl font-semibold">
                {course.schedule || "Schedule not available"}
              </p>

              <p
                className="mt-2 text-sm leading-6"
                style={{
                  color: styles.muted,
                }}
              >
                Course timetable and weekly academic schedule.
              </p>
            </div>
          </div>
        </section>

        {/* SYLLABUS */}
        <section
          className="mt-6 rounded-3xl border p-6 sm:p-8"
          style={{
            background: styles.surface,
            borderColor: styles.border,
          }}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: styles.primary }}
            >
              Syllabus
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Course syllabus
            </h2>

            <div
              className="mt-5 rounded-2xl border p-5"
              style={{
                borderColor: styles.border,
                background: styles.surface2,
              }}
            >
              <p className="text-sm leading-7">
                {course.syllabus ||
                  "Syllabus information is not available yet."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Assignments",
                count: course.assignments.length,
                description:
                  "Course assignments and submission deadlines.",
              },
              {
                title: "Examinations",
                count: course.exams.length,
                description:
                  "Scheduled examinations and assessment details.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border p-5"
                style={{
                  borderColor: styles.border,
                  background: styles.surface2,
                }}
              >
                <p className="text-lg font-semibold">
                  {item.title}
                </p>

                <p
                  className="mt-2 text-sm"
                  style={{
                    color: styles.muted,
                  }}
                >
                  {item.description}
                </p>

                <p
                  className="mt-5 text-2xl font-bold"
                  style={{
                    color: styles.primary,
                  }}
                >
                  {item.count}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ASSIGNMENTS */}
        <section
          className="mt-6 rounded-3xl border p-6"
          style={{
            background: styles.surface,
            borderColor: styles.border,
          }}
        >
          <div className="flex items-end justify-between">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: styles.primary }}
              >
                Academic activity
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Assignments
              </h2>
            </div>

            <span
              className="text-sm"
              style={{ color: styles.subtle }}
            >
              {course.assignments.length} total
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {course.assignments.length === 0 ? (
              <div
                className="rounded-2xl border border-dashed p-6 text-center"
                style={{
                  borderColor: styles.border,
                }}
              >
                No assignments available.
              </div>
            ) : (
              course.assignments.map(
                (assignment) => (
                  <div
                    key={assignment.id}
                    className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    style={{
                      borderColor: styles.border,
                      background: styles.surface2,
                    }}
                  >
                    <div>
                      <p className="font-medium">
                        {assignment.title}
                      </p>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: styles.subtle,
                        }}
                      >
                        Due{" "}
                        {new Date(
                          assignment.dueDate
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <span
                      className="text-sm"
                      style={{
                        color: styles.muted,
                      }}
                    >
                      Max marks:{" "}
                      {assignment.maxMarks}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </section>

        {/* EXAMS */}
        <section
          className="mt-6 rounded-3xl border p-6"
          style={{
            background: styles.surface,
            borderColor: styles.border,
          }}
        >
          <div className="flex items-end justify-between">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: styles.primary }}
              >
                Assessments
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Examinations
              </h2>
            </div>

            <span
              className="text-sm"
              style={{ color: styles.subtle }}
            >
              {course.exams.length} scheduled
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {course.exams.length === 0 ? (
              <div
                className="rounded-2xl border border-dashed p-6 text-center"
                style={{
                  borderColor: styles.border,
                }}
              >
                No examinations scheduled.
              </div>
            ) : (
              course.exams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    borderColor: styles.border,
                    background: styles.surface2,
                  }}
                >
                  <div>
                    <p className="font-medium">
                      {exam.title}
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: styles.subtle,
                      }}
                    >
                      {new Date(
                        exam.examDate
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div
                    className="text-sm"
                    style={{
                      color: styles.muted,
                    }}
                  >
                    {exam.totalMarks} marks
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className="mt-10 flex flex-col gap-3 border-t py-8 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: styles.border,
          }}
        >
          <div>
            <p className="font-semibold">
              EduMind
            </p>

            <p
              className="mt-1 text-xs"
              style={{
                color: styles.subtle,
              }}
            >
              AI-Powered Education Management Portal
            </p>
          </div>

          <button
            onClick={() => router.push("/courses")}
            className="text-xs font-medium"
            style={{
              color: styles.primary,
            }}
          >
            ← Back to Courses
          </button>
        </footer>
      </div>
    </main>
  );
}