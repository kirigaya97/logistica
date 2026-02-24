import { createClient } from '@/lib/supabase/server'

export default async function Header() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <div>
                {/* Breadcrumbs se agregarán después */}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                    {user?.email}
                </span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    )
}
