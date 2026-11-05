import Topbar from "./components/Topbar"
import ToasterProvider from "./providers/ToasterProvider"
import "./globals.css"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Figtree } from "next/font/google";
import { cn } from "@/lib/utils";
import { CadastroModalProvider } from "@/lib/cadastroModal/CadastroModalProvider"

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const SESSAO_DEV = {
    id: 1,
    usuario: 'dev',
    nome: 'Desenvolvedor',
    email: 'dev@local',
    perfilId: 1,
    perfil: 'SUPER_ADMIN',
    nivelPerfil: 99,
    fotoPerfil: null,
}

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
          <CadastroModalProvider>
            <Topbar sessao={SESSAO_DEV}>
              {children}
            </Topbar>
          </CadastroModalProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}