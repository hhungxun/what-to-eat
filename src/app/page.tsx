import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-xs">
        <div>
          <h1 className="text-5xl font-black text-brand tracking-tight leading-tight">
            What<br />To Eat?
          </h1>
          <p className="text-text-muted mt-3 text-base">
            Swipe through XMUM restaurants and find out what you actually want.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/swipe"
            className="block w-full py-4 bg-brand text-white font-bold text-lg rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            Start Swiping 🍽️
          </Link>
          <Link
            href="/auth"
            className="block w-full py-3 border-2 border-brand text-brand font-semibold rounded-2xl"
          >
            Sign In / Sign Up
          </Link>
        </div>

        <p className="text-xs text-text-muted">
          No account needed to swipe · Sign in to save history
        </p>
      </div>
    </main>
  );
}
