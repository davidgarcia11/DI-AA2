# Uso crítico de la IA en SubTracker

Este documento recoge la reflexión sobre cómo se ha utilizado un asistente de IA (Claude) durante el desarrollo del proyecto, qué se le ha delegado y qué decisiones se han tomado expresamente al margen.

## Filosofía de colaboración

El desarrollador del proyecto y el asistente trabajan como un equipo: el asistente acelera tareas mecánicas y aporta sugerencias técnicas, pero **toda decisión arquitectónica, de seguridad y de scope la toma el desarrollador**. La IA propone; el humano decide.

Cada respuesta de la IA se ha tratado como una _propuesta_ que requiere validación, no como una conclusión a aceptar tal cual.

## En qué se ha apoyado el desarrollo en la IA

### Tareas delegadas
- **Generación de boilerplate inicial**: scaffolding de Vite, configuración de Vitest, archivos de prueba TDD.
- **Redacción de tests RED**: dado un objetivo de funcionalidad, la IA ayuda a redactar el caso de prueba antes de implementar.
- **Implementación tras un test RED**: con la prueba delante, se le pide la implementación mínima (GREEN).
- **Análisis de errores**: cuando un test falla, la IA ayuda a interpretar el output y proponer fixes.
- **Refactorización segura**: extracción de helpers (p. ej. `monthlyEquivalent` en `stats.js`, `persistSession` en `AuthContext`).
- **Documentación**: borradores iniciales de README, ADRs y comentarios `// [LEARN]`.

### Decisiones tomadas con pensamiento crítico
Las siguientes decisiones se discutieron, pero **se decidieron por criterio del desarrollador**, no por sugerencia automática de la IA:

| Decisión | Por qué se hizo así |
|----------|---------------------|
| Permisos `600` en json-server-auth | La documentación oficial sugiere `660` (lectura compartida). Se cambió a `600` tras razonar sobre IDOR — un usuario podría leer suscripciones de otro. |
| Registro siempre crea cuentas free | Evitar auto-promoción a premium desde el cliente. Si el frontend permitiera elegir rol, cualquiera podría registrarse como premium. |
| Mensajes de error genéricos en login | Decisión consciente para evitar enumeración de cuentas: "email o contraseña incorrectos" no revela cuál de los dos falla. |
| `useState` y no `useReducer` en AuthContext | El asistente sugería reducer por defecto. Se rechazó porque las 4 transiciones del estado son triviales y un reducer añadiría boilerplate sin beneficio. |
| Estrategia de merge: merge commit + keep branches | Decisión académica: el profesor debe poder ver el flujo TDD (commits RED→GREEN) y la estructura de ramas. Squash habría escondido eso. |
| Lazy load solo de `CategoryDonut` | No se aplicó a otros componentes premium pequeños. La regla fue: optimizar donde la ganancia es real (Chart.js pesa 150 kB), no por costumbre. |

### Lo que NO se ha delegado
- **Lectura del enunciado AA2**: el desarrollador interpretó las exigencias y mapeó los puntos obligatorios y extras.
- **Decisión de scope**: qué tareas hacer, en qué orden y cuándo parar (Task 15 inicial — Playwright + Render — se descartó tras releer el enunciado y comprobar que era extra, no obligatorio).
- **Auditoría de seguridad**: revisión manual de cada flujo sensible (login, registro, persistencia del JWT).
- **Validación de tests verdes**: cada commit y cada PR se confirma ejecutando localmente la suite. La IA no ha "marcado verde" nada que no se haya verificado.

## Patrones de buen uso

### TDD como contrato
Antes de cualquier código de producción, la IA está obligada a escribir un test que falle por la razón correcta (feature missing, no por typo). Ver el output de ese test fallido es lo que prueba que el test está bien orientado. Sin esa verificación, no se procede.

### Commits atómicos
Cada commit cuenta una historia técnica completa: tests + implementación + documentación si aplica. La IA ayuda a redactar el mensaje, pero el desarrollador revisa que cada commit tenga sentido por sí solo.

### Documentación inline
Los comentarios `// [LEARN]` marcan los puntos donde se introduce un concepto o decisión que el desarrollador querría poder defender oralmente en la evaluación. La IA los redacta tras explicar el concepto al desarrollador.

## Anti-patrones evitados

- **Autocompletar masivo**: nunca se han pegado bloques grandes de código sin entender qué hacen línea a línea.
- **"It works"**: una respuesta del asistente diciendo "todo verde" no se acepta; siempre se ejecuta la suite.
- **Diseño por mayoría**: si la IA propone una arquitectura y el desarrollador no está convencido, se discute, no se acepta.
- **Dependencias innecesarias**: cada nueva librería se cuestiona. El proyecto tiene solo lo que el enunciado pide o lo que aporta valor real (axios, chart.js).

## Aprendizajes destacables

- **TDD obliga a pensar antes de escribir**: muchas decisiones de diseño han salido de redactar el test "deseado" antes de saber cómo implementarlo.
- **La IA es buena con APIs conocidas, mediocre con razonamiento de seguridad**: hay que insistir y razonar sobre vectores de ataque concretos, no aceptar la primera propuesta.
- **El git workflow disciplinado paga solo**: 14 PRs con commits atómicos cuestan poco al hacerlos y mucho cuando hay que volver atrás.
