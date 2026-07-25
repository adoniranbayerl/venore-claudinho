"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { getCurrentUser, signIn, signOut } from "@/contexts/auth";
import { grantSuperadmin } from "@/contexts/rbac";

export async function signInWithProviderAction(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  if (!provider) return;

  await signIn(provider, { redirectTo: "/post-login" });
}

export async function signInWithDevCredentialsAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { username, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=invalid-credentials");
    }
    throw error;
  }

  redirect("/post-login");
}

export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}

export async function bootstrapSuperadminAction() {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    redirect("/login");
  }

  await grantSuperadmin({ userId: currentUser.data.id });
  redirect("/admin");
}
