import './globals.css'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { BrandingProvider } from '@/context/BrandingContext'

export const metadata = {
  title: 'Rua Sadiq Portal',
  description: 'Admin portal for product, category and material management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen portal-page-bg text-white antialiased">
        <AdminAuthProvider>
          <BrandingProvider>{children}</BrandingProvider>
        </AdminAuthProvider>
      </body>
    </html>
  )
}
