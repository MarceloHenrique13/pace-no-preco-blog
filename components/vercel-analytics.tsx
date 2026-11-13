import Script from "next/script";

/**
 * Vercel Web Analytics (contagem de visitas/páginas).
 * Equivale ao componente <Analytics /> de @vercel/analytics: só carrega o script
 * que a Vercel serve em /_vercel/insights/script.js depois que o Analytics é
 * habilitado no painel do projeto. Antes disso o script simplesmente não existe.
 */
export function VercelAnalytics() {
  return (
    <>
      <Script id="vercel-analytics-init" strategy="afterInteractive">
        {`window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };`}
      </Script>
      <Script src="/_vercel/insights/script.js" strategy="afterInteractive" defer />
    </>
  );
}
