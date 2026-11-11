import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";

export async function requireAdminPage(): Promise<void> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }
}
