export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--paper,#f7f4ef)] text-ink">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">{children}</div>
    </div>
  );
}
