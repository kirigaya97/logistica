/**
 * Calcula cuántas cajas caben en un contenedor.
 * @param {Object} container - { lengthCm, widthCm, heightCm, maxWeightKg }
 * @param {Object} box - { lengthCm, widthCm, heightCm, weightKg }
 * @returns {Object} resultado del cálculo
 */
export function calculateVolumetric(container, box) {
    if (!container || !box) return null
    if (box.lengthCm <= 0 || box.widthCm <= 0 || box.heightCm <= 0) return null

    const boxesLength = Math.floor(container.lengthCm / box.lengthCm)
    const boxesWidth = Math.floor(container.widthCm / box.widthCm)
    const boxesHeight = Math.floor(container.heightCm / box.heightCm)

    const totalBoxes = boxesLength * boxesWidth * boxesHeight
    const totalWeight = totalBoxes * box.weightKg
    const isValid = totalWeight <= container.maxWeightKg

    const volumeUsedM3 = (
        (boxesLength * box.lengthCm) *
        (boxesWidth * box.widthCm) *
        (boxesHeight * box.heightCm)
    ) / 1000000

    const containerVolumeM3 = (
        container.lengthCm * container.widthCm * container.heightCm
    ) / 1000000

    const utilizationPct = (volumeUsedM3 / containerVolumeM3) * 100

    return {
        boxesLength,
        boxesWidth,
        boxesHeight,
        totalBoxes,
        totalWeight,
        isValid,
        volumeUsedM3: Math.round(volumeUsedM3 * 100) / 100,
        containerVolumeM3: Math.round(containerVolumeM3 * 100) / 100,
        utilizationPct: Math.round(utilizationPct * 10) / 10,
        weightUtilizationPct: Math.round((totalWeight / container.maxWeightKg) * 1000) / 10,
    }
}
