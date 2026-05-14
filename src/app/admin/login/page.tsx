import { AdminLogin } from "./AdminLogin";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black text-brand text-center mb-6">WTE Admin</h1>
        <AdminLogin />
      </div>
    </div>
  );
}
