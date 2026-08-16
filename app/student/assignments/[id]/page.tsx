"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  submission: {
    id: string;
    status: string;
    content: string | null;
    fileUrl: string | null;
    submittedAt: string | null;
    marks: number | null;
    feedback: string | null;
  } | null;
};

export default function AssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = String(params.id);

  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
        authData.user?.role !== "STUDENT"
      ) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `/api/student/assignments/${encodeURIComponent(assignmentId)}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load assignment.");
      }

      setAssignment(data.assignment);

      if (data.assignment.submission) {
        setContent(data.assignment.submission.content || "");
        setFileUrl(data.assignment.submission.fileUrl || "");
      }
    } catch (error) {
      console.error("Assignment load error:", error);
      setError(
        error instanceof Error
          ? error.message
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim() && !fileUrl.trim()) {
      setMessage("Enter submission content or provide a file URL.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await fetch(
        `/api/student/assignments/${encodeURIComponent(assignmentId)}/submit`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content.trim() || undefined,
            fileUrl: fileUrl.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok || !data.success) {
        setMessage(data.message || "Unable to submit assignment.");
        return;
      }

      setMessage(data.message || "Assignment submitted successfully.");
      await loadAssignment();
    } catch (error) {
      console.error("Assignment submission error:", error);
      setMessage("Unable to connect to the submission service.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EA] px-6 text-[#1E1D19]">
        <div className="w-full max-w-md rounded-3xl border border-[#E7E1D6] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9A6C2715] text-2xl text-[#9A6C27]">
            ✦
          </div>
          <h1 className="mt-5 text-xl font-semibold">
            Loading assignment...
          </h1>
          <p className="mt-2 text-sm text-[#7A7469]">
            Preparing your submission workspace
          </p>
        </div>
      </main>
    );
  }

  if (!assignment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EA] px-6 text-[#1E1D19]">
        <div className="max-w-md rounded-3xl border border-[#E7E1D6] bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-semibold">
            Unable to load assignment
          </h1>
          <p className="mt-2 text-sm text-[#7A7469]">
            {error || "Assignment not found."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/student/dashboard")}
            className="mt-6 rounded-xl bg-[#9A6C27] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const isPastDue = Date.now() > dueDate.getTime();
  const submission = assignment.submission;

  return (
    <main className="min-h-screen bg-[#F5F2EA] text-[#1E1D19]">
      <header className="sticky top-0 z-20 border-b border-[#E7E1D6] bg-[#FBF9F3]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 sm:px-8">
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
              <p className="text-xs text-[#7A7469]">Student Portal</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push("/student/dashboard")}
            className="rounded-xl border border-[#E7E1D6] bg-white px-4 py-2 text-sm font-medium"
          >
            Dashboard
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <button
          type="button"
          onClick={() => router.push("/student/dashboard")}
          className="mb-6 text-sm font-semibold text-[#9A6C27]"
        >
          ← Back to Dashboard
        </button>

        <section className="rounded-[28px] border border-[#E7E1D6] bg-white p-7 shadow-xl shadow-black/5 sm:p-10">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#9A6C2715] px-3 py-1 text-xs font-semibold text-[#9A6C27]">
              {assignment.course.code}
            </span>
            <span className="rounded-full border border-[#E7E1D6] px-3 py-1 text-xs">
              Max marks: {assignment.maxMarks}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isPastDue
                  ? "bg-red-500/10 text-red-600"
                  : "bg-emerald-500/10 text-emerald-600"
              }`}
            >
              {isPastDue ? "Past deadline" : "Active deadline"}
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            {assignment.title}
          </h1>

          <p className="mt-2 text-sm text-[#7A7469]">
            {assignment.course.name}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E7E1D6] bg-[#F8F6F0] p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#7A7469]">
                Due date
              </p>
              <p className="mt-2 font-semibold">
                {dueDate.toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7E1D6] bg-[#F8F6F0] p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#7A7469]">
                Current status
              </p>
              <p className="mt-2 font-semibold">
                {submission?.status?.replace("_", " ") || "NOT SUBMITTED"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A6C27]">
              Instructions
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5F5A50]">
              {assignment.description ||
                "No additional instructions were provided."}
            </p>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-[28px] border border-[#E7E1D6] bg-white p-7 shadow-xl shadow-black/5 sm:p-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A6C27]">
            Submission
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Submit your assignment
          </h2>

          <label className="mt-8 block text-sm font-medium">
            Submission content
          </label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={10}
            placeholder="Write your assignment response here..."
            className="mt-2 w-full rounded-2xl border border-[#E7E1D6] bg-[#F8F6F0] px-4 py-4 text-sm outline-none focus:border-[#9A6C27]"
          />

          <label className="mt-6 block text-sm font-medium">
            File URL
          </label>
          <input
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
            placeholder="https://..."
            className="mt-2 w-full rounded-2xl border border-[#E7E1D6] bg-[#F8F6F0] px-4 py-3 text-sm outline-none focus:border-[#9A6C27]"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-xl bg-[#9A6C27] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#845A20] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Submitting..."
              : submission
                ? "Update Submission"
                : "Submit Assignment"}
          </button>

          {message && (
            <div className="mt-5 rounded-2xl border border-[#E7E1D6] bg-[#F8F6F0] px-4 py-3 text-sm text-[#5F5A50]">
              {message}
            </div>
          )}
        </form>

        {submission &&
          (submission.marks !== null || submission.feedback) && (
            <section className="mt-6 rounded-[28px] border border-[#E7E1D6] bg-white p-7 shadow-xl shadow-black/5 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A6C27]">
                Evaluation
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Teacher feedback
              </h2>

              {submission.marks !== null && (
                <div className="mt-6 rounded-2xl bg-[#F8F6F0] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7A7469]">
                    Marks
                  </p>
                  <p className="mt-2 text-3xl font-bold text-[#9A6C27]">
                    {submission.marks}/{assignment.maxMarks}
                  </p>
                </div>
              )}

              {submission.feedback && (
                <div className="mt-4 rounded-2xl bg-[#F8F6F0] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7A7469]">
                    Feedback
                  </p>
                  <p className="mt-2 text-sm leading-7">
                    {submission.feedback}
                  </p>
                </div>
              )}
            </section>
          )}
      </div>
    </main>
  );
}