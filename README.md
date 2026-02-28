# Historial Académico - Facultad SAS

Aplicación web para visualizar el historial académico del alumno con filtros por materias aprobadas/pendientes y vista de grafo de correlativas.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Flow** (`@xyflow/react`) para el grafo de correlativas
- **pnpm**

## Desarrollo

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

- `/` - Historial académico con filtros (Todas | Aprobadas | Pendientes)
- `/grafo` - Grafo interactivo de correlativas entre materias
- `/api/historial` - BFF: `GET ?filter=aprobadas|pendientes`

## Datos

El historial se carga desde `data/historial.json`. Para actualizar los datos, edita ese archivo o reemplázalo con la salida de un script de extracción desde PDF.
