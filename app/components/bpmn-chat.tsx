"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Bug,
  Wifi,
  WifiOff,
  Settings,
  Cpu,
} from "lucide-react"

interface BpmnChatProps {
  currentBpmnXml?: string
  onBpmnUpdate?: (xml: string) => void
}

export default function BpmnChat({ currentBpmnXml, onBpmnUpdate }: BpmnChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [lastUpdateStatus, setLastUpdateStatus] = useState<"success" | "error" | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "error" | "testing">("connected")
  const [apiStatus, setApiStatus] = useState<any>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      currentBpmnXml,
    },
    onFinish: (message) => {
      console.log("🤖 Chat: Resposta da IA recebida")
      setConnectionStatus("connected")

      // Extrair XML BPMN da resposta
      const xmlMatch = message.content.match(/<BPMN_START>([\s\S]*?)<BPMN_END>/)

      if (xmlMatch && xmlMatch[1]) {
        const extractedXml = xmlMatch[1].trim()
        console.log("✅ Chat: XML extraído com sucesso")
        setDebugInfo(`XML extraído: ${extractedXml.length} chars`)

        if (onBpmnUpdate) {
          try {
            onBpmnUpdate(extractedXml)
            setLastUpdateStatus("success")
            setDebugInfo((prev) => prev + " | Update: SUCCESS")
            setTimeout(() => setLastUpdateStatus(null), 5000)
          } catch (error) {
            console.error("❌ Chat: Erro ao atualizar diagrama:", error)
            setLastUpdateStatus("error")
            setDebugInfo((prev) => prev + " | Update: ERROR")
            setTimeout(() => setLastUpdateStatus(null), 5000)
          }
        }
      } else {
        console.warn("⚠️ Chat: XML não encontrado na resposta")
        setDebugInfo("XML não encontrado na resposta")
      }
    },
    onError: (error) => {
      console.error("❌ Chat: Erro na API:", error)
      setConnectionStatus("error")
      setLastUpdateStatus("error")
      setDebugInfo(`Erro: ${error.message}`)

      setTimeout(() => {
        setLastUpdateStatus(null)
        setConnectionStatus("connected")
      }, 10000)
    },
  })

  // Teste de conexão
  const testConnection = async () => {
    setConnectionStatus("testing")
    setDebugInfo("Testando API...")

    try {
      const response = await fetch("/api/chat", {
        method: "GET",
      })

      if (response.ok) {
        const status = await response.json()
        setApiStatus(status)
        setConnectionStatus("connected")
        setDebugInfo(`API OK - Mode: ${status.mode}`)
        console.log("✅ Chat: API test OK:", status)
      } else {
        setConnectionStatus("error")
        setDebugInfo(`API Error ${response.status}`)
      }
    } catch (error) {
      setConnectionStatus("error")
      setDebugInfo(`Network Error: ${error instanceof Error ? error.message : "Unknown"}`)
    }
  }

  // Teste automático na inicialização
  useEffect(() => {
    testConnection()
  }, [])

  // Auto scroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const quickPrompts = [
    "Crie um processo simples",
    "Processo de aprovação",
    "Fluxo com gateway",
    "Processo de compras",
    "Adicione decisão",
    "Processo personalizado",
  ]

  const handleQuickPrompt = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as any)
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const extractXmlFromMessage = (content: string) => {
    const xmlMatch = content.match(/<BPMN_START>([\s\S]*?)<BPMN_END>/)
    if (xmlMatch && xmlMatch[1]) {
      return xmlMatch[1].trim()
    }
    return null
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Chat IA BPMN
          <Sparkles className="h-4 w-4 ml-2" />
          {connectionStatus === "error" && <WifiOff className="h-3 w-3 ml-1 text-red-200" />}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] flex flex-col">
      <Card className="flex-1 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Chat IA BPMN
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                <Cpu className="h-3 w-3 mr-1" />
                Local
              </Badge>
              {connectionStatus === "connected" && <Wifi className="h-4 w-4 text-green-200" />}
              {connectionStatus === "error" && <WifiOff className="h-4 w-4 text-red-200" />}
              {connectionStatus === "testing" && <RefreshCw className="h-4 w-4 text-yellow-200 animate-spin" />}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={testConnection}
                className="text-white hover:bg-white/20 text-xs"
                disabled={connectionStatus === "testing"}
              >
                <Settings className="h-3 w-3 mr-1" />
                Testar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Status da API */}
          {apiStatus && (
            <div className="mt-2 text-xs">
              <div className="bg-white/10 rounded p-2">
                <div>Status: {apiStatus.status}</div>
                <div>Mode: {apiStatus.mode}</div>
                <div>Time: {new Date(apiStatus.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          {/* Status de conexão */}
          {connectionStatus === "error" && (
            <div className="mt-2">
              <Alert className="bg-red-100 border-red-300 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">Erro de conexão com a API local.</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Status de atualização */}
          {lastUpdateStatus && (
            <div className="mt-2">
              {lastUpdateStatus === "success" ? (
                <Alert className="bg-green-100 border-green-300 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="text-xs">Diagrama atualizado!</AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-red-100 border-red-300 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">Erro ao atualizar</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Debug Info */}
          {debugInfo && (
            <div className="mt-2">
              <Alert className="bg-yellow-100 border-yellow-300 text-yellow-800">
                <Bug className="h-4 w-4" />
                <AlertDescription className="text-xs">{debugInfo}</AlertDescription>
              </Alert>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {messages.length === 0 ? (
            <div className="flex-1 p-4 flex flex-col justify-center">
              <div className="text-center mb-6">
                <Bot className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold text-gray-900 mb-2">Assistente BPMN Local 🤖</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Crie diagramas BPMN usando templates inteligentes! Funciona sem configuração externa.
                </p>

                {connectionStatus === "error" && (
                  <div className="mb-4">
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-sm text-red-700">
                        ⚠️ Erro de conexão. Clique em "Testar" para verificar.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">💡 Experimente:</p>
                {quickPrompts.slice(0, 3).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="w-full text-left justify-start text-xs h-auto py-2 px-3"
                    disabled={connectionStatus === "error"}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content.replace(/<BPMN_START>[\s\S]*?<BPMN_END>/g, "").trim()}
                      </div>

                      {message.role === "assistant" && extractXmlFromMessage(message.content) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              Diagrama BPMN
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(extractXmlFromMessage(message.content)!, index)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedIndex === index ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 max-h-20 overflow-y-auto">
                            {extractXmlFromMessage(message.content)?.substring(0, 200)}...
                          </div>
                        </div>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-white animate-spin" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {messages.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <div className="flex gap-1 mb-2 overflow-x-auto">
                {quickPrompts.slice(3).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-xs whitespace-nowrap flex-shrink-0"
                    disabled={connectionStatus === "error"}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  connectionStatus === "error" ? "Erro de conexão - clique em Testar" : "Descreva o processo BPMN..."
                }
                disabled={isLoading || connectionStatus === "error"}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim() || connectionStatus === "error"}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Funciona com templates locais - sem necessidade de configuração externa
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
