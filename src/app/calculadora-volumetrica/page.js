import VolumetricCalc from '@/components/calculadora/VolumetricCalc'

export default function VolumetricaPage() {
    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Calculadora Volumétrica</h1>
            <p className="text-gray-500 text-sm mb-6">
                Calculá cuántas cajas de un tamaño dado caben en un contenedor.
            </p>
            <VolumetricCalc />
        </div>
    )
}
