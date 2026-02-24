/** @context Configuration for the JIT Context Assembly mapper script */

export default {
  // Directories to completely ignore during traversal
  ignore: [
    'node_modules', '.next', '.git', '.husky', '.agents',
    'coverage', 'dist', '.vercel', '.gemini', 'scripts'
  ],

  // File extensions considered as "code" for analysis
  codeExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.css', '.sql'],

  // Maximum directory depth to scan
  maxDepth: 5,

  // Minimum code files in a directory to generate _CONTEXT.md
  minFilesForContext: 1,

  // Generated file names
  routerFile: 'AI_ROUTER.md',
  contextFile: '_CONTEXT.md',

  // Project metadata (used in AI_ROUTER.md header)
  projectMeta: {
    name: 'Logística Internacional',
    description: 'Sistema de gestión de logística internacional con 3 depósitos (HK, CH, USA). Seguimiento de contenedores, clasificación de mercadería, cálculo de costos de importación, dashboards operativos.',
    stack: 'Next.js 14 (App Router) · Supabase (PostgreSQL) · Vercel · Tailwind CSS',
    conventions: [
      'Componentes: PascalCase (ContainerForm.js)',
      'Libs/utils: camelCase (exchangeRate.js)',
      'Tablas DB: snake_case (packing_list_items)',
      'Rutas URL: kebab-case (/calculadora-volumetrica)',
      'Server Components por defecto, "use client" solo para interactividad',
      'Validación: Zod en server actions',
      'UI en español · Monedas: USD y ARS'
    ]
  },

  // Gemini CLI configuration
  gemini: {
    enabled: true,
    // Prompt language for context generation
    language: 'es',
    // Maximum file size (bytes) to send to Gemini CLI for analysis
    maxFileSizeBytes: 50000,
  }
}
