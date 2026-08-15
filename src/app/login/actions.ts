"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/login?error=1");
  const res = await login(email, password);
  if ("error" in res) redirect("/login?error=1");
  redirect("/dashboard");
}
