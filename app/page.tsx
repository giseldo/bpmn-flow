"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "./contexts/auth-context"
import { Users, Workflow, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"modeler" | "executor">("modeler")
  const [isClient, setIsClient] = useState(false)
  const { login } = useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, userType)
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Workflow className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Bem-vindo ao ProcessFlow</CardTitle>
            <CardDescription>Faça login para acessar o modelador de processos BPMN</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userType">Tipo de Usuário</Label>
                <Select value={userType} onValueChange={(value: "modeler" | "executor") => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modeler">
                      <div className="flex items-center gap-2">
                        <Workflow className="h-4 w-4" />
                        Modelador de Processos
                      </div>
                    </SelectItem>
                    <SelectItem value="executor">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Executor de Processos
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Entrar no ProcessFlow
              </Button>
            </form>
            <div className="mt-6 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Acesso de demonstração:</p>
              <div className="space-y-1">
                <p>• Use qualquer email e senha para testar</p>
                <p>• Escolha o tipo de usuário apropriado</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <Link href="/landing">
                <Button variant="outline" className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Ver Página Inicial
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Hero Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="mb-8">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wveOezkQxgdf76ZtU6UUi793q1AzAZ.png"
              alt="ProcessFlow BPMN Editor"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Modele Processos com Excelência</h2>
          <p className="text-lg text-gray-600 mb-6">
            Plataforma profissional powered by bpmn.io para modelagem e execução de processos BPMN 2.0
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Padrão BPMN 2.0
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Editor bpmn.io
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Execução em tempo real
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
