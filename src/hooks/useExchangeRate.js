'use client'
import { useState, useEffect } from 'react'

export function useExchangeRate() {
    const [rates, setRates] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch('/api/exchange-rate')
            .then(r => {
                if (!r.ok) throw new Error('Error al obtener cotizaciones')
                return r.json()
            })
            .then(setRates)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    return { rates, loading, error }
}
