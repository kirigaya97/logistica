---
name: exchange-rate
description: Integration with DolarAPI.com for exchange rates
---

# Exchange Rate Integration

## API: DolarAPI.com

Free, no authentication required, public API for Argentine dollar rates.

### Endpoints

| Endpoint | Returns |
|---|---|
| `GET https://dolarapi.com/v1/dolares` | All dollar types |
| `GET https://dolarapi.com/v1/dolares/blue` | Blue dollar only |
| `GET https://dolarapi.com/v1/dolares/oficial` | Official dollar only |
| `GET https://dolarapi.com/v1/dolares/bolsa` | MEP/Bolsa dollar |
| `GET https://dolarapi.com/v1/dolares/contadoconliqui` | CCL dollar |

### Response Format
```json
{
  "moneda": "USD",
  "casa": "blue",
  "nombre": "Blue",
  "compra": 1180,
  "venta": 1200,
  "fechaActualizacion": "2026-02-24T12:00:00.000Z"
}
```

## Implementation

### API Route (Proxy)
```javascript
// src/app/api/exchange-rate/route.js
export async function GET() {
  const res = await fetch('https://dolarapi.com/v1/dolares', {
    next: { revalidate: 300 } // Cache for 5 minutes
  })
  const data = await res.json()
  return Response.json(data)
}
```

### Client Hook
```javascript
// src/hooks/useExchangeRate.js
'use client'
import { useState, useEffect } from 'react'

export function useExchangeRate() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(r => r.json())
      .then(setRates)
      .finally(() => setLoading(false))
  }, [])
  
  return { rates, loading }
}
```

Note: This is one of the few acceptable uses of useEffect for data fetching — exchange rates are external data that changes frequently and doesn't need SSR.

### Storing Exchange Rate with Container
When a container operation uses an exchange rate, store it directly:
```sql
UPDATE containers SET
  exchange_rate = 1200.00,
  exchange_rate_type = 'blue'
WHERE id = 'container-uuid';
```

### Historical Record
```sql
INSERT INTO exchange_rates (rate_type, buy, sell)
VALUES ('blue', 1180.00, 1200.00);
```

## User Interface
- Display a dropdown/select with all available dollar types
- Show buy/sell prices next to the selector
- Allow manual override (user can type a custom rate)
- When "locking" a rate for a container, save both the rate and the type

## DO NOT
- Do NOT call DolarAPI.com directly from the client — use the API proxy route
- Do NOT cache rates for more than 5 minutes
- Do NOT forget to store the exchange rate type alongside the rate value
