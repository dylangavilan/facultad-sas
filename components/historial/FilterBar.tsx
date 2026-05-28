"use client";

type Filter = "todas" | "aprobadas" | "pendientes";

interface FilterBarProps {
  value: Filter;
  onChange: (value: Filter) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  const options = [
    { value: "todas", label: "Todas las materias" },
    { value: "aprobadas", label: "Aprobadas" },
    { value: "pendientes", label: "Pendientes" },
  ] as const;

  return (
    <div className="mb-6 flex p-1 bg-slate-950/30 border border-slate-900/60 rounded-xl gap-1 w-full sm:w-fit">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-slate-800/50 text-sky-400 border border-slate-700/60 shadow-[0_0_12px_rgba(56,189,248,0.02)]"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
