"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

type Student = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  studentProfile: {
    rollNumber: string;
    department: string | null;
    semester: number | null;
  } | null;
};

type Teacher = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  teacherProfile: {
    employeeId: string;
    department: string | null;
  } | null;
};

type Course = {
  id: string;
  code: string;
  name: string;
  department: string | null;
  semester: number | null;
  credits: number | null;
  teacher: {
    name: string;
  } | null;
  _count: {
    enrollments: number;
    assignments: number;
    exams: number;
  };
};

type AcademicClass = {
  id: string;
  name: string;
  section: string | null;
  room: string | null;
  schedule: string | null;
  course: {
    code: string;
    name: string;
  };
  teacher: {
    name: string;
  } | null;
};

type Assignment = {
  id: string;
  title: string;
  dueDate: string;
  maxMarks: number;
  course: {
    code: string;
    name: string;
  };
  _count: {
    submissions: number;
  };
};

type Exam = {
  id: string;
  title: string;
  examDate: string;
  duration: number | null;
  totalMarks: number;
  course: {
    code: string;
    name: string;
  };
};

type Grade = {
  id: string;
  score: number;
  grade: string | null;
  semester: number | null;
  student: {
    rollNumber: string;
    user: {
      name: string;
    };
  };
  course: {
    code: string;
    name: string;
  };
};

type ManagementResponse = {
  success: boolean;
  message?: string;
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  classes: AcademicClass[];
  assignments: Assignment[];
  exams: Exam[];
  grades: Grade[];
};

const statusOptions: UserStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
];

