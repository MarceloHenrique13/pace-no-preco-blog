import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between md:px-6">
        <div>
          <p className="font-display text-2xl italic text-ink">{siteConfig.name}</p>
          <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-muted">
            Conteúdo editorial sobre corrida e tênis, com foco em custo-benefício.
          </p>
        </div>
        <div className="flex flex-wrap gap-1 text-sm text-muted">
          <Link href="/blog" className="inline-flex min-h-11 items-center px-2 hover:text-court">
            Blog
          </Link>
          <Link href="/grupo" className="inline-flex min-h-11 items-center px-2 hover:text-court">
            Grupo
          </Link>
        </div>
      </div>
    </footer>
  );
}
