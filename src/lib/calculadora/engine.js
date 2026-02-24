/**
 * Motor de cálculo de costos de importación.
 * Función pura: recibe inputs + matrix, devuelve resultados.
 * NO redondear valores intermedios.
 */

export function calculateCosts(inputs, costItems) {
    const { fobTotal } = inputs
    const items = costItems.map(item => ({ ...item }))

    // Step 1: CIF = FOB + sum of active CIF items
    const cifItems = items.filter(i => i.category === '1_cif' && i.isActive)
    cifItems.forEach(item => {
        item.calculatedValue = item.value
    })
    const cif = fobTotal + cifItems.reduce((sum, i) => sum + i.calculatedValue, 0)

    // Step 2: Tributos (% of CIF)
    const tributoItems = items.filter(i => i.category === '2_tributos' && i.isActive)
    tributoItems.forEach(item => {
        item.calculatedValue = cif * (item.value / 100)
    })
    const totalTributos = tributoItems.reduce((sum, i) => sum + i.calculatedValue, 0)

    // Step 3: Base Imponible = CIF + Tributos
    const baseImponible = cif + totalTributos

    // Step 4: Impuestos (% of Base Imponible)
    const impuestoItems = items.filter(i => i.category === '3_impuestos' && i.isActive)
    impuestoItems.forEach(item => {
        item.calculatedValue = baseImponible * (item.value / 100)
    })
    const totalImpuestos = impuestoItems.reduce((sum, i) => sum + i.calculatedValue, 0)

    // Step 5: Gastos Operativos
    const gastosItems = items.filter(i => i.category === '4_gastos_op' && i.isActive)

    // First pass: fixed values and costos_agencia-based
    const costosAgencia = gastosItems.find(i => i.name === 'Costos Agencia')
    gastosItems.forEach(item => {
        if (item.valueType === 'fixed') {
            item.calculatedValue = item.value
        } else if (item.base === 'costos_agencia' && costosAgencia) {
            item.calculatedValue = costosAgencia.value * (item.value / 100)
        }
    })

    // Pre-calculate subtotal for Imp. Transf. base
    const preTransfTotal = gastosItems
        .filter(i => i.name !== 'Imp. Transf.')
        .reduce((sum, i) => sum + (i.calculatedValue ?? 0), 0)

    // Second pass: total_gastos_locales-based (Imp. Transf.)
    gastosItems.forEach(item => {
        if (item.base === 'total_gastos_locales') {
            item.calculatedValue = preTransfTotal * (item.value / 100)
        }
    })

    const totalGastosOp = gastosItems.reduce((sum, i) => sum + (i.calculatedValue ?? 0), 0)

    // Step 6: Gastos Externos
    const gastosExtItems = items.filter(i => i.category === '5_gastos_ext' && i.isActive)
    gastosExtItems.forEach(item => {
        item.calculatedValue = item.value
    })
    const totalGastosExt = gastosExtItems.reduce((sum, i) => sum + i.calculatedValue, 0)

    // Step 7: Total
    const costoTotal = cif + totalTributos + totalImpuestos + totalGastosOp + totalGastosExt

    return {
        fobTotal,
        cif,
        baseImponible,
        totalTributos,
        totalImpuestos,
        totalGastosOp,
        totalGastosExt,
        costoTotal,
        items,
    }
}

/**
 * Genera la versión "cliente" aplicando overrides.
 */
export function applyClientOverrides(result) {
    const clientItems = result.items
        .filter(item => {
            const active = item.clientActive !== null && item.clientActive !== undefined
                ? item.clientActive
                : item.isActive
            return active || item.clientOnly
        })
        .map(item => ({
            ...item,
            displayName: item.clientLabel || item.name,
            displayValue: item.clientValue !== null && item.clientValue !== undefined
                ? item.clientValue
                : item.calculatedValue,
        }))

    return clientItems
}

/**
 * Distribuye costo entre clientes por volumen.
 */
export function distributeByClient(costoTotal, exchangeRate, clients) {
    const totalVolume = clients.reduce((sum, c) => sum + c.volumeM3, 0)
    if (totalVolume === 0) return []

    return clients.map(client => {
        const proportion = client.volumeM3 / totalVolume
        const costUSD = costoTotal * proportion
        const costARS = exchangeRate ? costUSD * exchangeRate : null

        return {
            clientId: client.clientId,
            clientName: client.clientName,
            volumeM3: client.volumeM3,
            proportion: Math.round(proportion * 10000) / 100,
            costUSD: Math.round(costUSD * 100) / 100,
            costARS: costARS ? Math.round(costARS * 100) / 100 : null,
        }
    })
}
