export const dynamic = "force-dynamic";

import { AuthClient } from "./AuthClient";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-brand tracking-tight">What To Eat?</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to save your history</p>
        </div>
        <AuthClient />
      </div>
    </div>
  );
}
