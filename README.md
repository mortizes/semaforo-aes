# Semáforo de AEs

Sistema de gestión de ocupación para Account Executives (AEs) del equipo de ventas. Permite visualizar en tiempo real el estado de disponibilidad de cada AE para la asignación de llamadas.

## Características

- **Estado de Disponibilidad**: Switch principal que determina si un AE puede recibir llamadas
- **Estado Secundario**: Disponible / Ocupado (para información adicional)
- **Modalidad**: Presencial / Remoto / Off / Vacaciones
- **Regla Automática**: Al seleccionar "Off" o "Vacaciones", se marca automáticamente como no disponible
- **Tiempo Real**: Sincronización instantánea con Supabase Realtime
- **Métricas**: Minutos desde el último cambio y fecha del último estado "Disponible"
- **CRUD Completo**: Agregar, editar y eliminar AEs

## Tecnologías

- **Framework**: Next.js 16 (App Router)
- **UI**: React + Tailwind CSS + shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Tiempo Real**: Supabase Realtime
- **Lenguaje**: TypeScript

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd semaforo

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Iniciar el servidor de desarrollo
npm run dev
```

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Estructura de Base de Datos

### Tabla `aes`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| name | TEXT | Nombre del AE |
| avatar_url | TEXT | URL del avatar (opcional) |
| is_available | BOOLEAN | Disponible para recibir llamadas |
| status | ENUM | 'disponible' \| 'ocupado' |
| mode | ENUM | 'presencial' \| 'remoto' \| 'off' \| 'vacaciones' |
| last_change_at | TIMESTAMPTZ | Último cambio de estado |
| last_available_at | TIMESTAMPTZ | Última vez que se puso disponible |

### Triggers Automáticos
- **auto_disable_availability**: Si el modo es "off" o "vacaciones", se deshabilita automáticamente la disponibilidad
- **log_ae_status_change**: Registra cada cambio de estado en `status_logs`
- **update_updated_at_column**: Actualiza el campo `updated_at` automáticamente

## Uso

1. **Ver Estado**: La tabla muestra todos los AEs con su estado actual
2. **Cambiar Disponibilidad**: Click en el switch para activar/desactivar
3. **Cambiar Estado/Modalidad**: Usar los dropdowns en cada fila
4. **Agregar AE**: Click en "Nuevo AE" y completar el formulario
5. **Editar/Eliminar**: Usar el menú de acciones (⋮) en cada fila

## Estadísticas

El dashboard muestra en tiempo real:
- Total de AEs
- AEs Disponibles (verde)
- AEs Ocupados (rojo)
- AEs en Off/Vacaciones (gris)

## Despliegue

El proyecto está configurado para desplegarse fácilmente en Vercel:

```bash
npm run build
vercel deploy
```

## Licencia

Proyecto interno - Uso exclusivo del equipo de ventas.
