import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./contexts/auth-context"
import { ProcessProvider } from "./contexts/process-context"
import AuthWrapper from "./components/auth-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ProcessFlow - Modelador de Processos BPMN | Powered by bpmn.io",
  description:
    "Plataforma profissional para modelagem, execução e gestão de processos BPMN 2.0. Transforme suas ideias em fluxos de trabalho eficientes com a tecnologia bpmn.io.",
  keywords: "BPMN, processos de negócio, modelagem, workflow, bpmn.io, automação, BPM",
  authors: [{ name: "ProcessFlow Team" }],
  openGraph: {
    title: "ProcessFlow - Modelador de Processos BPMN",
    description: "Plataforma profissional powered by bpmn.io para modelagem e execução de processos BPMN 2.0",
    type: "website",
    locale: "pt_BR",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <ProcessProvider>
            <AuthWrapper>{children}</AuthWrapper>
          </ProcessProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
