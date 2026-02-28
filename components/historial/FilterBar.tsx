"use client";

type Filter = "todas" | "aprobadas" | "pendientes";

interface FilterBarProps {
  value: Filter;
  onChange: (filter: Filter) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  const tabs: { id: Filter; label: string }[] = [
    { id: "todas", label: "Todas" },
    { id: "aprobadas", label: "Aprobadas" },
    { id: "pendientes", label: "Pendientes" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Filtrar materias"
      className="mb-6 flex gap-1 rounded-lg border border-notion-border bg-white p-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value === tab.id
              ? "bg-notion-text text-white"
              : "text-notion-text-secondary hover:bg-gray-100 hover:text-notion-text"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
