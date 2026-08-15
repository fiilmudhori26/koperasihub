import Link from "next/link";
import { loginAction } from "./actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const s = await getSession();
  if (s) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-emerald/15 text-emerald text-xl font-bold">K</span>
            <h1 className="text-2xl font-semibold tracking-tight">KoperasiHub</h1>
          </div>
          <p className="text-sm text-muted">Sign in to your cooperative account</p>
        </div>

        <form action={loginAction} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="username"
              defaultValue="admin@koperasihub.demo"
              className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2.5 text-sm outline-none focus:border-emerald" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" defaultValue="password123"
              className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2.5 text-sm outline-none focus:border-emerald" />
          </div>
          <button type="submit"
            className="w-full rounded-lg bg-emerald text-black font-semibold py-2.5 text-sm hover:bg-emerald/90 transition">
            Sign in
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Demo: admin / manager / cashier @koperasihub.demo · password123
        </p>
        <p className="text-center mt-4"><Link href="/" className="text-sm text-emerald hover:underline">Back</Link></p>
      </div>
    </main>
  );
}
