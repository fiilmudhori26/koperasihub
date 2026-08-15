import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requirePermission("users");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Users</h1>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted bg-surface-2">
            <tr>
              <th className="text-left font-medium px-4 py-3">Name</th>
              <th className="text-left font-medium px-4 py-3">Email</th>
              <th className="text-left font-medium px-4 py-3">Role</th>
              <th className="text-left font-medium px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-2/50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-emerald/15 text-emerald text-xs">{u.role}</span></td>
                <td className="px-4 py-3 text-muted">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
