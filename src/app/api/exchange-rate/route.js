export async function GET() {
    try {
        const res = await fetch('https://dolarapi.com/v1/dolares', {
            next: { revalidate: 300 } // Cache 5 minutos
        })
        const data = await res.json()
        return Response.json(data)
    } catch (error) {
        return Response.json(
            { error: 'Error al obtener tipos de cambio' },
            { status: 500 }
        )
    }
}
