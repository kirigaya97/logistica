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
    '20': { label: "20'", lengthCm: 589, widthCm: 235, heightCm: 239, maxWeightKg: 28200 },
    '40': { label: "40'", lengthCm: 1203, widthCm: 235, heightCm: 239, maxWeightKg: 28600 },
    '40HC': { label: "40' HC", lengthCm: 1203, widthCm: 235, heightCm: 269, maxWeightKg: 28400 },
}

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
