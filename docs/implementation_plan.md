# Plan de Implementación — Sistema de Logística Internacional

> **Versión**: 1.0 · **Fecha**: 2026-02-24

---

## Decisiones Confirmadas

| Decisión | Valor |
|---|---|
| Framework | Next.js (App Router) |
| Base de datos | Supabase (PostgreSQL) |
| Hosting | Vercel (free tier) |
| Auth | Supabase Auth (básica: email/password) |
| Sheets Mirror | Diferido a post-v1 |
| Dominio | `[repo]-vercel.app` |
| Estilo | CSS vanilla (o Tailwind si se prefiere) |

---

## 1. Estructura del Proyecto

```
logistica/
├── .agents/
│   └── workflows/           # Workflows para desarrollo asistido por IA
│       ├── dev-server.md
│       ├── supabase-sync.md
│       ├── new-module.md
│       └── deploy.md
│
├── public/
│   └── icons/
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.js         # Layout raíz (nav, sidebar, providers)
│   │   ├── page.js           # Dashboard general (home)
│   │   ├── globals.css       # Estilos globales + design tokens
│   │   │
│   │   ├── login/
│   │   │   └── page.js
│   │   │
│   │   ├── contenedores/
│   │   │   ├── page.js              # Lista de contenedores
│   │   │   ├── nuevo/
│   │   │   │   └── page.js          # Crear contenedor
│   │   │   └── [id]/
│   │   │       ├── page.js          # Detalle de contenedor
│   │   │       ├── packing-list/
│   │   │       │   └── page.js      # Ver/importar packing list
│   │   │       └── costos/
│   │   │           └── page.js      # Calculadora de costos
│   │   │
│   │   ├── clientes/
│   │   │   ├── page.js              # Lista de clientes
│   │   │   └── [id]/
│   │   │       └── page.js          # Ficha de cliente
│   │   │
│   │   ├── etiquetas/
│   │   │   └── page.js              # Gestión de etiquetas
│   │   │
│   │   ├── calculadora-volumetrica/
│   │   │   └── page.js
│   │   │
│   │   ├── historico/
│   │   │   └── page.js              # Contenedores finalizados
│   │   │
│   │   └── api/
│   │       ├── exchange-rate/
│   │       │   └── route.js          # Proxy a DolarAPI
│   │       └── export/
│   │           └── route.js          # Genera .xlsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.js
│   │   │   ├── Header.js
│   │   │   └── Breadcrumbs.js
│   │   │
│   │   ├── ui/                       # Componentes reutilizables
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Select.js
│   │   │   ├── Modal.js
│   │   │   ├── DataTable.js          # Tabla tipo spreadsheet
│   │   │   ├── StatusBadge.js
│   │   │   ├── TagInput.js
│   │   │   ├── FileUpload.js
│   │   │   └── ExportButton.js
│   │   │
│   │   ├── contenedores/
│   │   │   ├── ContainerForm.js
│   │   │   ├── ContainerCard.js
│   │   │   ├── ContainerStatusFlow.js
│   │   │   └── ContainerFilters.js
│   │   │
│   │   ├── packing-list/
│   │   │   ├── PackingListImporter.js   # Drag & drop + mapeo
│   │   │   ├── PackingListTable.js
│   │   │   └── ItemClassifier.js        # Asignar etiquetas/clientes
│   │   │
│   │   ├── calculadora/
│   │   │   ├── CostMatrix.js            # Matriz dinámica
│   │   │   ├── CostRow.js               # Fila toggle-able
│   │   │   ├── CostOutput.js            # Salida real
│   │   │   ├── CostOutputClient.js      # Salida cliente (editable)
│   │   │   └── VolumetricCalc.js
│   │   │
│   │   ├── clientes/
│   │   │   ├── ClientForm.js
│   │   │   └── ClientSummary.js
│   │   │
│   │   └── dashboard/
│   │       ├── StatusOverview.js
│   │       ├── UpcomingETAs.js
│   │       └── ClientSummaryCards.js
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js             # Supabase browser client
│   │   │   ├── server.js             # Supabase server client
│   │   │   └── middleware.js         # Auth middleware
│   │   │
│   │   ├── excel/
│   │   │   ├── parser.js             # Parsear packing lists
│   │   │   └── exporter.js           # Generar .xlsx
│   │   │
│   │   ├── calculadora/
│   │   │   ├── engine.js             # Lógica de cálculo de costos
│   │   │   ├── defaults.js           # Conceptos default de la matriz
│   │   │   └── volumetric.js         # Cálculo volumétrico
│   │   │
│   │   ├── exchange-rate.js          # Fetch a DolarAPI
│   │   ├── formatters.js             # Formateo de moneda, fechas, etc.
│   │   └── constants.js              # Constantes (tipos container, estados, etc.)
│   │
│   └── hooks/
│       ├── useContainers.js
│       ├── useClients.js
│       ├── useExchangeRate.js
│       └── useCostCalculator.js
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # Schema completo
│
├── .env.local                        # Variables de entorno (no commitear)
├── .env.example                      # Template de env vars
├── next.config.js
├── package.json
└── README.md
```

