--
-- BD Auditoria · esquema y datos semilla del microservicio auditoria.
--
-- Este esquema NO viene del monolito modular: Auditoria es un servicio nuevo
-- que sale del diagrama de despliegue, donde el Validador socio de
-- Distribucion registra los rechazos. El monolito no tenia ninguna tabla,
-- modulo ni interceptor de auditoria, asi que no hay nada que extraer de
-- database/solventa.sql.
--
-- La tabla es append-only: solo se insertan filas. No hay llaves foraneas
-- hacia otros servicios; "socioId" es una columna de id suelta.
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

--
-- Name: eventos_auditoria; Type: TABLE
--
-- "socioId" es character varying y no uuid a proposito: el socio cuyo acceso
-- se rechaza puede haber mandado un id con cualquier forma, y ese intento
-- tambien se registra.
--
CREATE TABLE IF NOT EXISTS public.eventos_auditoria (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "socioId" character varying NOT NULL,
    accion character varying NOT NULL,
    recurso character varying NOT NULL,
    resultado character varying NOT NULL,
    detalle character varying,
    fecha timestamp without time zone NOT NULL,
    "registradoEn" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "PK_eventos_auditoria" PRIMARY KEY (id)
);

--
-- Name: idx_eventos_auditoria_socio; Type: INDEX
--
-- Las consultas de verificacion filtran por socio. El nombre coincide con el
-- de @Index en la entidad para que synchronize no cree un indice duplicado.
--
CREATE INDEX IF NOT EXISTS idx_eventos_auditoria_socio
    ON public.eventos_auditoria ("socioId");

--
-- Datos semilla
--
-- Datos LOCALES de prueba, no del monolito: existen solo para que las
-- lecturas de verificacion (GET /eventos y sus filtros) tengan algo que
-- devolver en un contenedor recien creado.
--
-- El primero usa el socio semilla de los demas servicios; el segundo usa un
-- socio que no existe en ninguna base, para dejar claro que "socioId" no se
-- valida como uuid ni se comprueba contra otro servicio.
--
INSERT INTO public.eventos_auditoria (
    id, "socioId", accion, recurso, resultado, detalle, fecha
)
VALUES (
    '2b1f0c5e-0000-4000-8000-000000000001',
    '123e4567-e89b-12d3-a456-426614174001',
    'GET /cotizaciones',
    'cotizaciones',
    'RECHAZADO',
    'El socio no tiene el scope cotizaciones:leer',
    '2026-01-15T10:30:00.000Z'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.eventos_auditoria (
    id, "socioId", accion, recurso, resultado, detalle, fecha
)
VALUES (
    '2b1f0c5e-0000-4000-8000-000000000002',
    'socio-desconocido-999',
    'POST /polizas',
    'polizas',
    'RECHAZADO',
    'Socio no registrado',
    '2026-01-15T11:00:00.000Z'
)
ON CONFLICT DO NOTHING;
