import { redirect } from "next/navigation";
import { getPostLoginDestination } from "@/platform/auth-flow/get-post-login-destination";

export default async function PostLoginPage() {
  const destination = await getPostLoginDestination();
  redirect(destination);
}
