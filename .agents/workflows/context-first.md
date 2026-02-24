---
description: Cómo navegar el codebase usando JIT Context Assembly
---

# JIT Context Navigation

Antes de hacer cualquier cambio de código, seguí estos pasos:

// turbo-all
1. Leer `AI_ROUTER.md` en la raíz del proyecto para entender la estructura general
2. Identificar qué directorio(s) son relevantes para la tarea actual
3. Leer los `_CONTEXT.md` de esos directorios para entender el contenido sin leer cada archivo
4. Leer SOLO los archivos específicos que necesitás modificar o consultar
5. Ejecutar la tarea con contexto mínimo y preciso

## Reglas
- **NO indexes el workspace completo** — navegá hop-by-hop
- **Empezá siempre por AI_ROUTER.md** — es tu mapa
- **Cada `_CONTEXT.md` explica su directorio** — usalo para decidir qué archivos leer
- **Si creás archivos nuevos**, el mapper se encargará de documentarlos en el próximo commit
