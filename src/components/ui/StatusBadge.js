import { CONTAINER_STATES } from '@/lib/constants'

export default function StatusBadge({ status }) {
    const state = CONTAINER_STATES[status]
    if (!state) return null

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${state.color}`}>
            {state.label}
        </span>
    )
}
