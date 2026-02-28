# Requerimientos Funcionales - Historial Académico

## 1. Resumen

Aplicación web para visualizar el historial académico de un estudiante universitario. Permite consultar materias cursadas, su estado (aprobadas, pendientes, a final) y visualizar las correlativas (prerrequisitos) en forma de grafo interactivo.

**Dominio:** materias, correlativas (prerrequisitos), situaciones académicas, plan de estudios.

---

## 2. Modelo de datos

### Entidades

**Student (Estudiante)**

| Campo           | Tipo   | Obligatorio | Descripción                          |
|-----------------|--------|-------------|--------------------------------------|
| nombre          | string | Sí          | Apellido y nombre del alumno         |
| lu              | string | Sí          | Libreta Universitaria                |
| plan            | string | Sí          | Nombre del plan (ej. ING. EN INFORMÁTICA) |
| planCodigo      | string | Sí          | Código del plan                      |
| documento       | string | No          | Número de documento                  |
| fechaNacimiento | string | No          | Fecha en formato DD/MM/YYYY          |

**Materia**

| Campo        | Tipo     | Obligatorio | Descripción                                       |
|--------------|----------|-------------|---------------------------------------------------|
| codigo       | string   | Sí          | Identificador único (ej. 3.4.069)                 |
| nombre       | string   | Sí          | Nombre de la materia                              |
| horas        | number   | Sí          | Carga horaria en horas                            |
| situacion    | Situacion| Sí          | Estado actual de la materia                       |
| nota         | number   | No          | Nota obtenida (solo si aplica)                    |
| año          | Anio     | Sí          | Año o categoría del plan                          |
| correlativas | string[] | No          | Códigos de materias que son prerrequisito         |

**Situacion (valores posibles)**

- `PROMOCIONA` - Aprobada sin examen final
- `APROBADO` - Aprobada con examen final
- `EQUIV_INTERNA` - Aprobada por equivalencia interna
- `A_FINAL` - Cursada aprobada, pendiente de examen final
- `INSCRIPTO` - Inscripto al curso o examen
- `RECURSA` - Reprobada, debe recursar
- `PENDIENTE` - No cursada ni con equivalencia

**Anio (valores posibles)**

- `PRIMER_AÑO`, `SEGUNDO_AÑO`, `TERCER_AÑO`, `CUARTO_AÑO`, `QUINTO_AÑO`
- `OPTATIVAS` - Materias optativas
- `ANEXO` - Materias de anexo

---

## 3. Reglas de negocio

### Clasificación por situación

| Categoría      | Situaciones incluidas                          | Descripción                          |
|----------------|------------------------------------------------|--------------------------------------|
| Aprobadas      | PROMOCIONA, APROBADO, EQUIV_INTERNA            | Materias completamente aprobadas     |
| A final previo | A_FINAL                                        | Cursada aprobada, falta final        |
| Pendientes     | RECURSA, INSCRIPTO, PENDIENTE                  | No aprobadas aún                     |

### Correlativas

- Una correlativa es una materia prerrequisito.
- Si materia B tiene `correlativas: ["A"]`, entonces A es prerrequisito de B.
- En el grafo: arista A → B significa "A debe aprobarse antes que B".

---

## 4. Requerimientos funcionales

### RF-1: Vista Historial

**Descripción:** Mostrar el historial académico completo del alumno.

**Criterios de aceptación:**

- Listar todas las materias del plan.
- Agrupar materias por año (PRIMER_AÑO, SEGUNDO_AÑO, etc.).
- Mostrar por materia: código, nombre, horas, situación, nota (si existe).
- Orden de años: PRIMER_AÑO a QUINTO_AÑO, luego OPTATIVAS, luego ANEXO.

### RF-2: Filtros de materias

**Descripción:** Permitir filtrar las materias por estado.

**Criterios de aceptación:**

