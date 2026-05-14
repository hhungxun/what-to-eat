"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <label className="text-sm font-medium text-text block mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input w-full"
          placeholder="Admin password"
          autoFocus
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brand text-white font-semibold rounded-xl disabled:opacity-60"
      >
        {loading ? "Checking…" : "Enter Admin"}
      </button>
    </form>
  );
}
