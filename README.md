# SubTracker — gestor de suscripciones

Aplicación web para llevar el control de las suscripciones mensuales recurrentes (Netflix, Spotify, Adobe…). Permite crear, editar y eliminar suscripciones, ver estadísticas básicas y, si el usuario tiene plan premium, acceder a un gráfico de gasto por categoría, un widget de renovaciones próximas y exportación CSV.

> **Contexto académico** — Actividad de Aprendizaje 2 (AA2) de la asignatura **Diseño de Interfaces** del 2º curso de DAM en la Fundación San Valero (curso 2025-2026).

## Tabla de contenidos
- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Puesta en marcha](#puesta-en-marcha)
- [Cuentas demo](#cuentas-demo)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Decisiones técnicas](#decisiones-técnicas)
- [Testing](#testing)
- [Cobertura del enunciado AA2](#cobertura-del-enunciado-aa2)
- [Uso crítico de la IA](#uso-crítico-de-la-ia)
- [Documentación complementaria](#documentación-complementaria)

## Características

### Para todos los usuarios
- **Autenticación JWT** con registro, inicio de sesión, persistencia de sesión y cierre de sesión.
- **Protección de rutas** mediante guardia de ruta basada en presencia de usuario en el contexto.
- **Tabla de suscripciones** con búsqueda por nombre, filtro por categoría y orden por columnas (nombre, precio, próxima renovación).
- **Estadísticas resumen**: número de suscripciones, gasto mensual equivalente y próxima renovación.
- **Gestión completa CRUD**: crear, editar y eliminar suscripciones con formulario controlado.
- **Logos automáticos** de cada servicio vía Google Favicons API.

### Solo para usuarios premium
- **Gráfico donut** de gasto mensual por categoría (Chart.js, lazy-loaded).
- **Widget de renovaciones próximas** (las que renuevan en los próximos 7 días).
- **Exportación CSV** de las suscripciones del usuario en formato RFC 4180.

### Calidad transversal
- **Sistema de tokens** de diseño (CSS variables) y reset moderno para coherencia visual.
- **Accesibilidad básica**: skip link, `lang="es"`, focus visible, `aria-sort` en cabeceras ordenables, `role="alert"` en mensajes críticos, `aria-current` en navlinks, etiquetas asociadas a inputs.
- **Gestión global de errores**: Error Boundary que captura fallos de renderizado e interceptor HTTP que limpia la sesión ante respuestas 401.
- **Optimización**: code splitting con `React.lazy` para Chart.js (~150 kB) — sólo se descarga si el usuario es premium.

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, React Router 7, Vite |
| Estado global | Context API + `useReducer` (AuthContext) |
| HTTP | Axios |
| Gráficos | Chart.js + react-chartjs-2 |
| Backend mock | json-server + json-server-auth |
| Tests unitarios | Vitest + React Testing Library + happy-dom |
| API externa | Google Favicons API (logos de servicios) |
| Linting | ESLint con react-hooks y react-refresh |

## Puesta en marcha

### Requisitos
- Node.js ≥ 20
- npm ≥ 10

### Pasos

```bash
# 1. Clonar el repo y entrar en él
git clone https://github.com/davidgarcia11/DI-AA2.git
cd DI-AA2

# 2. Instalar dependencias
npm install

# 3. Levantar el backend mock (puerto 3001)
npm run backend

# 4. En otra terminal, levantar el frontend (puerto 5173)
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador y entra con cualquiera de las cuentas demo.

## Cuentas demo

| Email | Contraseña | Rol |
|-------|------------|-----|
| `free@test.com` | `test1234` | free (máx. 5 suscripciones) |
| `premium@test.com` | `test1234` | premium (suscripciones ilimitadas + features extra) |

Las contraseñas están hasheadas con bcrypt en `db.json`. También puedes crear cuentas nuevas desde `/register` (siempre en plan free, ver [Decisiones técnicas](#decisiones-técnicas)).

## Variables de entorno

Crea un fichero `.env` en la raíz si necesitas cambiar la URL del backend:

```env
VITE_API_URL=http://localhost:3001
```

Si no existe, se usa `http://localhost:3001` por defecto.

## Scripts disponibles

```bash
npm run dev         # Levanta el frontend con Vite (HMR)
npm run backend     # Levanta json-server + json-server-auth en :3001
npm run build       # Build de producción en dist/
npm run preview     # Sirve el build de producción para verificar
npm run test        # Ejecuta los tests con Vitest (una vez)
npm run test:watch  # Ejecuta los tests en modo watch
npm run coverage    # Ejecuta los tests con informe de cobertura
npm run lint        # Pasa ESLint sobre el código
```

## Estructura del proyecto

```
DI-AA2/
├── db.json                  # Datos del backend mock (users + subscriptions)
├── server.cjs               # Configuración json-server + json-server-auth
├── index.html               # Entry HTML con lang="es" y meta description
├── src/
│   ├── main.jsx             # Bootstrap React + ErrorBoundary + interceptors
│   ├── App.jsx              # Configuración de rutas y AuthProvider
│   ├── index.css            # Sistema de estilos (tokens + reset + clases)
│   ├── components/
│   │   ├── Layout.jsx       # Navbar + Outlet para rutas autenticadas
│   │   ├── ProtectedRoute.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── StatsCard.jsx
│   │   ├── CategoryDonut.jsx        # lazy-loaded
│   │   ├── UpcomingRenewalsWidget.jsx
│   │   └── ExportCsvButton.jsx
│   ├── context/
│   │   ├── auth-context.js  # createContext aislado
│   │   ├── AuthContext.jsx  # AuthProvider con persistencia y auth:expired
│   │   └── useAuth.js       # Hook de conveniencia
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── SubscriptionFormPage.jsx
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── subscriptions.service.js
│   │   └── http-interceptors.js     # 401 → auth:expired
│   ├── utils/
│   │   ├── canAddMore.js
│   │   ├── csv.js
│   │   ├── filterAndSort.js
│   │   ├── formatters.js
│   │   ├── logo.js
│   │   └── stats.js
│   └── __tests__/           # Suite Vitest (110 tests, 22 ficheros)
```

## Decisiones técnicas

Se documentan aquí las decisiones no obvias del proyecto. Para más detalle, ver [`ARCHITECTURE.md`](./ARCHITECTURE.md).

| # | Decisión | Razón |
|---|----------|-------|
| 1 | json-server en `.cjs` | El `package.json` declara `"type": "module"` y la API de json-server es CommonJS. |
| 2 | Permisos `600` en json-server-auth **+ middleware de filtrado por `userId`** | La regla 600 solo autoriza el acceso; no filtra el listado GET. Sin un middleware adicional en `server.cjs` que inyecte `?userId=X` a partir del JWT, cualquier usuario autenticado veía las suscripciones de los demás. |
| 3 | `useReducer` en AuthContext | El estado de auth tiene varias transiciones (`LOGIN`, `LOGOUT`, `EXPIRED`) y un reducer puro (`authReducer`) las hace explícitas y testables, además de cumplir el requisito del enunciado. |
| 4 | Sin `RoleRoute` wrapper | Renderizado condicional inline (`user?.role === 'premium' && ...`) suficiente para la escala. |
| 5 | El registro siempre crea cuentas free | El frontend no expone selector de rol — evita auto-promoción a premium. |
| 6 | `noValidate` en formularios | La validación HTML5 nativa bloqueaba submits en happy-dom durante los tests; las restricciones reales ocurren a nivel de campo. |
| 7 | Token JWT en `localStorage` (no cookie httpOnly) | Vulnerable a XSS pero más sencillo de implementar; aceptable para el alcance académico. Documentado en el código. |
| 8 | Estrategia de merge: merge commit + keep branches | Permite ver el flujo de TDD (commits RED→GREEN) y la estructura de ramas en GitHub. |
| 9 | Lazy load de Chart.js | Reduce el bundle principal en ~150 kB para usuarios free. |
| 10 | `auth-context.js` separado de `AuthContext.jsx` | El linter de fast-refresh no permite mezclar componentes con exports de contexto en el mismo fichero. |
| 11 | Mock de `react-chartjs-2` en tests | Chart.js requiere canvas y happy-dom no lo implementa al nivel necesario. |
| 12 | Migración de Clearbit a Google Favicons para los logos | Clearbit cerró el tier gratuito de su Logo API durante el desarrollo y las peticiones devolvían 404. Google Favicons no requiere clave y es cacheable, a cambio de una calidad de imagen algo menor. |
| 13 | `userId` se inyecta en el payload de create/update | json-server no asocia el recurso al autor del token automáticamente. Sin `userId` explícito en el body, la regla 600 dejaba pasar el POST pero el recurso quedaba sin dueño y otros usuarios podían listarlo. |

## Testing

La suite incluye **110 tests** repartidos en **22 ficheros** que cubren utilidades, servicios, contexto, componentes y páginas.

```bash
npm run test
```

Estrategia:
- **Utilidades** (`canAddMore`, `formatters`, `filterAndSort`, `stats`, `csv`): tests unitarios puros.
- **Servicios** (`auth`, `subscriptions`): mock de Axios y verificación del payload + headers.
- **Componentes** (`StatsCard`, `CategoryDonut`, `UpcomingRenewalsWidget`, `ExportCsvButton`, `ErrorBoundary`): renderizado aislado.
- **Páginas** (`LoginPage`, `RegisterPage`, `DashboardPage`, `SubscriptionFormPage`): tests de integración renderizando la `App` completa con `MemoryRouter`, mock del servicio HTTP y simulación de eventos con `userEvent`.

## Cobertura del enunciado AA2

### Funcionalidades obligatorias (5/5)
- ✅ **Autenticación y autorización** — JWT, persistencia, ProtectedRoute, control basado en rol (`user.role`).
- ✅ **Gestión de estado global** — Context API en `AuthContext` con un reducer puro (`authReducer`) que gestiona las transiciones `LOGIN`, `LOGOUT` y `EXPIRED`. Estado local en el dashboard cuando aplica.
- ✅ **Integración de datos y servicios** — capa `services/` centraliza el acceso HTTP. Estados loading/ready/error/empty en cada página de datos.
- ✅ **Dashboard funcional** — tabla con orden y filtros reactivos, búsqueda, componentes de resumen, gestión de los cuatro estados.
- ✅ **Testing automatizado** — 110 tests Vitest cubriendo lógica crítica.

### Funcionalidades extra
- ✅ **Flujo Git profesional** — feature branches, conventional commits en español, PRs con merge commit (preserva ramas y commits TDD), 18 PRs totales.
- ✅ **API externa** — Google Favicons API integrada (logos automáticos a partir del nombre o dominio del servicio, con preview en vivo en el formulario).
- ✅ **Madurez técnica** — sistema de estilos coherente, accesibilidad básica, gestión global de errores, optimización con lazy load, documentación completa, lint limpio.
- ⏳ Testing E2E (Playwright) — no implementado.
- ⏳ Despliegue en contenedores + cloud — no implementado.

## Uso crítico de la IA

Durante el desarrollo se ha utilizado un asistente de IA (Claude) como herramienta de apoyo puntual: redacción de mensajes de commit, consultas de sintaxis, borradores de documentación y debugging acotado. La arquitectura, las decisiones de seguridad y la comprensión del código son responsabilidad del desarrollador.

Principios aplicados:

- **Comprensión antes que código**: cada bloque que entra al repo se entiende y se puede defender oralmente. Si no se entiende, no se acepta.
- **Decisiones técnicas propias**: estructura, dependencias, naming, decisiones de seguridad. Por ejemplo, los permisos `600` del backend (frente al `660` que sugería la documentación) y la decisión de no exponer un selector de rol en el registro se tomaron tras razonar sobre vectores de ataque concretos.
- **Validación local de la suite**: cada cambio se verifica ejecutando los tests localmente antes de hacer commit y antes de mergear el PR. No se confía en la IA para confirmar que "todo está verde".
- **Commits atómicos**: cada commit cuenta un cambio lógico y describe el _qué_ y el _por qué_; no hay commits que mezclen cambios sin relación.

Para más detalle, ver [`USE_OF_AI.md`](./USE_OF_AI.md).

## Documentación complementaria

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — diagrama de capas, flujo de auth, decisiones de diseño detalladas.
- [`USE_OF_AI.md`](./USE_OF_AI.md) — reflexión sobre el uso de IA durante el desarrollo.

## Licencia

Proyecto académico — uso libre para fines educativos.
