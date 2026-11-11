import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { hasAdminSession } from "@/lib/admin-auth";

export const instant = false;

export default async function AdminLoginPage() {
  if (await hasAdminSession()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-sm pt-16">
      <h1 className="font-display text-3xl italic text-ink">Entrar no admin</h1>
      <p className="mt-2 text-sm text-muted">
        Cole os links afiliados e atualize os destaques da semana.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
