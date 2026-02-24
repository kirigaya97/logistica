Voy a generar el archivo `_CONTEXT.md` para el directorio `src/app/login/` siguiendo el formato y las instrucciones solicitadas.

```markdown
# 📂 src/app/login

## Propósito
Punto de entrada para la autenticación de usuarios, permitiendo el acceso seguro a la plataforma de gestión logística mediante credenciales de correo electrónico y contraseña.

## Archivos
| Archivo | Descripción |
|---|---|
| `page.js` | Componente de cliente que gestiona el formulario de login, el estado de la sesión y la integración con Supabase Auth. |

## Relaciones
- **Usa**: `@/lib/supabase/client` (cliente de autenticación), `next/navigation` (redirección tras éxito), `lucide-react` (iconografía visual).
- **Usado por**: Usuarios no autenticados; el middleware del sistema redirige aquí cualquier intento de acceso no autorizado.

## Detalles clave
- **Autenticación con Supabase**: Utiliza el método `signInWithPassword` para validar credenciales.
- **Experiencia de Usuario**: Implementa manejo de estados de carga (`loading`) para deshabilitar el botón de ingreso y feedback visual de errores en caso de credenciales incorrectas.
- **Flujo de Navegación**: Tras un inicio de sesión exitoso, utiliza `router.push('/')` y `router.refresh()` para asegurar que el estado de la sesión se actualice correctamente en toda la aplicación.
- **Diseño**: Mantiene una estética oscura consistente mediante Tailwind CSS, utilizando componentes de UI específicos para formularios y alertas.
```