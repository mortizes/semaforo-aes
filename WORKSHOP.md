# Workshop: Crear una App Fullstack con Cursor en 10 minutos

## De una idea en un video a producción con IA

**Fecha:** 20 Enero 2026  
**Duración total:** ~15 minutos  
**Resultado:** App funcionando en producción con base de datos en tiempo real

### Enlaces del Proyecto

| Recurso | URL |
|---------|-----|
| **App en Producción** | https://semaforo-peach-six.vercel.app/ |
| **Código en GitHub** | https://github.com/mortizes/semaforo-aes/ |
| **Video del Workshop** | https://www.loom.com/share/b18721605a3a4a0fb1a7acb480ba885d |
| **Base de Datos** | Supabase - Proyecto "Semaforo-AEs" |

---

## 1. El Problema: Semáforo de AEs

Un miembro del equipo de ventas explicó cómo funciona su sistema actual de gestión de disponibilidad (un Google Sheet):

> "Estamos todos los AEs puestos aquí a la izquierda. La columna es disponible. Si me pongo a hablar con algún cliente, quito disponible y se cambia como ocupado. Cuando cuelgue la llamada, me pondré disponible otra vez. Ese es el criterio principal para que se me asignen llamadas o no."

**Funcionalidades solicitadas:**
- Switch de disponibilidad (criterio principal para asignar llamadas)
- Estado: Disponible / Ocupado
- Modalidad: Presencial / Remoto / Off / Vacaciones
- **Regla automática:** Si pone "Off" o "Vacaciones" → automáticamente NO disponible
- Minutos desde último cambio
- Gestión de AEs (agregar, editar, eliminar)

---

## 2. Setup Inicial

### 2.1 Crear carpeta del proyecto
```
📁 semaforo/  (carpeta vacía)
```

### 2.2 Abrir en Cursor
Abrir la carpeta en Cursor IDE.

### 2.3 El Skill de Next.js Fullstack

El **skill** es un archivo que le dice a Cursor cómo debe trabajar. Incluye:
- Stack tecnológico (Next.js, TypeScript, Tailwind, Supabase)
- Mejores prácticas de React
- Estructura de archivos
- Comandos de instalación

> ⚠️ **Nota:** El skill original (`Skills/nextjs-fullstack/SKILL.md`) es un documento privado del equipo. Si necesitas acceso, solicítalo internamente. Sin embargo, la información esencial del stack y configuración está documentada en el [README.md](./README.md) de este repositorio.

**Stack definido en el skill:**
| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React + Tailwind CSS |
| Componentes | shadcn/ui (Radix) |
| Base de Datos | Supabase (PostgreSQL) |
| Deploy | Vercel |

---

## 3. El Prompt Inicial

Este fue el prompt que se le dio a Cursor:

```
@[skill de nextjs-fullstack] necesito crear un proyecto la gestion 
de ocupacion de los AEs, mas detallado aqui:

[TRANSCRIPT DEL VIDEO]
0:01 Te dejo por aquí cómo funciona el semáforo...
[... resto del transcript ...]

Asegurate que la app usable por los aes (ventas) y que esta 
informacion de la ocupacion de los aes se refleje en directo 
en una base de datos de supabase.

Añade tambien gestion de nuevos aes, etc.

Te comparto diseño actual de la app (a mejorar)
[IMAGEN DEL GOOGLE SHEET ACTUAL]
```

**Elementos clave del prompt:**
1. ✅ Referencia al skill (`@skill`)
2. ✅ Contexto del negocio (transcript del video)
3. ✅ Requisito técnico (Supabase en tiempo real)
4. ✅ Funcionalidades adicionales (CRUD de AEs)
5. ✅ Referencia visual (screenshot del diseño actual)

---

## 4. Lo que hizo Cursor automáticamente

### 4.1 Configuración de Supabase (MCP)
Cursor tiene integrado el **MCP de Supabase**, lo que permite:
- Crear proyectos de Supabase
- Crear tablas y triggers
- Obtener credenciales automáticamente

```
¿Quieres crear un nuevo proyecto de Supabase?
→ Sí, crear "Semaforo-AEs"
→ Confirmar costo ($10/mes)
```