---

## 2. Schema de Base de Datos (Supabase)

### Tablas principales

```sql
-- Usuarios (manejado por Supabase Auth, extendido con profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  role TEXT DEFAULT 'operator'  -- 'admin' | 'operator'
);

-- Contenedores
CREATE TABLE containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,           -- Auto: HK-2026-001
  name TEXT NOT NULL,
  origin_warehouse TEXT NOT NULL,       -- 'HK' | 'CH' | 'USA'
  origin_port TEXT,
  destination_port TEXT,
  container_type TEXT NOT NULL,         -- '20' | '40' | '40HC'
  etd DATE,
  eta DATE,
  bl_number TEXT,
  status TEXT DEFAULT 'deposito',       -- deposito|transito|aduana|finalizado
  exchange_rate DECIMAL(12,4),
  exchange_rate_type TEXT,              -- 'blue' | 'oficial' | etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Packing Lists (1:1 con container)
CREATE TABLE packing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID UNIQUE REFERENCES containers(id) ON DELETE CASCADE,
  imported_at TIMESTAMPTZ DEFAULT now(),
  original_filename TEXT
);

-- Items del Packing List
CREATE TABLE packing_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packing_list_id UUID REFERENCES packing_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  weight_kg DECIMAL(10,3),
  height_cm DECIMAL(10,2),
  width_cm DECIMAL(10,2),
  depth_cm DECIMAL(10,2),
  volume_m3 DECIMAL(10,6),             -- Calculado o importado
  client_id UUID REFERENCES clients(id),
  sort_order INTEGER DEFAULT 0
);

-- Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  international_rate DECIMAL(12,2),
  local_rate DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Historial de tarifas de cliente
CREATE TABLE client_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  rate_type TEXT NOT NULL,              -- 'international' | 'local'
  old_value DECIMAL(12,2),
  new_value DECIMAL(12,2),
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Etiquetas
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE, -- lowercase, trimmed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Relación Items ↔ Etiquetas (N:N)
CREATE TABLE item_tags (
  item_id UUID REFERENCES packing_list_items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- Cálculos de Costos (1:1 con container)
CREATE TABLE cost_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID UNIQUE REFERENCES containers(id) ON DELETE CASCADE,
  fob_total DECIMAL(14,2),
  ocean_freight DECIMAL(14,2),
  baf DECIMAL(14,2),
  insurance DECIMAL(14,2),
  exchange_rate DECIMAL(12,4),
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Conceptos de costo (filas de la matriz)
CREATE TABLE cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID REFERENCES cost_calculations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,               -- '1_cif' | '2_tributos' | etc.
  concept_name TEXT NOT NULL,
  value_type TEXT NOT NULL,             -- 'fixed' | 'percentage'
  base TEXT,                            -- 'fob' | 'cif' | 'base_imponible' | etc.
  value DECIMAL(14,4),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  -- Campos para salida cliente (override)
  client_value DECIMAL(14,4),           -- NULL = usa valor real
  client_active BOOLEAN,                -- NULL = usa is_active
  client_label TEXT                     -- NULL = usa concept_name
);

-- Tipos de cambio históricos
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_type TEXT NOT NULL,              -- 'blue' | 'oficial' | 'mep' | etc.
  buy DECIMAL(12,4),
  sell DECIMAL(12,4),
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- Dimensiones de contenedores (referencia editable)
CREATE TABLE container_dimensions (
  type TEXT PRIMARY KEY,                -- '20' | '40' | '40HC'
  internal_length_cm DECIMAL(8,2),
  internal_width_cm DECIMAL(8,2),
  internal_height_cm DECIMAL(8,2),
  max_weight_kg DECIMAL(10,2)
);
```

### Row Level Security (RLS)
- Todas las tablas con RLS habilitado
- Política simple: usuarios autenticados pueden leer/escribir todo
- Sin distinción de roles en v1 (todos son operadores)

---

## 3. Reglas y Convenciones de Código

### Naming
| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos componentes | PascalCase | `ContainerForm.js` |
| Archivos lib/utils | camelCase | `exchangeRate.js` |
| Funciones | camelCase | `calculateCIF()` |
| Constantes | UPPER_SNAKE | `CONTAINER_TYPES` |
| Tablas DB | snake_case plural | `packing_list_items` |
| Columnas DB | snake_case | `container_id` |
| Rutas URL | kebab-case | `/calculadora-volumetrica` |
| CSS custom properties | `--color-*`, `--space-*` | `--color-primary` |

