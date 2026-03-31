import Sidebar from "./components/Sidebar"
import ToasterProvider from "./providers/ToasterProvider"
import "./globals.css"
import { NuqsAdapter } from "nuqs/adapters/next/app"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <NuqsAdapter>
          <ToasterProvider />
          <Sidebar>
            {children}
          </Sidebar>
        </NuqsAdapter>
      </body>
    </html>
  )
}