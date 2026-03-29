"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useTheme } from "@/components/ThemeContext";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.replace("/");
    } else {
      setError(result.error || "Login failed");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: "var(--veda-bg)" }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--veda-accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--veda-bg)", transition: "background 0.3s ease" }}
    >
      {/* Theme toggle — top right */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-xl transition-all duration-200"
        style={{
          background: "var(--veda-input-field-bg)",
          border: "1px solid var(--veda-border)",
          color: "var(--veda-text-muted)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--veda-accent-soft)";
          e.currentTarget.style.color = "var(--veda-accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--veda-input-field-bg)";
          e.currentTarget.style.color = "var(--veda-text-muted)";
        }}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* Background orbs */}
      <div
        className="absolute rounded-full"
        style={{
          width: "400px",
          height: "400px",
          background: `radial-gradient(circle, var(--veda-orb-bg) 0%, transparent 70%)`,
          top: "-100px",
          right: "-100px",
          animation: "pulse-glow 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "300px",
          height: "300px",
          background: `radial-gradient(circle, var(--veda-cyan-soft) 0%, transparent 70%)`,
          bottom: "-80px",
          left: "-60px",
          animation: "pulse-glow 8s ease-in-out infinite",
          animationDelay: "2s",
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--veda-card-bg)",
            backdropFilter: "blur(24px)",
            border: "1px solid var(--veda-border)",
            boxShadow: "var(--veda-card-shadow)",
            transition: "background 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div
                className="rounded-full"
                style={{
                  width: "48px",
                  height: "48px",
                  background: "radial-gradient(circle, rgba(108,92,231,0.5) 0%, rgba(108,92,231,0.15) 60%, transparent 80%)",
                  boxShadow: "0 0 30px var(--veda-accent-glow)",
                  animation: "pulse-glow 3s ease-in-out infinite",
                }}
              />
            </div>
            <h1
              className="text-2xl font-bold tracking-wider"
              style={{ color: "var(--veda-text)" }}
            >
              VEDA
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--veda-text-dim)" }}
            >
              Sign in to your AI assistant
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                background: "rgba(253,121,168,0.1)",
                border: "1px solid rgba(253,121,168,0.2)",
                color: "var(--veda-rose)",
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{ color: "var(--veda-text-dim)" }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@veda.ai"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                style={{
                  background: "var(--veda-input-field-bg)",
                  border: "1px solid var(--veda-input-field-border)",
                  color: "var(--veda-text)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(108,92,231,0.4)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,92,231,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--veda-input-field-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{ color: "var(--veda-text-dim)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    background: "var(--veda-input-field-bg)",
                    border: "1px solid var(--veda-input-field-border)",
                    color: "var(--veda-text)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(108,92,231,0.4)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,92,231,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--veda-input-field-border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "var(--veda-text-dim)" }}
                  tabIndex={-1}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                style={{
                  background: rememberMe ? "var(--veda-accent)" : "var(--veda-input-field-bg)",
                  border: `1px solid ${rememberMe ? "var(--veda-accent)" : "var(--veda-border-hover)"}`,
                }}
              >
                {rememberMe && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <span className="text-xs" style={{ color: "var(--veda-text-muted)" }}>
                Remember me
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden"
              style={{
                background: isSubmitting
                  ? "rgba(108,92,231,0.3)"
                  : "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
                color: "#fff",
                boxShadow: isSubmitting ? "none" : "0 4px 16px var(--veda-accent-glow)",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.boxShadow = "0 6px 24px rgba(108,92,231,0.4)";
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.currentTarget.style.boxShadow = "0 4px 16px var(--veda-accent-glow)";
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div
            className="mt-6 p-3 rounded-lg text-center"
            style={{
              background: "var(--veda-accent-soft)",
              border: "1px solid rgba(108,92,231,0.1)",
            }}
          >
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--veda-text-dim)" }}>
              Demo Credentials
            </p>
            <p className="text-xs font-mono" style={{ color: "var(--veda-text-muted)" }}>
              admin@veda.ai / veda2024
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
