"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ClassData = {
  id: string;
  name: string;
  section: string | null;
  room: string | null;
  schedule: string | null;
  courseId: string;
  course: {
    code: string;
    name: string;
  };
};

type StudentData = {
  id: string;
  rollNumber: string;
  department: string | null;
  semester: number | null;
  user: {
    name: string;
    email: string;
  };
  attendanceStatus:
    | "PRESENT"
    | "ABSENT"
    | "LATE"
    | "EXCUSED"
    | null;
  attendanceRemarks: string | null;
};

type AttendanceResponse = {
  success: boolean;
  message?: string;
  classes: ClassData[];
  students: StudentData[];
};

const statusOptions = [
  {
    value: "PRESENT",
    label: "Present",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  },
  {
    value: "LATE",
    label: "Late",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  {
    value: "ABSENT",
    label: "Absent",
    className:
      "border-red-500/30 bg-red-500/10 text-red-600",
  },
  {
    value: "EXCUSED",
    label: "Excused",
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-600",
  },
] as const;

export default function TeacherAttendancePage() {
  const router = useRouter();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingStudent, setSavingStudent] = useState("");
  const [message, setMessage] = useState("");

  async function loadClasses() {
    try {
      const response = await fetch("/api/teacher/attendance", {
        credentials: "include",
        cache: "no-store",
      });

      const data: AttendanceResponse =
        await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        router.replace("/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load classes."
        );
      }

      setClasses(data.classes);

      if (data.classes.length > 0) {
        setSelectedClass(data.classes[0].id);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents(classId: string) {
    if (!classId) {
      setStudents([]);
      return;
    }

    try {
      setMessage("");

      const response = await fetch(
        `/api/teacher/attendance?classId=${encodeURIComponent(
          classId
        )}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data: AttendanceResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load students."
        );
      }

      setStudents(data.students);
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load students."
      );
    }
  }

  useEffect(() => {
    void loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      void loadStudents(selectedClass);
    }
  }, [selectedClass]);

  async function markAttendance(
    studentId: string,
    status:
      | "PRESENT"
      | "ABSENT"
      | "LATE"
      | "EXCUSED"
  ) {
    try {
      setSavingStudent(studentId);
      setMessage("");

      const response = await fetch(
        "/api/teacher/attendance",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classId: selectedClass,
            studentId,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save attendance."
        );
      }

      setMessage("Attendance updated successfully.");

      await loadStudents(selectedClass);
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save attendance."
      );
    } finally {
      setSavingStudent("");
    }
  }

  const activeClass = classes.find(
    (item) => item.id === selectedClass
  );

  const presentCount = students.filter(
    (student) => student.attendanceStatus === "PRESENT"
  ).length;

  const lateCount = students.filter(
    (student) => student.attendanceStatus === "LATE"
  ).length;

  const absentCount = students.filter(
    (student) => student.attendanceStatus === "ABSENT"
  ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EA] text-[#1E1D19]">
        <div className="text-center">
          <div className="text-2xl font-semibold">
            Loading attendance...
          </div>
          <p className="mt-2 text-sm text-[#7A7469]">
            Preparing your teaching workspace
          </p>
        </div>
      </main>
    );
  }

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
                Teacher Portal
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/teacher/dashboard")
            }
            className="rounded-xl border border-[#E7E1D6] bg-white px-4 py-2 text-sm font-medium"
          >
            Dashboard
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <button
          type="button"
          onClick={() =>
            router.push("/teacher/dashboard")
          }
          className="mb-6 text-sm font-semibold text-[#9A6C27]"
        >
          ← Back to Dashboard
        </button>

        <section className="rounded-[30px] border border-[#E7E1D6] bg-white p-7 shadow-xl shadow-black/5 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A6C27]">
                Academic activity
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                Attendance
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5F5A50]">
                Record daily attendance for students enrolled
                in your classes.
              </p>
            </div>

            <div className="w-full lg:w-96">
              <label className="mb-2 block text-xs font-semibold text-[#7A7469]">
                Select class
              </label>

              <select
                value={selectedClass}
                onChange={(event) =>
                  setSelectedClass(event.target.value)
                }
                className="w-full rounded-xl border border-[#E7E1D6] bg-[#F8F6F0] px-4 py-3 text-sm outline-none focus:border-[#9A6C27]"
              >
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.course.code} · {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeClass && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#F8F6F0] p-4">
                <p className="text-xs text-[#7A7469]">
                  Course
                </p>
                <p className="mt-1 font-semibold">
                  {activeClass.course.code}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8F6F0] p-4">
                <p className="text-xs text-[#7A7469]">
                  Room
                </p>
                <p className="mt-1 font-semibold">
                  {activeClass.room || "Not assigned"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8F6F0] p-4">
                <p className="text-xs text-[#7A7469]">
                  Schedule
                </p>
                <p className="mt-1 font-semibold">
                  {activeClass.schedule ||
                    "Not scheduled"}
                </p>
              </div>
            </div>
          )}
        </section>

        {message && (
          <div className="mt-5 rounded-2xl border border-[#E7E1D6] bg-white px-5 py-4 text-sm">
            {message}
          </div>
        )}

        <section className="mt-6 rounded-[30px] border border-[#E7E1D6] bg-white p-6 shadow-xl shadow-black/5 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A6C27]">
                Today
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Student attendance
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-center">
                <p className="text-xl font-bold text-emerald-600">
                  {presentCount}
                </p>
                <p className="text-[11px] text-emerald-700">
                  Present
                </p>
              </div>

              <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-center">
                <p className="text-xl font-bold text-amber-600">
                  {lateCount}
                </p>
                <p className="text-[11px] text-amber-700">
                  Late
                </p>
              </div>

              <div className="rounded-xl bg-red-500/10 px-4 py-3 text-center">
                <p className="text-xl font-bold text-red-600">
                  {absentCount}
                </p>
                <p className="text-[11px] text-red-700">
                  Absent
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            {students.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D9D2C5] p-10 text-center">
                <p className="font-medium">
                  No students found
                </p>
                <p className="mt-1 text-sm text-[#7A7469]">
                  No students are enrolled in this class.
                </p>
              </div>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="rounded-2xl border border-[#E7E1D6] bg-[#FAF8F3] p-4"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="font-semibold">
                        {student.user.name}
                      </p>

                      <p className="mt-1 text-xs text-[#7A7469]">
                        {student.rollNumber} ·{" "}
                        {student.user.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((option) => {
                        const active =
                          student.attendanceStatus ===
                          option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            disabled={
                              savingStudent ===
                              student.id
                            }
                            onClick={() =>
                              markAttendance(
                                student.id,
                                option.value
                              )
                            }
                            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                              active
                                ? option.className
                                : "border-[#E7E1D6] bg-white text-[#7A7469] hover:border-[#9A6C27] hover:text-[#9A6C27]"
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {student.attendanceStatus && (
                    <p className="mt-3 text-xs text-[#7A7469]">
                      Current status:{" "}
                      <span className="font-semibold">
                        {student.attendanceStatus}
                      </span>
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}