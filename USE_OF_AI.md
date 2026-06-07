# Uso de la IA en SubTracker

Este documento describe el papel que ha tenido un asistente de IA (Claude) durante el desarrollo del proyecto: en qué se utilizó como apoyo y qué decisiones se tomaron sin delegarlas.

## Posicionamiento

El asistente se ha utilizado como una herramienta de consulta y aceleración para tareas mecánicas o repetitivas. La arquitectura, las decisiones de seguridad, el alcance del proyecto y la comprensión del código son responsabilidad del desarrollador.

El criterio de uso ha sido sencillo: si una parte del proyecto tiene que poder defenderse oralmente, se entiende y se escribe (o se reescribe) por uno mismo. La IA queda reservada para texto auxiliar, sintaxis puntual o tareas que no aportan valor a la comprensión.

## En qué se ha apoyado el desarrollo en la IA

- **Redacción de mensajes de commit en formato Conventional Commits**: el cambio se decide y se aplica primero; el resumen del commit se afina con apoyo de la IA.
- **Consultas de sintaxis y librerías**: dudas concretas sobre la API de React Router 7, Vitest, Axios o json-server-auth.
- **Borradores de documentación**: primeras versiones del README y el ARCHITECTURE.md antes de revisarlos manualmente.
- **Debugging puntual**: ayuda para interpretar mensajes de error de tests o de la consola del navegador.
- **Refactorizaciones acotadas**: renombrados, extracción de funciones cortas, limpieza de imports.

## Lo que NO se ha delegado

- **Comprensión del código**: cada función del proyecto se entiende. El desarrollador puede explicar qué hace, por qué está implementada así y qué consecuencias tendría modificarla.
- **Lectura del enunciado AA2**: la interpretación de los requisitos y el mapeo entre obligatorios y extras es propia.
- **Decisiones de scope**: qué se implementa, en qué orden y cuándo parar (por ejemplo, descartar Playwright + despliegue al confirmar que eran extras y la nota objetivo ya estaba cubierta).
- **Decisiones de seguridad**: razonamiento sobre IDOR, XSS, registro siempre como cuenta free, mensajes de error genéricos en login.
- **Validación de la suite de tests**: cada commit se hace tras ejecutar localmente los tests y comprobar que pasan.
- **Testing manual de la aplicación**: los cinco bugs runtime documentados (CORS, hashes bcrypt, payload sin userId, logos Clearbit caídos, listado sin filtrar por usuario) se detectaron probando la app en el navegador, no leyendo código.

## Decisiones tomadas por criterio propio

Estas decisiones se discutieron pero se cerraron por criterio del desarrollador, no por sugerencia automática:

| Decisión | Por qué |
|----------|---------|
| Permisos `600` en json-server-auth (no `660`) | Razonamiento explícito sobre IDOR: un usuario no debe poder leer suscripciones de otro. |
| Middleware adicional de filtrado por `userId` en `server.cjs` | Descubierto en testing manual al detectar que la regla 600 autoriza el acceso pero no filtra el listado. |
| Registro siempre como cuenta free | Evitar auto-promoción a premium desde el cliente. |
| Mensajes de error genéricos en login | Evitar enumeración de cuentas. |
| `useReducer` en AuthContext con `AUTH_ACTIONS` y reducer puro | Refactor consciente para cumplir el requisito de patrón reducer del enunciado de forma natural y mantener las transiciones (`LOGIN`, `LOGOUT`, `EXPIRED`) explícitas y testables. |
| Inyección de `userId` en el payload de create/update | Detectado al ver que json-server no asocia automáticamente el recurso al autor del JWT. |
| Estrategia de merge: merge commit + preservar ramas | Académicamente: el flujo de TDD y la estructura de ramas debe verse en GitHub. Squash habría escondido el historial. |
| Migración Clearbit → Google Favicons | Tras detectar 404 en runtime, se elige otro proveedor y se reescribe la utilidad. |

## Patrones de uso

- **No aceptar código sin entenderlo**: cada bloque que entra al repo se revisa, se ejecuta y se valora si encaja en el resto del proyecto.
- **Tests primero**: la suite debe pasar verde localmente antes de cada commit. Ningún cambio se da por bueno porque "el asistente dice que está bien".
- **Una sugerencia es una propuesta**: si no convence, se discute o se rechaza.

## Anti-patrones evitados

- **Autocompletar sin leer**: no se pegan bloques largos sin comprenderlos línea a línea.
- **"It works"**: no se acepta una respuesta del asistente diciendo "todo verde"; siempre se ejecuta la suite.
- **Dependencias innecesarias**: cada nueva librería se cuestiona. El proyecto incluye solo lo que el enunciado requiere o aporta valor real (axios, chart.js).

## Reflexión final

El proyecto tiene 17 PRs, 110 tests automatizados, 13 decisiones técnicas documentadas y una estructura coherente. El asistente ha permitido ir más rápido en partes mecánicas, pero la dirección técnica, las decisiones de seguridad y los bugs descubiertos en testing manual son del desarrollador.
