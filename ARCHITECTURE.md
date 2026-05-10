# Arquitectura — SubTracker

Documento técnico que explica las capas, los flujos principales y las decisiones de diseño no obvias del proyecto.

## Índice
- [Visión global](#visión-global)
- [Capas](#capas)
- [Flujo de autenticación](#flujo-de-autenticación)
- [Flujo de datos en el dashboard](#flujo-de-datos-en-el-dashboard)
- [Gestión de errores](#gestión-de-errores)
- [Optimización](#optimización)
- [Accesibilidad](#accesibilidad)

## Visión global

SubTracker es una SPA de React que se comunica con un backend mock (json-server + json-server-auth) emulando una API REST con JWT. La aplicación se compone de tres capas:

```
┌────────────────────────────────────────────────────────┐
│                  pages/ (React Router)                  │
│   LoginPage  RegisterPage  DashboardPage  Subform       │
└─────────────┬──────────────────────────────────────────┘
              │ usa
┌─────────────▼──────────────────────────────────────────┐
│                       components/                       │
│   Layout  ProtectedRoute  StatsCard  CategoryDonut      │
│   UpcomingRenewalsWidget  ExportCsvButton  ErrorBoundary│
└─────────────┬──────────────────────────────────────────┘
              │ usa
┌─────────────▼──────────────────────────────────────────┐
│                       services/                         │
│   auth.service     subscriptions.service     http-i.js  │
└─────────────┬──────────────────────────────────────────┘
              │ HTTP (Axios)
┌─────────────▼──────────────────────────────────────────┐
│       json-server + json-server-auth (puerto 3001)      │
│       /login  /register  /subscriptions                 │
└────────────────────────────────────────────────────────┘
```

A su vez, todo el árbol está envuelto por el contexto de auth (`AuthContext`) y por un `ErrorBoundary` global, ambos definidos en `main.jsx` y `App.jsx`.

## Capas

### `utils/` — funciones puras
Sin estado, sin efectos. Cada utilidad tiene su propio test unitario:
- `formatters.js` — `formatPrice`, `formatDate`, `daysUntil` (formato es-ES).
- `canAddMore.js` — regla de límite del plan free (`FREE_LIMIT = 5`).
- `stats.js` — `computeStats`, `computeByCategory`, `upcomingRenewals`.
- `filterAndSort.js` — filtra por búsqueda + categoría y ordena por columna.
- `csv.js` — serializa suscripciones a CSV con escape RFC 4180.
- `logo.js` — construye la URL de Clearbit a partir del nombre o dominio.

### `services/` — capa HTTP
Centraliza el acceso a la API. Cada función usa Axios y expone una promesa con datos ya extraídos de `response.data`.

- **Bearer token**: `authHeader(token)` añade `Authorization: Bearer <token>` en cada llamada protegida.
- **Interceptor 401** (`http-interceptors.js`): registrado una sola vez al arrancar la app. Cuando una respuesta llega con 401, limpia `localStorage` y dispara el evento `auth:expired`.

### `context/` — estado global
- `AuthContext.jsx` mantiene `user` y `token` en memoria, los persiste en `localStorage` en cada `login()` / `register()`, los recupera al montar (inicializador perezoso de `useState`) y los limpia en `logout()` o al recibir `auth:expired`.

Decisión deliberada: usar `useState` y no `useReducer`. El estado de auth tiene 4 acciones (`login`, `register`, `logout`, `expired`) que se traducen directamente a setters; un reducer añadiría boilerplate sin beneficio.

### `components/` — componentes reutilizables
Componentes pequeños y enfocados. La mayoría son funcionales puros (props in → JSX out). Las únicas excepciones:
- `ProtectedRoute` — usa `useAuth()` para decidir entre `<Navigate>` y `children`.
- `Layout` — usa `useAuth()` y `useNavigate()` para el logout.
- `ErrorBoundary` — clase, porque `componentDidCatch` no tiene equivalente en hooks.

### `pages/` — composición de UI
Cada página combina componentes, hace llamadas a servicios y mantiene su propio estado local cuando lo necesita (lista de suscripciones, filtros, formulario controlado).

## Flujo de autenticación

```
┌──────────┐        login()         ┌────────────┐
│LoginPage │ ─────────────────────► │AuthContext │
└──────────┘                        └─────┬──────┘
                                          │ authService.login(email, password)
                                          ▼
                                    ┌────────────┐
                                    │   Axios    │ POST /login
                                    └─────┬──────┘
                                          │ { accessToken, user }
                                          ▼
                                    ┌────────────┐
                                    │persistSess.│ ── localStorage ──┐
                                    └─────┬──────┘                   │
                                          │ setUser, setToken         │
                                          ▼                           │
                                    ┌────────────┐                   │
                                    │ Re-render  │ ◄──── inicializ. ─┘
                                    └─────┬──────┘    perezoso de
                                          │           useState (al
                                          ▼           montar)
                                  navigate('/dashboard')
```

El registro funciona igual (`/register` también devuelve `{ accessToken, user }` gracias a json-server-auth) → **auto-login** post-registro.

### Persistencia y rehidratación
- **Al hacer login/register**: `persistSession({ accessToken, user })` guarda en localStorage y en el estado.
- **Al recargar la página**: el inicializador perezoso de `useState` lee localStorage solo en el primer render.
- **Al expirar el JWT**: cualquier llamada HTTP que devuelva 401 dispara `auth:expired`, lo que limpia el estado en memoria. El localStorage ya se limpia desde el interceptor.

## Flujo de datos en el dashboard

```
DashboardPage
  └── useEffect → loadSubscriptions()
      └── getSubscriptions(token)  ────────────► HTTP GET /subscriptions
                                                       │
      ┌────────────────────────────────────────────────┘
      ▼
  setStatus('loading' | 'ready' | 'error')
  setSubscriptions(data)

  El render se decide por status:
  - 'loading' → <p>Cargando…</p>
  - 'error'   → <p>Error al cargar…</p>
  - 'ready' && empty → <p>No tienes suscripciones todavía…</p>
  - 'ready' && hasSubs → <toolbar/> + <table/> (filtros + orden)
```

Filtrado y orden se aplican en memoria sobre `subscriptions` mediante `filterAndSortSubscriptions`. Se usa `useMemo` para evitar recomputar en cada render si las dependencias no cambian.

## Gestión de errores

Tres niveles complementarios:

1. **Servicio**: cada función lanza si Axios rechaza. La página/componente decide qué hacer con el error (mostrar mensaje, redirigir, etc.).
2. **Interceptor 401**: si el JWT ha expirado, el interceptor reacciona globalmente sin que cada componente tenga que duplicar la lógica.
3. **ErrorBoundary**: captura errores de renderizado (excepciones lanzadas dentro del árbol React) y muestra un fallback con botón de recarga.

Los mensajes mostrados al usuario son siempre **genéricos**: nunca exponen detalles del backend (stack traces, mensajes específicos de la API). Esto evita filtrar información útil para un atacante (p. ej. enumeración de cuentas en login).

## Optimización

### Code splitting
`CategoryDonut` se carga con `React.lazy`. El chunk de Chart.js (~150 kB) sólo entra en la red cuando un usuario premium llega al dashboard.

```
Sin lazy: index.js = 445 kB / gzip 148 kB
Con lazy: index.js = 292 kB / gzip 95 kB
          + CategoryDonut.js = 158 kB / gzip 55 kB (solo premium)
```

### Memoización
- `useCallback` en `loadSubscriptions` para que la referencia de la función sea estable entre renders y `useEffect` no se ejecute innecesariamente.
- `useMemo` en `visibleSubs` (filtro + orden) para no recomputar cuando los inputs no cambian.

### Inicializador perezoso
`useState(() => localStorage.getItem('user'))` — la lectura de localStorage solo ocurre en el primer render, no en cada uno.

## Accesibilidad

Decisiones explícitas para cumplir nivel básico WCAG:

- **`lang="es"`** en `<html>` — los lectores de pantalla pronuncian correctamente.
- **Skip link** al inicio del Layout — usuarios de teclado pueden saltar directo al contenido sin navegar todo el header.
- **`role="banner"`** en `<header>` y **`role="main"`** implícito en `<main>` — landmarks ARIA.
- **`aria-current="page"`** en navlinks activos vía `NavLink`.
- **`aria-sort`** en cabeceras ordenables de la tabla (`ascending` / `descending` / `none`).
- **`role="alert"`** en mensajes de error críticos — los lectores los anuncian inmediatamente.
- **`role="status"`** en mensajes de carga — anuncio menos intrusivo.
- **`<label htmlFor>`** asociando todos los inputs con su etiqueta visible.
- **`autoComplete`** correcto en email, current-password y new-password.
- **`<time dateTime="YYYY-MM-DD">`** en fechas para que los asistentes lean la fecha estructurada.
- **Foco visible** mediante `:focus-visible` con `outline` de color de marca y `outline-offset`.
- **Contraste**: paleta diseñada con AA en mente — texto principal sobre fondo blanco/claro, texto muted con suficiente contraste para metadata.
- **Imágenes**: todos los `<img>` tienen `alt` descriptivo (los logos llevan _Logo de [nombre]_).
