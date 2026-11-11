import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";

export default async function AdminHomePage() {
  await requireAdminPage();

  return (
    <div className="space-y-6">
      <p className="text-muted">
        Atualize links afiliados e os 5 destaques da semana sem editar código.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/destaques"
          className="rounded-xl border border-line bg-white p-5 hover:border-court"
        >
          <h2 className="font-semibold text-ink">Destaques da semana</h2>
          <p className="mt-1 text-sm text-muted">
            Trocar os 5 tênis da home e seus links.
          </p>
        </Link>
        <Link
          href="/admin/posts"
          className="rounded-xl border border-line bg-white p-5 hover:border-court"
        >
          <h2 className="font-semibold text-ink">Posts e links</h2>
          <p className="mt-1 text-sm text-muted">
            Colar links, publicar só quando estiver completo.
          </p>
        </Link>
      </div>
    </div>
  );
}
