import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Logística Internacional',
  description: 'Sistema de gestión de logística internacional',
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si no hay usuario, no mostrar layout completo (login tiene su propio layout)
  const isAuthenticated = !!user

  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        {isAuthenticated ? (
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-64">
              <Header />
              <main className="p-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
                {children}
              </main>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
