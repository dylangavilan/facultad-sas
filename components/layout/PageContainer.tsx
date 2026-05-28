export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex-1 overflow-auto bg-[#080c14] text-slate-100">
      {/* Luces sutiles de fondo (glow effects) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-8 py-8">
        {children}
      </div>
    </main>
  );
}
