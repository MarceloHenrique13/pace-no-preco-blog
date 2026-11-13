"use client";

import type { ReactNode } from "react";

type GroupLinkProps = {
  href: string;
  className?: string;
  /** Identifica qual botão da página foi clicado (ex.: "hero", "rodape"). */
  placement: string;
  children: ReactNode;
};

function trackGroupClick(placement: string) {
  try {
    const params = new URLSearchParams(window.location.search);
    const payload = JSON.stringify({
      event: "group_click",
      placement,
      path: window.location.pathname,
      utmContent: params.get("utm_content") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
    });
    // sendBeacon continua o envio mesmo com a navegação para o WhatsApp.
    const blob = new Blob([payload], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/track", blob)) {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    }
  } catch {
    // Rastreamento nunca pode atrapalhar a entrada no grupo.
  }
}

export function GroupLink({ href, className, placement, children }: GroupLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackGroupClick(placement)}
    >
      {children}
    </a>
  );
}
