import type { HistorialResponse } from "@/types/historial";

export async function fetchHistorial(
  filter?: "aprobadas" | "pendientes"
): Promise<HistorialResponse> {
  const params = filter ? `?filter=${filter}` : "";
  const res = await fetch(`${getBaseUrl()}/api/historial${params}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error("Error al cargar el historial");
  }
  return res.json();
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}
