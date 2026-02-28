export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-auto">
      <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
    </main>
  );
}
