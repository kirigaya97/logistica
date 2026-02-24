import { createClient } from '@/lib/supabase/server'
import { Container, Users, Ship, Calendar } from 'lucide-react'
import { WAREHOUSES, CONTAINER_STATES } from '@/lib/constants'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Get counts
  const { count: totalContainers } = await supabase
    .from('containers')
    .select('*', { count: 'exact', head: true })

  const { count: activeClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  const { data: transitContainers } = await supabase
    .from('containers')
    .select('*')
    .eq('status', 'transito')
    .order('eta', { ascending: true })

  // 2. Fetch volume in transit (requires joining with items)
  // For simplicity and performance, we'll sum the volume_m3 of items in packing_lists assigned to transit containers
  const { data: transitItems } = await supabase
    .from('packing_list_items')
    .select('volume_m3, packing_lists!inner(containers!inner(status))')
    .eq('packing_lists.containers.status', 'transito')

  const totalTransitVolume = transitItems?.reduce((sum, item) => sum + (parseFloat(item.volume_m3) || 0), 0) || 0

  // 3. Distribution by origin (active containers)
  const { data: originData } = await supabase
    .from('containers')
    .select('origin_warehouse')
    .neq('status', 'finalizado')

  const originCounts = {}
  Object.keys(WAREHOUSES).forEach(k => originCounts[k] = 0)
  originData?.forEach(c => {
    if (originCounts[c.origin_warehouse] !== undefined) {
      originCounts[c.origin_warehouse]++
    }
  })

  const activeTotal = originData?.length || 0

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Card: Contenedores */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Container className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Contenedores</p>
              <p className="text-2xl font-bold text-gray-800">{totalContainers || 0}</p>
            </div>
          </div>
        </div>

        {/* Card: Clientes */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Clientes Activos</p>
              <p className="text-2xl font-bold text-gray-800">{activeClients || 0}</p>
            </div>
          </div>
        </div>

        {/* Card: En Tránsito */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Ship className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En Tránsito</p>
              <p className="text-2xl font-bold text-gray-800">{transitContainers?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Card: Volumen en Tránsito */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Volumen en Tránsito</p>
              <p className="text-2xl font-bold text-gray-800">{totalTransitVolume.toFixed(2)} m³</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximos Arribos */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Ship className="w-5 h-5 text-blue-600" />
            Próximos Arribos
          </h2>

          {transitContainers && transitContainers.length > 0 ? (
            <div className="space-y-4">
              {transitContainers.slice(0, 5).map(c => {
                const wh = WAREHOUSES[c.origin_warehouse]
                return (
                  <Link
                    key={c.id}
                    href={`/contenedores/${c.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{wh?.flag}</span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{c.code}</p>
                        <p className="text-xs text-gray-500">{wh?.label} · {c.container_type}'</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">ETA Estimado</p>
                      <p className="text-sm font-semibold text-blue-700">
                        {c.eta ? new Date(c.eta).toLocaleDateString('es-AR') : '—'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Ship className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">No hay contenedores en tránsito</p>
            </div>
          )}
        </div>

        {/* Resumen por Almacén */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Container className="w-5 h-5 text-blue-600" />
            Distribución por Origen
          </h2>
          <div className="space-y-6">
            {Object.entries(WAREHOUSES).map(([key, wh]) => {
              const count = originCounts[key] || 0
              const pct = activeTotal > 0 ? (count / activeTotal) * 100 : 0
              return (
                <div key={key}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-gray-700">{wh.flag} {wh.label}</span>
                    <span className="text-xs font-bold text-blue-600">{count} cont.</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-6 text-xs text-gray-400 italic">
            * Se muestran todos los contenedores activos vinculados a cada terminal de origen.
          </p>
        </div>
      </div>
    </div>
  )
}