export default function AdminManagementPage() {
  const router = useRouter();

  const [data, setData] =
    useState<ManagementResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] =
    useState("students");

  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseDepartment, setCourseDepartment] =
    useState("CSE");
  const [courseSemester, setCourseSemester] =
    useState("1");
  const [courseCredits, setCourseCredits] =
    useState("4");
  const [courseDescription, setCourseDescription] =
    useState("");

  async function loadManagementData() {
    try {
      setLoading(true);

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

      const response = await fetch(
        "/api/admin/management",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const result: ManagementResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load management data."
        );
      }

      setData(result);
    } catch (error) {
      console.error("Admin management error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load management data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadManagementData();
  }, []);

  async function updateUserStatus(
    userId: string,
    status: UserStatus
  ) {
    try {
      setMessage("");

      const response = await fetch(
        "/api/admin/management",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to update user status."
        );
      }

      setMessage(result.message);

      await loadManagementData();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update user."
      );
    }
  }

  async function createCourse(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setMessage("");

      const response = await fetch(
        "/api/admin/management",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: courseCode.trim(),
            name: courseName.trim(),
            description:
              courseDescription.trim() || undefined,
            department:
              courseDepartment.trim() || undefined,
            semester:
              Number(courseSemester) || undefined,
            credits:
              Number(courseCredits) || undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to create course."
        );
      }

      setMessage(result.message);

      setCourseCode("");
      setCourseName("");
      setCourseDescription("");

      await loadManagementData();

      setActiveSection("courses");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create course."
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EA] text-[#1E1D19]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9A6C2715] text-2xl text-[#9A6C27]">
            ⚙
          </div>

          <h1 className="mt-5 text-2xl font-semibold">
            Loading management center...
          </h1>

          <p className="mt-2 text-sm text-[#7A7469]">
            Preparing administrator controls
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EA] px-6">
        <div className="rounded-3xl border border-[#E7E1D6] bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-semibold">
            Unable to load management center
          </h1>

          <p className="mt-2 text-sm text-[#7A7469]">
            {message}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-xl bg-[#9A6C27] px-5 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const navItems = [
    ["students", "Students", data.students.length],
    ["teachers", "Teachers", data.teachers.length],
    ["courses", "Courses", data.courses.length],
    ["classes", "Classes", data.classes.length],
    ["assignments", "Assignments", data.assignments.length],
    ["exams", "Examinations", data.exams.length],
    ["grades", "Academic Records", data.grades.length],
  ];

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
              <p className="font-semibold">
                EduMind
              </p>

              <p className="text-xs text-[#7A7469]">
                Administrator Portal
              </p>
            </div>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/reports")
              }
              className="rounded-xl border border-[#E7E1D6] bg-white px-4 py-2 text-sm font-medium"
            >
              Reports
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/admin/dashboard")
              }
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
          onClick={() =>
            router.push("/admin/dashboard")
          }
          className="mb-6 text-sm font-semibold text-[#9A6C27]"
        >
          ← Back to Admin Dashboard
        </button>

        <section className="rounded-[30px] border border-[#E7E1D6] bg-white p-7 shadow-xl shadow-black/5 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A6C27]">
            Administration
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Management Center
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5F5A50]">
            Manage students, teachers, courses, classes,
            assignments, examinations and academic records
            from one place.
          </p>
        </section>

        {message && (
          <div className="mt-5 rounded-2xl border border-[#E7E1D6] bg-white px-5 py-4 text-sm shadow-sm">
            {message}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-[28px] border border-[#E7E1D6] bg-white p-3 shadow-sm">
            <div className="space-y-1">
              {navItems.map(
                ([id, label, count]) => (
                  <button
                    key={String(id)}
                    type="button"
                    onClick={() =>
                      setActiveSection(String(id))
                    }
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                      activeSection === id
                        ? "bg-[#9A6C2712] text-[#9A6C27]"
                        : "text-[#5F5A50] hover:bg-[#F8F6F0]"
                    }`}
                  >
                    <span>{label}</span>

                    <span className="rounded-full bg-[#F1EEE6] px-2 py-1 text-[10px]">
                      {count}
                    </span>
                  </button>
                )
              )}
            </div>
          </aside>

          <section className="rounded-[28px] border border-[#E7E1D6] bg-white p-6 shadow-sm sm:p-8">
            {activeSection === "students" && (
              <>
                <SectionTitle
                  title="Students"
                  subtitle="View student accounts and manage their status."
                />

                <div className="mt-6 space-y-3">
                  {data.students.map((student) => (
                    <UserRow
                      key={student.id}
                      name={student.name}
                      email={student.email}
                      roleInfo={
                        student.studentProfile
                          ? `${student.studentProfile.rollNumber} · ${
                              student.studentProfile.department ||
                              "CSE"
                            } · Semester ${
                              student.studentProfile.semester ??
                              "-"
                            }`
                          : "Student profile"
                      }
                      status={student.status}
                      onStatusChange={(status) =>
                        updateUserStatus(
                          student.id,
                          status
                        )
                      }
                    />
                  ))}
                </div>
              </>
            )}

            {activeSection === "teachers" && (
              <>
                <SectionTitle
                  title="Teachers"
                  subtitle="View teacher accounts and manage their status."
                />

                <div className="mt-6 space-y-3">
                  {data.teachers.map((teacher) => (
                    <UserRow
                      key={teacher.id}
                      name={teacher.name}
                      email={teacher.email}
                      roleInfo={
                        teacher.teacherProfile
                          ? `${teacher.teacherProfile.employeeId} · ${
                              teacher.teacherProfile.department ||
                              "Department"
                            }`
                          : "Teacher profile"
                      }
                      status={teacher.status}
                      onStatusChange={(status) =>
                        updateUserStatus(
                          teacher.id,
                          status
                        )
                      }
                    />
                  ))}
                </div>
              </>
            )}

            {activeSection === "courses" && (
              <>
                <SectionTitle
                  title="Courses"
                  subtitle="Review courses and create new academic courses."
                />

                <form
                  onSubmit={createCourse}
                  className="mt-6 rounded-2xl bg-[#F8F6F0] p-5"
                >
                  <p className="font-semibold">
                    Create course
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Input
                      placeholder="Course code e.g. CS405"
                      value={courseCode}
                      onChange={setCourseCode}
                      required
                    />

                    <Input
                      placeholder="Course name"
                      value={courseName}
                      onChange={setCourseName}
                      required
                    />

                    <Input
                      placeholder="Department"
                      value={courseDepartment}
                      onChange={setCourseDepartment}
                    />

                    <Input
                      placeholder="Semester"
                      type="number"
                      value={courseSemester}
                      onChange={setCourseSemester}
                    />

                    <Input
                      placeholder="Credits"
                      type="number"
                      value={courseCredits}
                      onChange={setCourseCredits}
                    />

                    <input
                      value={courseDescription}
                      onChange={(event) =>
                        setCourseDescription(
                          event.target.value
                        )
                      }
                      placeholder="Description"
                      className="rounded-xl border border-[#E7E1D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#9A6C27]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-4 rounded-xl bg-[#9A6C27] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Create Course
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  {data.courses.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-2xl border border-[#E7E1D6] p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#9A6C27]">
                            {course.code}
                          </p>

                          <h3 className="mt-1 font-semibold">
                            {course.name}
                          </h3>

                          <p className="mt-1 text-xs text-[#7A7469]">
                            {course.department || "-"} ·
                            Semester{" "}
                            {course.semester ?? "-"} ·{" "}
                            {course.credits ?? "-"} credits
                          </p>
                        </div>

                        <div className="text-xs text-[#7A7469]">
                          {course._count.enrollments} enrolled
                          ·{" "}
                          {course._count.assignments} assignments
                          ·{" "}
                          {course._count.exams} exams
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === "classes" && (
              <>
                <SectionTitle
                  title="Classes"
                  subtitle="Monitor class sections, rooms and schedules."
                />

                <DataList>
                  {data.classes.map((item) => (
                    <DataCard key={item.id}>
                      <h3 className="font-semibold">
                        {item.course.code} · {item.name}
                      </h3>

                      <p className="mt-2 text-sm text-[#7A7469]">
                        Section {item.section || "-"} · Room{" "}
                        {item.room || "-"} ·{" "}
                        {item.schedule || "No schedule"}
                      </p>

                      <p className="mt-2 text-xs text-[#7A7469]">
                        Teacher:{" "}
                        {item.teacher?.name ||
                          "Not assigned"}
                      </p>
                    </DataCard>
                  ))}
                </DataList>
              </>
            )}

            {activeSection === "assignments" && (
              <>
                <SectionTitle
                  title="Assignments"
                  subtitle="Monitor assignment workload and submissions."
                />

                <DataList>
                  {data.assignments.map((item) => (
                    <DataCard key={item.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">
                            {item.title}
                          </h3>

                          <p className="mt-2 text-xs text-[#7A7469]">
                            {item.course.code} · Due{" "}
                            {new Date(
                              item.dueDate
                            ).toLocaleDateString("en-IN")}
                          </p>
                        </div>

                        <span className="rounded-full bg-[#F1EEE6] px-3 py-1 text-xs">
                          {item._count.submissions} submissions
                        </span>
                      </div>
                    </DataCard>
                  ))}
                </DataList>
              </>
            )}

            {activeSection === "exams" && (
              <>
                <SectionTitle
                  title="Examinations"
                  subtitle="Monitor scheduled academic examinations."
                />

                <DataList>
                  {data.exams.map((item) => (
                    <DataCard key={item.id}>
                      <h3 className="font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs text-[#7A7469]">
                        {item.course.code} ·{" "}
                        {new Date(
                          item.examDate
                        ).toLocaleString("en-IN")}
                      </p>

                      <p className="mt-2 text-xs text-[#7A7469]">
                        Duration:{" "}
                        {item.duration ?? "-"} minutes · Total
                        marks: {item.totalMarks}
                      </p>
                    </DataCard>
                  ))}
                </DataList>
              </>
            )}

            {activeSection === "grades" && (
              <>
                <SectionTitle
                  title="Academic Records"
                  subtitle="Review recent grades and academic performance."
                />

                <DataList>
                  {data.grades.map((item) => (
                    <DataCard key={item.id}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">
                            {item.student.user.name}
                          </h3>

                          <p className="mt-1 text-xs text-[#7A7469]">
                            {item.student.rollNumber} ·{" "}
                            {item.course.code} · Semester{" "}
                            {item.semester ?? "-"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-semibold text-[#9A6C27]">
                            {item.score}
                          </p>

                          <p className="text-xs text-[#7A7469]">
                            Grade {item.grade || "-"}
                          </p>
                        </div>
                      </div>
                    </DataCard>
                  ))}
                </DataList>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A6C27]">
        Administration
      </p>
      <h2 className="mt-2 text-2xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[#7A7469]">
        {subtitle}
      </p>
    </div>
  );
}

function UserRow({
  name,
  email,
  roleInfo,
  status,
  onStatusChange,
}: {
  name: string;
  email: string;
  roleInfo: string;
  status: UserStatus;
  onStatusChange: (status: UserStatus) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#E7E1D6] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold">{name}</p>

          <p className="mt-1 text-sm text-[#7A7469]">
            {email}
          </p>

          <p className="mt-2 text-xs text-[#9A6C27]">
            {roleInfo}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A7469]">
            Status
          </span>

          <select
            value={status}
            onChange={(event) =>
              onStatusChange(
                event.target.value as UserStatus
              )
            }
            className="rounded-xl border border-[#E7E1D6] bg-[#F8F6F0] px-3 py-2 text-xs outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function DataList({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 space-y-3">
      {children}
    </div>
  );
}

function DataCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E7E1D6] p-5">
      {children}
    </div>
  );
}

function Input({
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder={placeholder}
      className="rounded-xl border border-[#E7E1D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#9A6C27]"
    />
  );
}