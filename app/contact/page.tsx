"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sent, setSent] = useState(false);

  const dark = theme === "dark";

  const colors = {
    bg: dark ? "#0B0B0A" : "#F5F2EA",
    surface: dark ? "#141411" : "#FFFFFF",
    surface2: dark ? "#1A1A16" : "#F8F6F0",
    border: dark ? "#34342C" : "#E7E1D6",
    text: dark ? "#F4F1E8" : "#1E1D19",
    muted: dark ? "#B7B4A8" : "#5F5A50",
    primary: dark ? "#D8B36A" : "#9A6C27",
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background: colors.bg,
        color: colors.text,
      }}
    >
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{
          background: dark
            ? "rgba(11,11,10,.88)"
            : "rgba(245,242,234,.88)",
          borderColor: colors.border,
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
                style={{ color: colors.muted }}
              >
                Intelligent education platform
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setTheme((current) =>
                  current === "dark" ? "light" : "dark"
                )
              }
              className="rounded-xl border px-3 py-2 text-xs"
              style={{
                borderColor: colors.border,
                background: colors.surface,
                color: colors.muted,
              }}
            >
              {dark ? "☀ Light" : "☾ Dark"}
            </button>

            <button
              onClick={() => router.push("/courses")}
              className="hidden rounded-xl border px-4 py-2 text-sm sm:block"
              style={{
                borderColor: colors.border,
                background: colors.surface,
                color: colors.text,
              }}
            >
              Courses
            </button>

            <button
              onClick={() => router.push("/login")}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: colors.primary }}
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div
          className="rounded-[30px] border p-7 sm:p-10"
          style={{
            borderColor: colors.border,
            background: colors.surface,
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: colors.primary }}
          >
            Contact EduMind
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            We’re here to help.
          </h1>

          <p
            className="mt-4 max-w-2xl leading-7"
            style={{ color: colors.muted }}
          >
            Have a question about courses, academic services,
            student support or EduMind?
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div className="space-y-4">
              {[
                ["Email", "support@edumind.com"],
                ["Academic Support", "support@edumind.com"],
                ["Platform", "AI-Powered Education Management"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: colors.border,
                    background: colors.surface2,
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: colors.muted }}
                  >
                    {label}
                  </p>

                  <p className="mt-2 font-medium">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border p-6"
              style={{
                borderColor: colors.border,
                background: colors.surface2,
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder="Your name"
                  className="rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{
                    borderColor: colors.border,
                    background: colors.surface,
                    color: colors.text,
                  }}
                />

                <input
                  required
                  type="email"
                  placeholder="Your email"
                  className="rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{
                    borderColor: colors.border,
                    background: colors.surface,
                    color: colors.text,
                  }}
                />
              </div>

              <input
                required
                placeholder="Subject"
                className="mt-4 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={{
                  borderColor: colors.border,
                  background: colors.surface,
                  color: colors.text,
                }}
              />

              <textarea
                required
                rows={6}
                placeholder="How can we help?"
                className="mt-4 w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none"
                style={{
                  borderColor: colors.border,
                  background: colors.surface,
                  color: colors.text,
                }}
              />

              <button
                type="submit"
                className="mt-4 rounded-xl px-5 py-3 font-semibold text-white"
                style={{ background: colors.primary }}
              >
                Send message
              </button>

              {sent && (
                <p
                  className="mt-4 text-sm"
                  style={{ color: "#447357" }}
                >
                  Thanks! Your message has been received.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}