import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ROLE_PERMISSIONS, Role, roleFrom } from "@/lib/types";

const COOKIE = "kh_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type Session = { userId: string; role: Role; name: string; email: string };

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(user: {
  id: string;
  role: string;
  name: string;
  email: string;
}) {
  const token = await new SignJWT({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.userId || typeof payload.userId !== "string") return null;
    return {
      userId: payload.userId,
      role: roleFrom(payload.role),
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
    };
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password" };
  const ok = await verifyPassword(password, user.password);
  if (!ok) return { error: "Invalid email or password" };
  await createSession(user);
  return { ok: true as const };
}

// Server-side guard: returns session or throws redirect.
import { redirect } from "next/navigation";
export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export async function requirePermission(permission: string): Promise<Session> {
  const s = await requireSession();
  if (!ROLE_PERMISSIONS[s.role]?.includes(permission)) redirect("/dashboard");
  return s;
}
