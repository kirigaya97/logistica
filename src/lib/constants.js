export const CONTAINER_STATES = {
    deposito: { label: 'En Depósito', color: 'bg-yellow-100 text-yellow-800' },
    transito: { label: 'En Tránsito', color: 'bg-blue-100 text-blue-800' },
    aduana: { label: 'En Aduana', color: 'bg-orange-100 text-orange-800' },
    finalizado: { label: 'Finalizado', color: 'bg-green-100 text-green-800' },
}

export const WAREHOUSES = {
    HK: { label: 'Hong Kong', flag: '🇭🇰' },
    CH: { label: 'China', flag: '🇨🇳' },
    USA: { label: 'Estados Unidos', flag: '🇺🇸' },
}

export const CONTAINER_TYPES = {
    '40HC': { label: "40' HC", lengthCm: 1201, widthCm: 233, heightCm: 269 },
    '40ST': { label: "40' Standard", lengthCm: 1201, widthCm: 233, heightCm: 269 },
}

export const WEIGHT_CAPACITIES_TN = [10, 12, 14, 16, 18, 20, 22, 24]

export const NAV_GROUPS = [
    {
        title: 'Gestión',
        items: [
            { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
            { href: '/contenedores', label: 'Contenedores', icon: 'Container' },
        ]
    },
    {
        title: 'Herramientas',
        items: [
            { href: '/calculadora-costos', label: 'Simulador Costos', icon: 'Calculator' },
            { href: '/calculadora-volumetrica', label: 'Cubicaje', icon: 'Box' },
        ]
    },
    {
        title: 'Maestros',
        items: [
            { href: '/clientes', label: 'Clientes', icon: 'Users' },
            { href: '/etiquetas', label: 'Etiquetas', icon: 'Tags' },
        ]
    },
    {
        title: 'Historial',
        items: [
            { href: '/historico', label: 'Histórico', icon: 'Archive' },
        ]
    }
]