### 4.2 Creación del proyecto Next.js
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr date-fns
```

### 4.3 Base de datos creada

**Tabla `aes`:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| name | TEXT | Nombre del AE |
| avatar_url | TEXT | URL del avatar |
| is_available | BOOLEAN | Disponible para llamadas |
| status | ENUM | 'disponible' / 'ocupado' |
| mode | ENUM | 'presencial' / 'remoto' / 'off' / 'vacaciones' |
| last_change_at | TIMESTAMP | Último cambio de estado |
| last_available_at | TIMESTAMP | Última vez disponible |

**Triggers automáticos:**
- `auto_disable_availability`: Si mode = 'off' o 'vacaciones' → is_available = false
- `log_ae_status_change`: Registra cambios en tabla de logs
- `update_updated_at_column`: Actualiza timestamp automáticamente

**Realtime habilitado:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE aes;
```

### 4.4 Componentes creados

```
src/
├── app/
│   ├── layout.tsx       # Layout con Toaster
│   ├── page.tsx         # Página principal
│   └── globals.css      # Estilos globales
├── components/
│   ├── semaforo/
│   │   ├── semaforo-table.tsx  # Tabla principal + estadísticas
│   │   ├── ae-row.tsx          # Fila de cada AE
│   │   └── ae-form-dialog.tsx  # Modal crear/editar AE
│   └── ui/                     # Componentes shadcn/ui
├── lib/
│   └── supabase.ts      # Cliente de Supabase
└── types/
    └── database.ts      # Tipos TypeScript
```

---

## 5. Deploy a Producción

### 5.1 Subir a GitHub
```bash
git add .
git commit -m "feat: Sistema de Semaforo de AEs completo"
git remote add origin https://github.com/mortizes/semaforo-aes.git
git push -u origin main
```

### 5.2 Deploy a Vercel
```bash
npx vercel --prod --yes
```

### 5.3 Configurar variables de entorno en Vercel
En el dashboard de Vercel → Settings → Environment Variables:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |

---

## 6. Resultado Final

### Funcionalidades implementadas:
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Tabla de AEs con switch de disponibilidad
- ✅ Dropdowns de estado y modalidad
- ✅ Regla automática: Off/Vacaciones → No disponible
- ✅ Sincronización en tiempo real (Supabase Realtime)
- ✅ CRUD completo de AEs
- ✅ UI moderna con shadcn/ui
- ✅ Responsive design
- ✅ Deploy en producción

### Tiempo total: ~15 minutos
- Setup inicial: 2 min
- Desarrollo con Cursor: 8 min
- Fix de tipos y deploy: 5 min

---

## 7. Próximos pasos sugeridos

Del meeting se identificaron mejoras futuras:

1. **Autenticación SSO con Google**
   - Solo cuentas @camarero.com pueden acceder
   - Cada AE solo puede modificar su propio estado

2. **Botón personal**
   - Vista simplificada para cada AE
   - Solo muestra su botón de disponibilidad

3. **Integración con asignación de llamadas**
   - Conectar con el sistema de asignación existente
   - API para consultar disponibilidad

4. **Horarios**
   - Tabla de horarios por AE
   - Auto-disponibilidad según horario

---

## 8. Arquitectura de integración

```
┌─────────────────┐     ┌─────────────────┐
│   Semáforo AEs  │     │   Asignación    │
│   (Este repo)   │     │   (Otro repo)   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    ┌──────────┐       │
         └───►│ Supabase │◄──────┘
              │ (Mismo   │
              │ proyecto)│
              └──────────┘
```

**Clave:** Ambos proyectos usan la **misma base de datos de Supabase**, así comparten la información de disponibilidad en tiempo real.

---

## 9. Recursos para replicar

### Archivos necesarios:
1. **Skill de Next.js Fullstack** (documento privado)
   - Solicitar acceso internamente si lo necesitas
   - La configuración esencial está en el [README.md](./README.md) de este repo
2. **MCPs configurados:**
   - `user-supabase` - Para crear/gestionar base de datos
   - `user-github` - Para repositorios
   - `cursor-ide-browser` - Para testing

### Comando para clonar y empezar:
```bash
# Clonar el repositorio
git clone https://github.com/mortizes/semaforo-aes.git
cd semaforo-aes

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Iniciar desarrollo
npm run dev
```

---

## 10. Conclusiones del Workshop

> "Esto en cinco minutos. Yo le paso la regla y el skill, y con eso es suficiente."

**Lo que aprendimos:**
1. Los **skills** son clave para que Cursor entienda el contexto técnico
2. El **transcript de un video** es suficiente como especificación
3. Los **MCPs** (Supabase, GitHub) automatizan la infraestructura
4. De **idea a producción** en menos de 15 minutos

**Flujo recomendado:**
```
Idea/Video → Skill + Prompt → Cursor desarrolla → GitHub → Vercel → Producción
```

---

*Workshop creado por Miguel Ortiz - Enero 2026*
