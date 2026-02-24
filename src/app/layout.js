import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import CommandPalette from '@/components/layout/CommandPalette'
import { MobileMenuProvider } from '@/components/layout/MobileMenuContext'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Logística Internacional',
  description: 'Sistema de gestión de logística internacional',
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthenticated = !!user

  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        {isAuthenticated ? (
          <MobileMenuProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 lg:ml-64">
                <Header />
                <CommandPalette />
                <main className="p-4 md:p-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
                  {children}
                </main>
              </div>
            </div>
          </MobileMenuProvider>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
