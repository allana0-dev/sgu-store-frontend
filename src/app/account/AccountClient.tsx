"use client";

import { type FormEvent, useState } from "react";
import { FiCheckCircle, FiLogOut, FiShield, FiUser } from "react-icons/fi";
import { useAuth } from "@/components/auth/AuthProvider";

type AuthMode = "login" | "register";

const initialLoginForm = {
  email: "",
  password: "",
};

const initialRegisterForm = {
  fullName: "",
  email: "",
  password: "",
};

export default function AccountClient() {
  const { user, isLoading, register, login, logout } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      await register(registerForm);
      setRegisterForm(initialRegisterForm);
      setMode("login");
      setFeedback("Account created. You can log in now.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      await login(loginForm);
      setLoginForm(initialLoginForm);
      setFeedback("You are now logged in.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      await logout();
      setFeedback("You have been logged out.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Logout failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card-surface p-8 md:p-12">
        <p className="text-sm font-semibold text-sgu-gray">Checking your session...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface p-8 md:p-12">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sgu-light-turquoise text-sgu-navy">
              <FiUser className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sgu-turquoise">
                Signed in
              </p>
              <h1 className="mt-2 text-3xl font-bold text-sgu-navy">
                Welcome, {user.fullName}
              </h1>
              <p className="mt-3 text-sgu-gray">
                You're signed in and ready to shop faster with saved details and easier checkout.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 font-semibold text-sgu-navy">{user.email}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Role</p>
              <p className="mt-1 font-semibold text-sgu-navy">{user.role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-sgu-navy px-5 py-3 text-sm font-bold text-sgu-navy transition-colors hover:bg-sgu-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiLogOut aria-hidden="true" className="h-4 w-4" />
            {isSubmitting ? "Logging out..." : "Log out"}
          </button>
        </div>

        <div className="card-surface p-8">
          <FiShield className="h-8 w-8 text-sgu-turquoise" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-sgu-navy">Your account</h2>
          <p className="mt-3 text-sm text-sgu-gray">
            Manage your profile and stay ready for upcoming features like order tracking and purchase history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="card-surface p-8 md:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-sgu-turquoise">
          SGU Campus Store
        </p>
        <h1 className="mt-3 text-3xl font-bold text-sgu-navy">My Account</h1>
        <p className="mt-4 text-sgu-gray">
          Sign in to your account for a faster checkout and a smoother shopping experience.
        </p>

        <div className="mt-8 rounded-xl bg-sgu-navy p-5 text-white">
          <FiCheckCircle className="h-6 w-6 text-sgu-turquoise" aria-hidden="true" />
          <h2 className="mt-3 font-bold">New here?</h2>
          <p className="mt-2 text-sm text-white/80">
            Create an account in seconds to save your details and make future checkout even easier.
          </p>
        </div>
      </div>

      <div className="card-surface p-8 md:p-10">
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setFeedback(null);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              mode === "login" ? "bg-white text-sgu-navy shadow-sm" : "text-sgu-gray"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
              setFeedback(null);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              mode === "register" ? "bg-white text-sgu-navy shadow-sm" : "text-sgu-gray"
            }`}
          >
            Register
          </button>
        </div>

        {feedback ? (
          <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {feedback}
          </p>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-sgu-navy">Email</span>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((previous) => ({ ...previous, email: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-sgu-gray focus:border-sgu-turquoise focus:outline-none"
                placeholder="student@sgu.edu"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-sgu-navy">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((previous) => ({ ...previous, password: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-sgu-gray focus:border-sgu-turquoise focus:outline-none"
                placeholder="At least 8 characters"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="button-primary w-full rounded-xl px-5 py-3 text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-sgu-navy">Full name</span>
              <input
                type="text"
                required
                value={registerForm.fullName}
                onChange={(event) =>
                  setRegisterForm((previous) => ({ ...previous, fullName: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-sgu-gray focus:border-sgu-turquoise focus:outline-none"
                placeholder="Jane Doe"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-sgu-navy">Email</span>
              <input
                type="email"
                required
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((previous) => ({ ...previous, email: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-sgu-gray focus:border-sgu-turquoise focus:outline-none"
                placeholder="student@sgu.edu"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-sgu-navy">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((previous) => ({ ...previous, password: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-sgu-gray focus:border-sgu-turquoise focus:outline-none"
                placeholder="At least 8 characters"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="button-primary w-full rounded-xl px-5 py-3 text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
