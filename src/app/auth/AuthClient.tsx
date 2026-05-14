"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function AuthClient() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleOAuth(provider: "google" | "github") {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        location.href = "/swipe";
      }
    }

    setLoading(false);
  }

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm space-y-4">
      {/* OAuth buttons */}
      <div className="space-y-2">
        <button
          onClick={() => handleOAuth("google")}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 border-2 border-border rounded-xl font-semibold text-sm hover:border-brand transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          onClick={() => handleOAuth("github")}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 border-2 border-border rounded-xl font-semibold text-sm hover:border-brand transition-colors"
        >
          <GitHubIcon />
          Continue with GitHub
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted">or email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleEmail} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="Email"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="Password"
          minLength={6}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand text-white font-semibold rounded-xl disabled:opacity-60"
        >
          {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-text-muted">
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-brand font-semibold"
        >
          {mode === "login" ? "Sign up" : "Log in"}
        </button>
      </p>

      <p className="text-center text-xs text-text-muted">
        Or{" "}
        <a href="/swipe" className="underline">
          swipe anonymously
        </a>{" "}
        — no account needed
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}
