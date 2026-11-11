import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/logout-button";
import { hasAdminSession } from "@/lib/admin-auth";

export const instant = false;

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Pace no Preço
          </p>
          <h1 className="font-display text-2xl italic text-ink">Admin</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/admin" className="text-court hover:underline">
            Início
          </Link>
          <Link href="/admin/destaques" className="text-court hover:underline">
            Destaques
          </Link>
          <Link href="/admin/posts" className="text-court hover:underline">
            Posts
          </Link>
          <LogoutButton />
        </nav>
      </header>
      {children}
    </div>
  );
}
