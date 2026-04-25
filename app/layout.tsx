import Sidebar from "./components/Sidebar"
import ToasterProvider from "./providers/ToasterProvider"
import "./globals.css"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Figtree } from "next/font/google";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={cn("font-sans", figtree.variable)}>
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