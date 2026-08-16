"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Submission = {
  id: string;
  studentId: string;
  submittedAt: string | null;
  content: string | null;
  fileUrl: string | null;
  marks: number | null;
  feedback: string | null;
  status: string;

  student: {
    id: string;
    rollNumber: string;
    department: string | null;
    semester: number | null;

    user: {
      name: string;
      email: string;
    };
  };
};

type AssignmentData = {
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

  submissions: Submission[];
};

export default function TeacherAssignmentPage() {
  const router = useRouter();
  const params = useParams();

  const assignmentId = String(params.id);

  const [assignment, setAssignment] =
    useState<AssignmentData | null>(null);

  const [marks, setMarks] = useState<Record<string, string>>({});
  const [feedback, setFeedback] =
    useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAssignment() {
    try {
      setLoading(true);
      setError("");

      const authResponse = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      const authData = await authResponse.json();

      if (
        !authResponse.ok ||
        !authData.success ||
        authData.user?.role !== "TEACHER"
      ) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `/api/teacher/assignments/${encodeURIComponent(
          assignmentId
        )}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load assignment."
        );
      }

      setAssignment(data.assignment);

      const marksState: Record<string, string> = {};
      const feedbackState: Record<string, string> = {};

      for (const submission of data.assignment.submissions) {
        marksState[submission.id] =
          submission.marks !== null
            ? String(submission.marks)
            : "";

        feedbackState[submission.id] =
          submission.feedback || "";
      }

      setMarks(marksState);
      setFeedback(feedbackState);
    } catch (err) {
      console.error("Teacher assignment error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load assignment."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!assignmentId || assignmentId === "undefined") {
      setError("Invalid assignment ID.");
      setLoading(false);
      return;
    }

    void loadAssignment();
  }, [assignmentId]);

  async function handleGrade(submission: Submission) {
    const markValue = marks[submission.id] ?? "";

    const numericMarks = Number(markValue);

    if (!Number.isFinite(numericMarks)) {
      setMessage("Enter a valid mark.");
      return;
    }

    if (
      numericMarks < 0 ||
      numericMarks > (assignment?.maxMarks ?? 100)
    ) {
      setMessage(
        `Marks must be between 0 and ${
          assignment?.maxMarks ?? 100
        }.`
      );
      return;
    }

    try {
      setGradingId(submission.id);
      setMessage("");

      const response = await fetch(
        `/api/teacher/assignments/${encodeURIComponent(
          assignmentId
        )}/grade`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            submissionId: submission.id,
            marks: numericMarks,
            feedback:
              feedback[submission.id]?.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to grade submission."
        );
      }

      setMessage(
        `Grade saved for ${submission.student.user.name}.`
      );

      await loadAssignment();
    } catch (err) {
      console.error("Grading error:", err);

      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to grade submission."
      );
    } finally {
      setGradingId("");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EA] px-6 text-[#1E1D19]">
        <div className="text-center">
          <div className="text-2xl font-semibold">
            Loading assignment...
          </div>

          <p className="mt-2 text-sm text-[#7A7469]">
            Preparing the grading workspace
          </p>
        </div>
      </main>
    );
  }

  if (!assignment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EA] px-6">
        <div className="rounded-3xl border border-[#E7E1D6] bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">
            Unable to load assignment
          </h1>

          <p className="mt-2 text-sm text-[#7A7469]">
            {error || "Assignment not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/teacher/dashboard")
            }
            className="mt-6 rounded-xl bg-[#9A6C27] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </button>
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A6C27]">
            Assignment review
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {assignment.title}
          </h1>

          <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#7A7469]">
            <span>{assignment.course.code}</span>
            <span>•</span>
            <span>{assignment.course.name}</span>
            <span>•</span>
            <span>Max {assignment.maxMarks} marks</span>
          </div>

          {assignment.description && (
            <p className="mt-6 max-w-3xl text-sm leading-7 text-[#5F5A50]">
              {assignment.description}
            </p>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#F8F6F0] p-5">
              <p className="text-xs text-[#7A7469]">
                Submissions
              </p>

              <p className="mt-1 text-2xl font-bold text-[#9A6C27]">
                {assignment.submissions.length}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8F6F0] p-5">
              <p className="text-xs text-[#7A7469]">
                Graded
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {
                  assignment.submissions.filter(
                    (submission) =>
                      submission.status === "GRADED"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8F6F0] p-5">
              <p className="text-xs text-[#7A7469]">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-600">
                {
                  assignment.submissions.filter(
                    (submission) =>
                      submission.status !== "GRADED"
                  ).length
                }
              </p>
            </div>
          </div>
        </section>

        {message && (
          <div className="mt-5 rounded-2xl border border-[#E7E1D6] bg-white px-5 py-4 text-sm">
            {message}
          </div>
        )}

        <section className="mt-6 space-y-5">
          {assignment.submissions.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#D9D2C5] bg-white p-12 text-center">
              <p className="text-xl font-semibold">
                No submissions yet
              </p>

              <p className="mt-2 text-sm text-[#7A7469]">
                Students have not submitted this assignment.
              </p>
            </div>
          ) : (
            assignment.submissions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-[28px] border border-[#E7E1D6] bg-white p-6 shadow-xl shadow-black/5 sm:p-8"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#9A6C2715] px-3 py-1 text-xs font-semibold text-[#9A6C27]">
                        {submission.student.rollNumber}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          submission.status === "GRADED"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-semibold">
                      {submission.student.user.name}
                    </h2>

                    <p className="mt-1 text-sm text-[#7A7469]">
                      {submission.student.user.email}
                    </p>
                  </div>

                  <div className="text-sm text-[#7A7469]">
                    {submission.submittedAt
                      ? `Submitted ${new Date(
                          submission.submittedAt
                        ).toLocaleString("en-IN")}`
                      : "Not submitted"}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[#F8F6F0] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A7469]">
                    Student submission
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                    {submission.content ||
                      "No written content submitted."}
                  </p>

                  {submission.fileUrl && (
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-sm font-semibold text-[#9A6C27] underline"
                    >
                      Open submitted file →
                    </a>
                  )}
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[180px_1fr]">
                  <div>
                    <label className="block text-sm font-medium">
                      Marks
                    </label>

                    <input
                      type="number"
                      min={0}
                      max={assignment.maxMarks}
                      value={marks[submission.id] ?? ""}
                      onChange={(event) =>
                        setMarks((current) => ({
                          ...current,
                          [submission.id]:
                            event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-[#E7E1D6] bg-[#F8F6F0] px-4 py-3 text-sm outline-none focus:border-[#9A6C27]"
                      placeholder={`0-${assignment.maxMarks}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Feedback
                    </label>

                    <textarea
                      rows={4}
                      value={feedback[submission.id] ?? ""}
                      onChange={(event) =>
                        setFeedback((current) => ({
                          ...current,
                          [submission.id]:
                            event.target.value,
                        }))
                      }
                      className="mt-2 w-full resize-none rounded-xl border border-[#E7E1D6] bg-[#F8F6F0] px-4 py-3 text-sm outline-none focus:border-[#9A6C27]"
                      placeholder="Write feedback for the student..."
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={gradingId === submission.id}
                  onClick={() =>
                    handleGrade(submission)
                  }
                  className="mt-5 rounded-xl bg-[#9A6C27] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#845A20] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {gradingId === submission.id
                    ? "Saving..."
                    : submission.status === "GRADED"
                      ? "Update Grade"
                      : "Save Grade"}
                </button>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}