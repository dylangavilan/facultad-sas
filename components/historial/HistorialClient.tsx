"use client";

import { useState, useMemo } from "react";
import type { Materia, Student } from "@/types/historial";
import { filtrarMaterias } from "@/lib/historial";
import { FilterBar } from "./FilterBar";
import { HistorialTable } from "./HistorialTable";

type Filter = "todas" | "aprobadas" | "pendientes";

interface HistorialClientProps {
  initialMaterias: Materia[];
  initialStudent: Student;
}

export function HistorialClient({
  initialMaterias,
}: HistorialClientProps) {
  const [filter, setFilter] = useState<Filter>("todas");

  const materias = useMemo(
    () => filtrarMaterias(initialMaterias, filter),
    [initialMaterias, filter]
  );

  return (
    <>
      <FilterBar value={filter} onChange={setFilter} />
      <HistorialTable materias={materias} />
    </>
  );
}
