# Solventa · microservicio `auditoria`

ISIS-2212 Arquitecturas de software robustas · Grupo 1 · Sprint 2

**Responsabilidad:** Registro inmutable de eventos de seguridad (intentos rechazados con socio, recurso y timestamp).

| | |
|---|---|
| Nodo de despliegue | EC2 Soporte |
| Llama a | Ninguno |
| Lo llaman | distribucion (Validador socio) |
| Base de datos | BD Auditoría (RDS PostgreSQL, Multi-AZ) |
| Puerto interno | 3000 |
| Origen en el monolito | `(no existe en el monolito: servicio nuevo)` |

## Correr en local

```bash
cp .env.example .env
npm ci
npm run start:dev
```

El despliegue (docker-compose por nodo EC2), el gateway, los certificados y la documentación de experimentos viven en el repositorio paraguas `Sprint2-MS-ISIS-2212-S2-G1-ArquiSoft/ISIS2212_202620_S2_Grupo1`, rama `sprint-2-microservicios`.

## Correr en local con Docker

```bash
docker compose -f docker-compose.local.yml up -d --build
curl localhost:3006/health
docker compose -f docker-compose.local.yml down
```

`docker-compose.local.yml` es **solo para desarrollo**: levanta este servicio
(host `3006` → contenedor `3000`) y su propio `postgres:16-alpine` (host `5436`
→ contenedor `5432`), que carga `database/init.sql` al crearse. Auditoría no
llama a ningún otro servicio, así que no hace falta levantar nada más.

Los dos eventos que trae `database/init.sql` son **datos locales de prueba**,
no del monolito: existen para que las lecturas de verificación devuelvan algo
en un contenedor recién creado.

## API

Todas las respuestas son `application/json`.

`POST /eventos` es **el contrato que consume `ms-distribucion`**: su
`AuditoriaClient.registrar` (`src/clients/auditoria.client.ts`) lo llama con
`AUDITORIA_URL` cuando el Validador socio rechaza un intento. Los dos `GET`
existen para verificar el experimento, no los consume ningún servicio.

El registro es **inmutable**: no hay `PUT`, `PATCH` ni `DELETE`. Esas rutas no
están declaradas, así que responden `404`.

### `GET /health`

Verifica el servicio y la conexión a la BD (`SELECT 1`).

| | |
|---|---|
| Body | — |
| `200` | `{ "status": "ok" }` |
| `503` | `{ "status": "error", "database": "unreachable" }` |

### `POST /eventos`

Registra un evento de seguridad. Única escritura del servicio.

| | |
|---|---|
| Body | `socioId`, `accion`, `recurso`, `resultado` (string no vacío), `detalle` (string, opcional), `fecha` (ISO 8601) |
| `201` | `{ "id": "<uuid>" }` |
| `400` | falta un campo obligatorio, viene vacío, o `fecha` no es ISO 8601 |

`socioId` **no se valida como uuid**: el socio cuyo acceso se rechaza puede
mandar un id con cualquier forma, y ese intento también se registra. Validarlo
perdería justo los eventos más interesantes.

Además de la `fecha` que reporta quien llama, el servidor guarda
`registradoEn` con su propia hora, y es esa la que ordena las lecturas.

```bash
curl -X POST localhost:3006/eventos \
  -H 'Content-Type: application/json' \
  -d '{
    "socioId": "123e4567-e89b-12d3-a456-426614174001",
    "accion": "GET /cotizaciones",
    "recurso": "cotizaciones",
    "resultado": "RECHAZADO",
    "detalle": "El socio no tiene el scope cotizaciones:leer",
    "fecha": "2026-01-15T10:30:00.000Z"
  }'
```

```json
{ "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7" }
```

### `GET /eventos`

Lista los eventos ordenados por `registradoEn` descendente (el más reciente
primero).

| | |
|---|---|
| Query | `socioId` (opcional), `resultado` (opcional). Se combinan con AND |
| Body | — |
| `200` | arreglo de eventos (vacío si el filtro no encuentra nada) |
| `400` | un filtro viene presente pero vacío |

```bash
curl "localhost:3006/eventos?resultado=RECHAZADO"
```

```json
[
  {
    "id": "2b1f0c5e-0000-4000-8000-000000000002",
    "socioId": "socio-desconocido-999",
    "accion": "POST /polizas",
    "recurso": "polizas",
    "resultado": "RECHAZADO",
    "detalle": "Socio no registrado",
    "fecha": "2026-01-15T11:00:00.000Z",
    "registradoEn": "2026-01-15T11:00:03.412Z"
  }
]
```

### `GET /eventos/:id`

Un evento por id.

| | |
|---|---|
| Param | `id`: uuid del evento |
| Body | — |
| `200` | el evento |
| `404` | `{ "message": "Evento de auditoria con id <id> no encontrado", "error": "Not Found", "statusCode": 404 }` |

Un `id` que no sea uuid también devuelve `404`, no `400`: para quien consume,
cualquier id que no exista se comporta igual.

```bash
curl localhost:3006/eventos/2b1f0c5e-0000-4000-8000-000000000001
```

```json
{
  "id": "2b1f0c5e-0000-4000-8000-000000000001",
  "socioId": "123e4567-e89b-12d3-a456-426614174001",
  "accion": "GET /cotizaciones",
  "recurso": "cotizaciones",
  "resultado": "RECHAZADO",
  "detalle": "El socio no tiene el scope cotizaciones:leer",
  "fecha": "2026-01-15T10:30:00.000Z",
  "registradoEn": "2026-01-15T10:30:02.108Z"
}
```