### Patrones de código
- **Server Components por defecto**: solo usar `'use client'` cuando se necesite interactividad
- **Data fetching**: Server Components con Supabase server client, no `useEffect`
- **Mutaciones**: Server Actions (`'use server'`) para formularios
- **Estado local**: `useState` / `useReducer` solo para UI interactiva (calculadora)
- **No ORMs**: Supabase client directo (`.from('table').select(...)`)
- **Validación**: Zod para validar inputs en server actions
- **Errores**: Try/catch con mensajes en español para el usuario

### Diseño visual
- **Paleta**: Tonos oscuros/neutros con acentos en azul (logística/profesional)
- **Tipografía**: Inter (Google Fonts)
- **Componentes**: Bordes suaves, sombras sutiles, espaciado generoso
- **Tablas**: Estilo spreadsheet con headers fijos, filas alternadas
- **Responsive**: Desktop-first (usuarios en oficina), pero funcional en tablet
- **Iconos**: Lucide React (consistentes, livianos)

---

## 4. Workflows para Desarrollo con IA

Se crearán los siguientes workflows en `.agents/workflows/`:

### `dev-server.md`
```
// turbo-all
1. cd al proyecto y correr `npm run dev`
2. Verificar que compila sin errores
```

### `new-module.md`
```
Pasos para agregar un nuevo módulo:
1. Crear migración SQL en supabase/migrations/
2. Crear página en src/app/[modulo]/page.js
3. Crear componentes en src/components/[modulo]/
4. Agregar hooks si necesario en src/hooks/
5. Agregar entrada en la navegación (Sidebar.js)
6. Verificar con dev server
```

### `supabase-sync.md`
```
Para sincronizar cambios de schema:
1. Crear archivo .sql en supabase/migrations/
2. Aplicar en Supabase dashboard o via CLI
3. Regenerar tipos si aplica
```

### `deploy.md`
```
// turbo-all
1. Verificar build: npm run build
2. Push a GitHub: git add . && git commit && git push
3. Vercel despliega automáticamente
```

---

## 5. Fases de Implementación

### Phase 1: Foundation (estimado: 1 sesión)
- Inicializar Next.js con `npx create-next-app`
- Configurar Supabase: crear proyecto, ejecutar schema SQL
- Design tokens + layout base (sidebar, header)
- Auth: login con Supabase Auth  
- Página de inicio vacía (placeholder dashboards)

### Phase 2: Core — Contenedores + Packing Lists (estimado: 2-3 sesiones)
- CRUD de contenedores
- Generación automática de código (`HK-2026-001`)
- Flujo de estados con UI visual
- Importador de Excel (drag & drop + preview + mapeo de columnas)
- Tabla de packing list con edición inline

### Phase 3: Core — Clientes + Etiquetas (estimado: 1-2 sesiones)
- CRUD de clientes con ficha expandible
- Sistema de etiquetas con normalización y sugerencias
- Asignación de clientes/etiquetas a items del packing list
- Consultas: vista por cliente (contenedores, items), vista por etiqueta

### Phase 4: Calculadoras (estimado: 2-3 sesiones)
- Motor de cálculo de costos (`engine.js`)
- UI de la matriz dinámica (toggle filas, editar valores, cambiar tipo)
- Doble salida: real vs. cliente (copia editable)
- Distribución de costos por cliente (proporcional a volumen)
- Cálculo volumétrico (cajas en container)
- Integración API tipo de cambio (DolarAPI.com)
- Selector de tipo de dólar + registro histórico

### Phase 5: Views & Export (estimado: 1-2 sesiones)
- Dashboard general (contenedores activos, próximos ETAs)
- Dashboard contenedores (filtros, estados)
- Dashboard clientes (indicadores, drill-down)
- Exportación a Excel por contenedor y por cliente
- Vista de histórico (contenedores finalizados)

---

## 6. Verificación

### Automatizada
- **Build check**: `npm run build` debe completar sin errores en cada fase
- **Lint**: ESLint configurado con reglas de Next.js

### Manual (por fase)
| Fase | Verificación |
|---|---|
| 1 | Login funciona, layout se renderiza, navegación funcional |
| 2 | Crear contenedor → importar Excel → ver packing list completo |
| 3 | Crear cliente → asignar a items → consultar ficha con contenedores |
| 4 | Cargar valores → calcular → comparar salida real vs cliente → volumétrico correcto |
| 5 | Dashboards muestran datos reales → export genera .xlsx válido |

### Browser Testing
- Cada fase se verificará visualmente con el browser tool
- Se validará que la UI sea usable para usuarios con habilidades básicas (botones grandes, labels claros, feedback visual)

> [!IMPORTANT]
> No hay tests unitarios planificados para v1 dado que es un MVP. La verificación es manual + build checks. Se pueden agregar tests en iteraciones futuras.