- Tres opciones: Todas | Aprobadas | Pendientes.
- **Todas:** mostrar todas las materias.
- **Aprobadas:** solo materias con situación PROMOCIONA, APROBADO o EQUIV_INTERNA.
- **Pendientes:** solo materias con situación RECURSA, INSCRIPTO, A_FINAL o PENDIENTE.
- El filtrado debe ser instantáneo (client-side o equivalente).

### RF-3: Resumen numérico

**Descripción:** Mostrar contadores de materias por categoría.

**Criterios de aceptación:**

- Tres métricas visibles: Aprobadas, A final previo, Pendientes.
- Valores numéricos calculados según las reglas de negocio.
- Ubicación: parte superior de la pantalla de historial, antes de los filtros.

### RF-4: Vista de grafo de correlativas

**Descripción:** Visualizar las materias como un grafo donde los nodos son materias y las aristas son correlativas.

**Criterios de aceptación:**

- Cada materia es un nodo.
- Arista A → B: A es prerrequisito de B.
- Nodos con color según situación (verde aprobada, ámbar a final, rojo recursa, gris pendiente).
- Grafo interactivo: zoom, pan, selección de nodos.
- Líneas conectando nodos correlacionados.

### RF-5: Filtro por nodo en el grafo

**Descripción:** Al seleccionar un nodo, poder ver solo sus conexiones.

**Criterios de aceptación:**

- Click en un nodo lo selecciona.
- Aparecer panel con nombre de la materia seleccionada.
- Botón "Ver solo correlativas": filtrar el grafo para mostrar solo el nodo seleccionado, sus prerrequisitos (correlativas anteriores) y las materias que lo tienen como prerrequisito (siguientes).
- Botón "Mostrar todo": restaurar el grafo completo.
- El panel debe permanecer visible mientras el filtro esté activo, incluso si se pierde la selección visual.

### RF-6: Vista Obsidian (modo mapa mental)

**Descripción:** Toggle para alternar entre vista estándar y vista estilo Obsidian.

**Criterios de aceptación:**

- Botón "Vista Obsidian" / "Vista estándar" para alternar.
- En modo Obsidian:
  - Fondo oscuro.
  - Nodos compactos (círculo de color + etiqueta).
  - Líneas finas y discretas.
  - Layout orgánico/horizontal (no por capas rígidas).
  - Paleta de colores adaptada a fondo oscuro.
- En modo estándar: vista original con nodos expandidos y layout por año.

### RF-7: Navegación y layout

**Descripción:** Estructura de navegación consistente.

**Criterios de aceptación:**

- Sidebar lateral con enlaces a: Historial, Grafo de correlativas.
- Sidebar colapsable (opcional).
- Mostrar nombre del estudiante en el pie del sidebar.
- Área de contenido principal con buen padding y legibilidad.

---

## 5. API requerida

### GET /api/historial (o equivalente)

**Propósito:** Devolver el historial del estudiante.

**Query params (opcionales):**

- `filter`: `aprobadas` | `pendientes` — filtrar materias por categoría.

**Respuesta:**

```json
{
  "student": { "nombre": "...", "lu": "...", "plan": "...", "planCodigo": "..." },
  "materias": [
    {
      "codigo": "3.4.069",
      "nombre": "FUNDAMENTOS DE INFORMATICA",
      "horas": 68,
      "situacion": "EQUIV_INTERNA",
      "año": "PRIMER_AÑO",
      "correlativas": []
    }
  ]
}
```

**Nota:** La API puede ser reemplazada por lectura directa de datos estáticos si la app no requiere servidor.

---

## 6. UX / Criterios de aceptación generales

- Cada materia debe mostrar: código, nombre, horas, situación, nota (si existe).
- Colores por situación para identificación rápida:
  - Verde: aprobada
  - Ámbar: a final / en curso
  - Rojo: recursa
  - Gris: pendiente
- Grafo interactivo: zoom, pan, selección.
- Diseño limpio, estilo minimalista (similar a Notion).
- Responsive: adaptar a móvil (sidebar colapsable, tabla en cards si corresponde).
