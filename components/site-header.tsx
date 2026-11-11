import Link from "next/link";
import { siteConfig } from "@/lib/site";

const links = [
  { href: "/blog", label: "Blog" },
  { href: "/grupo", label: "Grupo" },
];

export function SiteHeader() {
  return (
    <header className="glass-nav sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-[4.25rem] md:px-6">
        <Link
          href="/"
          className="font-display shrink-0 text-lg italic tracking-tight text-ink btn-press sm:text-xl md:text-2xl"
        >
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium text-ink/80 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn-press inline-flex min-h-11 items-center px-2.5 transition-colors hover:text-court sm:px-3"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={siteConfig.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press inline-flex min-h-11 items-center rounded-full border border-court px-3 text-court hover:bg-court-soft sm:px-4"
          >
            <span className="sm:hidden">Grupo</span>
            <span className="hidden sm:inline">Entrar no grupo</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
