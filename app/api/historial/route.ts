import { NextRequest } from "next/server";
import { getHistorial } from "@/lib/historial";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") as
    | "aprobadas"
    | "pendientes"
    | undefined;

  if (filter && !["aprobadas", "pendientes"].includes(filter)) {
    return Response.json(
      { error: "Filter debe ser 'aprobadas' o 'pendientes'" },
      { status: 400 }
    );
  }

  const data = getHistorial(filter);
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
    },
  });
}
