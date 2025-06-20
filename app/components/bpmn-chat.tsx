"use client"

import { useState, useRef, useEffect } from "react"
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

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  bpmnXml?: string
}

export default function BpmnChat({ currentBpmnXml, onBpmnUpdate }: BpmnChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [lastUpdateStatus, setLastUpdateStatus] = useState<"success" | "error" | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "error" | "testing">("connected")
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          currentBpmnXml
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: data.id,
        role: 'assistant',
        content: data.content,
        bpmnXml: data.bpmnXml
      }

      setMessages(prev => [...prev, assistantMessage])
      setConnectionStatus("connected")

      // Processar XML BPMN se presente
      if (data.bpmnXml && onBpmnUpdate) {
        try {
          console.log("🔄 Chat: Chamando onBpmnUpdate com XML")
          onBpmnUpdate(data.bpmnXml)
          console.log("✅ Chat: onBpmnUpdate executado com sucesso")
          setLastUpdateStatus("success")
          setDebugInfo(`XML processado: ${data.bpmnXml.length} chars`)
          setTimeout(() => setLastUpdateStatus(null), 5000)
        } catch (error) {
          console.error("❌ Chat: Erro ao atualizar diagrama:", error)
          setLastUpdateStatus("error")
          setDebugInfo(`Erro ao atualizar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
          setTimeout(() => setLastUpdateStatus(null), 5000)
        }
      } else if (!data.bpmnXml) {
        setDebugInfo("Nenhum XML BPMN encontrado na resposta")
      }

    } catch (error) {
      console.error("❌ Chat: Erro na API:", error)
      setConnectionStatus("error")
      setLastUpdateStatus("error")
      setDebugInfo(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)

      setTimeout(() => {
        setLastUpdateStatus(null)
        setConnectionStatus("connected")
      }, 10000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

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

  const actionPrompts = [
    "Adicione uma tarefa",
    "Adicione um gateway",
    "Adicione um evento final",
    "Modifique o processo",
    "Simplifique o fluxo",
    "Adicione validação",
  ]

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const handleActionPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const applyLastBpmnXml = () => {
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()
    if (lastAssistantMessage?.bpmnXml && onBpmnUpdate) {
      try {
        console.log("🔄 Chat: Aplicando último XML BPMN")
        onBpmnUpdate(lastAssistantMessage.bpmnXml)
        setLastUpdateStatus("success")
        setDebugInfo(`XML aplicado: ${lastAssistantMessage.bpmnXml.length} chars`)
        setTimeout(() => setLastUpdateStatus(null), 3000)
      } catch (error) {
        console.error("❌ Chat: Erro ao aplicar XML:", error)
        setLastUpdateStatus("error")
        setDebugInfo(`Erro ao aplicar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        setTimeout(() => setLastUpdateStatus(null), 5000)
      }
    } else {
      setDebugInfo("Nenhum XML BPMN disponível para aplicar")
      setTimeout(() => setDebugInfo(""), 3000)
    }
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

  const extractXmlFromMessage = (message: Message) => {
    // Se a mensagem já tem bpmnXml como propriedade, usar ela
    if (message.bpmnXml) {
      return message.bpmnXml
    }
    
    // Fallback para extrair do conteúdo (para compatibilidade)
    const xmlMatch = message.content.match(/<BPMN_START>([\s\S]*?)<BPMN_END>/)
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
    <div className="fixed bottom-8 right-8 z-50 w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-auto max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out">
      <Card className="flex-1 shadow-xl border-0 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col h-full">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg flex items-center gap-2 font-bold">
              <Bot className="h-5 w-5" />
              Chat IA BPMN
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30 px-2 py-0.5">
                <Cpu className="h-3 w-3 mr-1" />
                {apiStatus?.mode === "Groq/Grok AI" ? `Grok (${apiStatus?.model || 'llama-3.1-8b-instant'})` : "Configurar API"}
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
                <AlertDescription className="text-xs">Erro de conexão com a API. Verifique a configuração da API Key.</AlertDescription>
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

        <CardContent className="flex-1 flex flex-col h-full p-0 min-h-0">
          {messages.length === 0 ? (
            <div className="flex-1 p-4 flex flex-col justify-center">
              <div className="text-center mb-6">
                <Bot className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold text-gray-900 mb-2">Assistente BPMN IA 🤖</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Crie e modifique diagramas BPMN usando inteligência artificial! Configure sua API Key do DeepSeek para começar.
                </p>

                {connectionStatus === "error" && (
                  <div className="mb-4">
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-sm text-red-700">
                        ⚠️ API Key não configurada. Configure a variável DEEPSEEK_API_KEY.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {connectionStatus === "connected" && (
                  <div className="mb-4">
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-sm text-green-700">
                        ✅ IA conectada! Você pode criar e modificar diagramas conversando.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">💡 Como usar:</p>
                <div className="text-xs text-gray-600 space-y-1 mb-3">
                  <p>• <strong>Criar novo:</strong> "Crie um processo de aprovação"</p>
                  <p>• <strong>Modificar:</strong> "Adicione uma tarefa de validação"</p>
                  <p>• <strong>Atualizar:</strong> Clique em "Aplicar" nas respostas</p>
                  <p>• <strong>Usar botões:</strong> Clique nos botões de ação rápida</p>
                </div>
                
                <p className="text-xs font-medium text-gray-700 mb-2">🚀 Experimente:</p>
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
            <ScrollArea className="flex-1 p-4 max-h-[50vh] min-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 min-h-0" ref={scrollAreaRef}>
              <style jsx>{`
                .scrollbar-thin::-webkit-scrollbar {
                  width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                  background: #60a5fa;
                  border-radius: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                  background: #dbeafe;
                }
              `}</style>
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

                      {message.role === "assistant" && extractXmlFromMessage(message) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              Diagrama BPMN
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (onBpmnUpdate && extractXmlFromMessage(message)) {
                                    onBpmnUpdate(extractXmlFromMessage(message)!)
                                    setLastUpdateStatus("success")
                                    setDebugInfo("Diagrama atualizado!")
                                    setTimeout(() => setLastUpdateStatus(null), 3000)
                                  }
                                }}
                                className="h-6 px-2 text-xs bg-green-100 text-green-700 hover:bg-green-200"
                              >
                                Aplicar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(extractXmlFromMessage(message)!, index)}
                                className="h-6 w-6 p-0"
                              >
                                {copiedIndex === index ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 max-h-20 overflow-y-auto">
                            {extractXmlFromMessage(message)?.substring(0, 200)}...
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

          {/* Rodapé fixo: botões de ação e input */}
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
              {/* Botões de ação rápida */}
              <div className="flex gap-1 mb-2 overflow-x-auto">
                <span className="text-xs text-gray-500 mr-2 flex items-center">Ações:</span>
                {actionPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleActionPrompt(prompt)}
                    className="text-xs whitespace-nowrap flex-shrink-0 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    disabled={connectionStatus === "error"}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
              {/* Botão para aplicar último XML */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyLastBpmnXml}
                  className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  disabled={connectionStatus === "error" || !messages.some(m => m.role === 'assistant' && m.bpmnXml)}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aplicar Último Diagrama
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 border-t bg-white sticky bottom-0 z-10">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  connectionStatus === "error" 
                    ? "Configure a API Key para usar o chat" 
                    : "Ex: 'Crie um processo de aprovação' ou 'Adicione uma tarefa'"
                }
                disabled={isLoading || connectionStatus === "error"}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim() || connectionStatus === "error"}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Configure a variável DEEPSEEK_API_KEY para usar a IA • Clique em "Aplicar" para atualizar o diagrama
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
