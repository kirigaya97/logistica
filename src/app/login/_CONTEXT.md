# 📁 src/app/login

## Propósito
Este directorio contiene la página de autenticación de la aplicación, permitiendo a los usuarios iniciar sesión en el sistema de logística internacional mediante sus credenciales.

## Archivos
| Archivo | Descripción |
|---|---|
| page.js | Componente de cliente que renderiza el formulario de inicio de sesión y gestiona la lógica de autenticación con Supabase. |

## Relaciones
- **Usa**: @/lib/supabase/client (cliente de autenticación), next/navigation (enrutamiento), lucide-react (iconos), react (gestión del estado local).
- **Usado por**: El enrutador de Next.js al acceder a la ruta /login.

## Detalles clave
- Implementado como un Client Component para gestionar el estado interactivo del formulario.
- Utiliza el método de autenticación por correo electrónico y contraseña a través de la instancia del cliente de Supabase.
- Redirige a la página principal (raíz) tras un inicio de sesión exitoso y fuerza un refresco de la ruta.
- Previene envíos múltiples implementando un estado de carga que deshabilita el botón de acceso.
- Maneja los errores de inicio de sesión mostrando un mensaje genérico ("Email o contraseña incorrectos") por motivos de seguridad.
- La interfaz gráfica utiliza clases utilitarias de Tailwind CSS para su diseño responsivo y estilo visual.