"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const demoAccounts = [
  {
    role: "Student",
    email: "test@edumind.com",
    password: "Test12345",
    icon: "S",
  },
  {
    role: "Teacher",
    email: "teacher@edumind.com",
    password: "Teacher12345",
    icon: "T",
  },
  {
    role: "Admin",
    email: "admin@edumind.com",
    password: "Admin12345",
    icon: "A",
  },
];

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function useDemoAccount(account: (typeof demoAccounts)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    setMessage(`Demo ${account.role} credentials loaded.`);
  }

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Login failed");
        setLoading(false);
        return;
      }

      if (!data.user || !data.user.role) {
        setMessage(
          "Login succeeded, but account information is missing."
        );
        setLoading(false);
        return;
      }

      setMessage("Login successful!");

      const role = data.user.role;

      if (role === "STUDENT") {
        router.replace("/student/dashboard");
        return;
      }

      if (role === "TEACHER") {
        router.replace("/teacher/dashboard");
        return;
      }

      if (role === "ADMIN") {
        router.replace("/admin/dashboard");
        return;
      }

      setMessage("Unknown user role.");
      setLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        "Unable to connect to the server. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0B0B0A] text-[#F4F1E8]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-[#B9914F]/10 blur-3xl animate-[pulse_7s_ease-in-out_infinite]" />
        <div className="absolute -right-24 top-16 h-[26rem] w-[26rem] rounded-full bg-[#8FB09A]/8 blur-3xl animate-[pulse_9s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-[#B7A4C8]/6 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D8B36A] to-[#9D7A43] text-lg font-bold text-[#0B0B0A] shadow-lg shadow-[#B9914F]/15">
            E
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">
              EduMind
            </p>
            <p className="text-xs text-[#817E74]">
              Intelligent education workspace
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-[#34342C] bg-[#141411]/70 px-3 py-1.5 text-xs text-[#B7B4A8] backdrop-blur sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8FB09A] shadow-[0_0_10px_rgba(143,176,154,0.7)]" />
          AI systems online
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center px-5 pb-10 pt-2 sm:px-8 lg:px-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <section
            className={`hidden lg:block ${
              mounted
                ? "animate-[fadeUp_.8s_ease-out]"
                : "opacity-0"
            }`}
          >
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8A6E3E]/30 bg-[#B9914F]/8 px-3 py-1.5 text-xs font-medium text-[#D8B36A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D8B36A]" />
                AI-POWERED ACADEMIC INTELLIGENCE
              </div>

              <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.04em] xl:text-6xl">
                One workspace for
                <span className="block text-[#D8B36A]">
                  better learning.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-[#B7B4A8]">
                EduMind connects academic performance, attendance,
                assignments and AI-driven insights in one focused
                student experience.
              </p>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                {[
                  ["90%", "Attendance"],
                  ["86.75%", "Average"],
                  ["LOW", "AI Risk"],
                ].map(([value, label], index) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[#34342C] bg-[#141411]/75 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#8A6E3E]/40 hover:bg-[#171713]"
                    style={{
                      animationDelay: `${index * 120}ms`,
                    }}
                  >
                    <p className="text-xl font-semibold text-[#F4F1E8]">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-[#817E74]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-[#817E74]">
                <span className="rounded-full border border-[#26261F] bg-[#11110F]/70 px-3 py-2">
                  Personalized insights
                </span>
                <span className="rounded-full border border-[#26261F] bg-[#11110F]/70 px-3 py-2">
                  Early risk detection
                </span>
                <span className="rounded-full border border-[#26261F] bg-[#11110F]/70 px-3 py-2">
                  Role-based access
                </span>
              </div>
            </div>
          </section>

          <section
            className={`mx-auto w-full max-w-xl ${
              mounted
                ? "animate-[fadeUp_.8s_.12s_ease-out_both]"
                : "opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-[30px] border border-[#34342C] bg-[#11110F]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-7">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#B9914F]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#8FB09A]/6 blur-3xl" />

              <div className="relative">
                <div className="mb-7 lg:hidden">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#8A6E3E]/30 bg-[#B9914F]/8 px-3 py-1.5 text-xs font-medium text-[#D8B36A]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D8B36A]" />
                    EDU + AI
                  </div>

                  <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                    Better learning,
                    <span className="block text-[#D8B36A]">
                      smarter insights.
                    </span>
                  </h1>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#D8B36A]">
                      Secure access
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                      Welcome back
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#B7B4A8]">
                      Sign in to continue to your EduMind workspace.
                    </p>
                  </div>

                  <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-[#34342C] bg-[#171713] text-[#D8B36A] sm:flex">
                    ✦
                  </div>
                </div>

                <form
                  onSubmit={handleLogin}
                  className="mt-7 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-[#F4F1E8]"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#817E74]">
                        @
                      </span>

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@edumind.com"
                        required
                        disabled={loading}
                        autoComplete="email"
                        className="w-full rounded-2xl border border-[#34342C] bg-[#0B0B0A] px-11 py-3.5 text-sm text-[#F4F1E8] outline-none transition duration-200 placeholder:text-[#625F56] focus:border-[#B9914F] focus:bg-[#10100E] focus:ring-4 focus:ring-[#B9914F]/10 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-[#F4F1E8]"
                      >
                        Password
                      </label>

                      <span className="text-xs text-[#817E74]">
                        Secure login
                      </span>
                    </div>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#817E74]">
                        •
                      </span>

                      <input
                        id="password"
                        type={
                          showPassword ? "text" : "password"
                        }
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                        autoComplete="current-password"
                        className="w-full rounded-2xl border border-[#34342C] bg-[#0B0B0A] px-11 py-3.5 pr-24 text-sm text-[#F4F1E8] outline-none transition duration-200 placeholder:text-[#625F56] focus:border-[#B9914F] focus:bg-[#10100E] focus:ring-4 focus:ring-[#B9914F]/10 disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((current) => !current)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#B7B4A8] transition hover:bg-[#171713] hover:text-[#F4F1E8]"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#C9A45F] via-[#B9914F] to-[#9D7A43] px-4 py-3.5 text-sm font-semibold text-[#0B0B0A] shadow-lg shadow-[#B9914F]/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#B9914F]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-full" />

                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B0B0A]/30 border-t-[#0B0B0A]" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in
                          <span className="transition-transform duration-200 group-hover:translate-x-1">
                            →
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {message && (
                  <div
                    className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                      message === "Login successful!"
                        ? "border-[#6D8F77]/25 bg-[#6D8F77]/10 text-[#A8C3AF]"
                        : message.startsWith("Demo ")
                          ? "border-[#B9914F]/25 bg-[#B9914F]/10 text-[#D8B36A]"
                          : "border-[#A95E56]/25 bg-[#A95E56]/10 text-[#E8A7A0]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span>
                        {message === "Login successful!"
                          ? "✓"
                          : message.startsWith("Demo ")
                            ? "⌁"
                            : "!"}
                      </span>
                      <span>{message}</span>
                    </div>
                  </div>
                )}

                {/* Demo credentials */}
                <div className="mt-6 rounded-2xl border border-[#34342C] bg-[#161612] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D8B36A]">
                        Demo credentials
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#817E74]">
                        Use these accounts to explore the protected
                        teacher and administrator portals.
                      </p>
                    </div>

                    <span className="rounded-full border border-[#8A6E3E]/30 bg-[#B9914F]/10 px-2.5 py-1 text-[10px] font-semibold text-[#D8B36A]">
                      BUILDATHON
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {demoAccounts.map((account) => (
                      <button
                        key={account.role}
                        type="button"
                        onClick={() =>
                          useDemoAccount(account)
                        }
                        disabled={loading}
                        className="group rounded-2xl border border-[#34342C] bg-[#0B0B0A] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#8A6E3E]/50 hover:bg-[#11110F] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#B9914F]/10 text-xs font-bold text-[#D8B36A]">
                            {account.icon}
                          </span>

                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#625F56] group-hover:text-[#D8B36A]">
                            Use account
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-[#F4F1E8]">
                          {account.role}
                        </p>

                        <p className="mt-2 break-all text-xs text-[#B7B4A8]">
                          {account.email}
                        </p>

                        <p className="mt-1 text-xs text-[#817E74]">
                          Password:{" "}
                          <span className="text-[#B7B4A8]">
                            {account.password}
                          </span>
                        </p>
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-[11px] leading-5 text-[#625F56]">
                    Demo accounts are intended for hackathon evaluation only.
                    Please do not use these credentials for real
                    personal or sensitive information.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#26261F]" />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#625F56]">
                    EduMind
                  </span>
                  <div className="h-px flex-1 bg-[#26261F]" />
                </div>

                <p className="mt-5 text-center text-xs leading-5 text-[#625F56]">
                  AI-powered education management · secure role-based access
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#625F56]">
              <span>🚀</span>
              <span>Buildathon 2026</span>
              <span>•</span>
              <span>EduMind</span>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}