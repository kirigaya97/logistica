export const DEFAULT_COST_MATRIX = [
    // Category 1: CIF components (fixed, from inputs)
    { category: '1_cif', name: 'Flete Oceánico', valueType: 'fixed', base: 'input', value: 0, isActive: true, sortOrder: 1 },
    { category: '1_cif', name: 'BAF', valueType: 'fixed', base: 'input', value: 0, isActive: true, sortOrder: 2 },
    { category: '1_cif', name: 'Seguro', valueType: 'fixed', base: 'input', value: 0, isActive: true, sortOrder: 3 },

    // Category 2: Tributes (% of CIF)
    { category: '2_tributos', name: 'Derechos', valueType: 'percentage', base: 'cif', value: 12.6, isActive: true, sortOrder: 10 },
    { category: '2_tributos', name: 'Tasa Estadística', valueType: 'percentage', base: 'cif', value: 3, isActive: true, sortOrder: 11 },

    // Category 3: Taxes (% of Base Imponible)
    { category: '3_impuestos', name: 'IVA', valueType: 'percentage', base: 'base_imponible', value: 21, isActive: true, sortOrder: 20 },
    { category: '3_impuestos', name: 'Percepción IVA', valueType: 'percentage', base: 'base_imponible', value: 20, isActive: true, sortOrder: 21 },
    { category: '3_impuestos', name: 'Percepción Ganancias', valueType: 'percentage', base: 'base_imponible', value: 6, isActive: true, sortOrder: 22 },
    { category: '3_impuestos', name: 'Percepción IIBB', valueType: 'percentage', base: 'base_imponible', value: 3, isActive: true, sortOrder: 23 },

    // Category 4: Operating costs (fixed or %)
    { category: '4_gastos_op', name: 'Costos Agencia', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 30 },
    { category: '4_gastos_op', name: 'IVA s/ Agencia', valueType: 'percentage', base: 'costos_agencia', value: 10.5, isActive: true, sortOrder: 31 },
    { category: '4_gastos_op', name: 'Terminal Portuaria', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 32 },
    { category: '4_gastos_op', name: 'Acarreo GBA', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 33 },
    { category: '4_gastos_op', name: 'Honorarios Despacho', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 34 },
    { category: '4_gastos_op', name: 'Gastos Despacho', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 35 },
    { category: '4_gastos_op', name: 'Gastos Bancarios', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 36 },
    { category: '4_gastos_op', name: 'Gastos Bancarios Ext.', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 37 },
    { category: '4_gastos_op', name: 'Imp. Transf.', valueType: 'percentage', base: 'total_gastos_locales', value: 1.2, isActive: true, sortOrder: 38 },

    // Category 5: External operating costs
    { category: '5_gastos_ext', name: 'Agentes Exterior', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 40 },
    { category: '5_gastos_ext', name: 'Depósito Ext.', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 41 },
    { category: '5_gastos_ext', name: 'Fee', valueType: 'fixed', base: null, value: 0, isActive: true, sortOrder: 42 },
]

export const CATEGORY_LABELS = {
    '1_cif': 'CIF (Costo, Seguro y Flete)',
    '2_tributos': 'Tributos',
    '3_impuestos': 'Impuestos',
    '4_gastos_op': 'Gastos Operativos',
    '5_gastos_ext': 'Gastos Externos',
}
