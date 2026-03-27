import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
          {children}
      </body>
    </html>
  )
}