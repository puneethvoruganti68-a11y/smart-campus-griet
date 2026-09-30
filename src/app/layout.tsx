import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Smart Campus | GRIET',
  description: 'GRIET Smart Campus Issue Management Platform. Report campus problems in seconds.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
