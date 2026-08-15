import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { navForRole } from "@/lib/nav";
import { logoutAction } from "../actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const items = navForRole(session.role);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-emerald/15 text-emerald font-bold">K</span>
          <span className="font-semibold tracking-tight">KoperasiHub</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => (
            <Link key={it.href} href={it.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg transition">
              <span className="text-base w-5 text-center">{it.icon}</span>
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2">
            <div className="text-sm font-medium">{session.name}</div>
            <div className="text-xs text-muted">{session.role}</div>
          </div>
          <form action={logoutAction}>
            <button className="w-full text-left rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg transition">Log out</button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-16 flex items-center justify-between px-5 border-b border-border bg-surface/60 backdrop-blur">
          <div className="md:hidden font-semibold">KoperasiHub</div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:block">{session.name}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald/15 text-emerald">{session.role}</span>
          </div>
        </header>
        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
