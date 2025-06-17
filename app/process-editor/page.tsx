"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "../contexts/auth-context"
import { useProcess, type ProcessDefinition } from "../contexts/process-context"
import { Save, ArrowLeft, Download, Upload, Workflow, ExternalLink, Info, MessageCircle } from "lucide-react"
import Link from "next/link"
import FormEditor from "../components/form-editor"
import BpmnModeler from "../components/bpmn-modeler"
import BpmnChat from "../components/bpmn-chat"

export default function ProcessEditor() {
  const searchParams = useSearchParams()
  const processId = searchParams.get("id")
  const { user } = useAuth()
  const { processes, saveProcess: saveProcessContext } = useProcess()

  const [processName, setProcessName] = useState("")
  const [processDescription, setProcessDescription] = useState("")
  const [selectedElement, setSelectedElement] = useState<any>(null)
  const [forms, setForms] = useState<Record<string, any[]>>({})
  const [bpmnXml, setBpmnXml] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [updateCounter, setUpdateCounter] = useState(0)
  const bpmnModelerRef = useRef<any>(null)

  // Load existing process if editing
  useEffect(() => {
    if (processId) {
      const existingProcess = processes.find((p) => p.id === processId)
      if (existingProcess) {
        setProcessName(existingProcess.name)
        setProcessDescription(existingProcess.description)
        setForms(existingProcess.forms || {})
        if (existingProcess.bpmnXml) {
          console.log("📂 ProcessEditor: Carregando XML existente")
          setBpmnXml(existingProcess.bpmnXml)
        }
      }
    }
    setIsLoading(false)
  }, [processId, processes])

  const handleElementSelect = (element: any) => {
    setSelectedElement(element)
  }

  const handleBpmnChange = (xml: string) => {
    console.log("🔄 ProcessEditor: BPMN changed")
    setBpmnXml(xml)
  }

  const handleBpmnUpdate = (xml: string) => {
    console.log("🤖 ProcessEditor: Recebendo XML do chat")
    console.log("📄 ProcessEditor: XML recebido:", xml.substring(0, 200) + "...")

    // Atualizar o estado
    setBpmnXml(xml)
    setUpdateCounter((prev) => prev + 1)

    // Aguardar um pouco e então forçar atualização do modeler
    setTimeout(() => {
      if (bpmnModelerRef.current) {
        console.log("🔄 ProcessEditor: Tentando atualizar modeler...")
        console.log("🔍 ProcessEditor: Modeler ready?", bpmnModelerRef.current.isReady?.())

        bpmnModelerRef.current
          .importXML(xml)
          .then((result: any) => {
            console.log("✅ ProcessEditor: Modeler atualizado com sucesso!", result)
          })
          .catch((error: any) => {
            console.error("❌ ProcessEditor: Erro ao atualizar modeler:", error)
          })
      } else {
        console.warn("⚠️ ProcessEditor: Modeler ref não disponível")
      }
    }, 200)
  }

  const saveProcess = async () => {
    if (!processName.trim()) {
      alert("Por favor, insira um nome para o processo")
      return
    }

    try {
      // Get current BPMN XML
      let currentXml = bpmnXml
      if (bpmnModelerRef.current) {
        const result = await bpmnModelerRef.current.saveXML({ format: true })
        currentXml = result.xml
      }

      if (!currentXml) {
        alert("Por favor, modele o processo BPMN antes de salvar")
        return
      }

      const processData: ProcessDefinition = {
        id: processId || `process-${Date.now()}`,
        name: processName,
        description: processDescription,
        nodes: [], // Legacy compatibility
        edges: [], // Legacy compatibility
        forms,
        bpmnXml: currentXml,
        createdBy: user?.email || "",
        createdAt: processId
          ? processes.find((p) => p.id === processId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
      }

      saveProcessContext(processData)
      alert("Processo BPMN salvo com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar processo:", error)
      alert("Erro ao salvar o processo. Tente novamente.")
    }
  }

  const exportBpmn = async () => {
    if (bpmnModelerRef.current) {
      try {
        const result = await bpmnModelerRef.current.saveXML({ format: true })
        const blob = new Blob([result.xml], { type: "application/xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${processName || "processo"}.bpmn`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Erro ao exportar BPMN:", error)
        alert("Erro ao exportar. Certifique-se de que o modelo está carregado.")
      }
    }
  }

  const importBpmn = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const xml = e.target?.result as string
        console.log("📁 ProcessEditor: Importando arquivo BPMN")
        setBpmnXml(xml)
        setUpdateCounter((prev) => prev + 1)
      }
      reader.readAsText(file)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando editor bpmn.io...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Workflow className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold">Editor bpmn.io - {processId ? "Editar" : "Novo Processo"}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  Modelador Profissional de Processos BPMN 2.0
                  <Badge variant="secondary" className="text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    bpmn.io
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Chat IA
                  </Badge>
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="file" accept=".bpmn,.xml" onChange={importBpmn} style={{ display: "none" }} id="import-bpmn" />
            <label htmlFor="import-bpmn">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar BPMN
                </span>
              </Button>
            </label>
            <Button variant="outline" size="sm" onClick={exportBpmn}>
              <Download className="h-4 w-4 mr-2" />
              Exportar BPMN
            </Button>
            <Button onClick={saveProcess}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Processo
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="w-80 bg-gray-50 border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>💬 Chat IA:</strong> Use o chat no canto inferior direito para criar e modificar diagramas
                através de conversação natural!
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Propriedades do Processo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Processo</Label>
                  <Input
                    id="name"
                    value={processName}
                    onChange={(e) => setProcessName(e.target.value)}
                    placeholder="Ex: Processo de Aprovação de Férias"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={processDescription}
                    onChange={(e) => setProcessDescription(e.target.value)}
                    placeholder="Descreva o objetivo e escopo do processo de negócio"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {selectedElement && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Propriedades do Elemento
                    <Badge variant="outline" className="ml-2 text-xs">
                      {selectedElement.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>ID do Elemento</Label>
                    <Input value={selectedElement.id} disabled className="font-mono text-xs" />
                  </div>
                  <div>
                    <Label>Nome</Label>
                    <Input value={selectedElement.businessObject?.name || ""} disabled />
                  </div>
                  <div>
                    <Label>Tipo BPMN</Label>
                    <Input value={selectedElement.type} disabled className="font-mono text-xs" />
                  </div>
                  {(selectedElement.type === "bpmn:UserTask" || selectedElement.type === "bpmn:Task") && (
                    <div className="pt-2 border-t">
                      <FormEditor
                        nodeId={selectedElement.id}
                        fields={forms[selectedElement.id] || []}
                        onChange={(fields) => setForms((prev) => ({ ...prev, [selectedElement.id]: fields }))}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Debug Info Melhorado */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm text-blue-800">🔍 Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-700 space-y-1">
                <p>XML State: {bpmnXml ? "✅ Loaded" : "❌ Empty"}</p>
                <p>Modeler Ref: {bpmnModelerRef.current ? "✅ Ready" : "❌ Not Ready"}</p>
                <p>XML Length: {bpmnXml?.length || 0} chars</p>
                <p>Update Counter: {updateCounter}</p>
                <p>Modeler Ready: {bpmnModelerRef.current?.isReady?.() ? "✅ Yes" : "❌ No"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <img
                    src="https://sjc.microlink.io/hKMidDToalksAPXLcKdeeJ3i7LmrCqHhkfvKToc8m5ulzd6o_3fpdZsZGPUkT2HhyFVAc5ZYGdcDFH-jJXlfig.jpeg"
                    alt="bpmn.io"
                    className="h-4 w-auto"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)",
                      objectFit: "contain",
                    }}
                  />
                  Como Usar o bpmn.io
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  • <strong>Chat IA:</strong> Use o chat para criar diagramas conversando
                </p>
                <p>
                  • <strong>Paleta:</strong> Use a barra lateral esquerda do canvas
                </p>
                <p>
                  • <strong>Adicionar:</strong> Clique nos ícones da paleta e depois no canvas
                </p>
                <p>
                  • <strong>Conectar:</strong> Arraste de um elemento para outro
                </p>
                <p>
                  • <strong>Editar:</strong> Duplo clique para editar textos
                </p>
                <p>
                  • <strong>Mover:</strong> Arraste elementos pelo canvas
                </p>
                <p>
                  • <strong>Deletar:</strong> Selecione e pressione Delete
                </p>
                <p>
                  • <strong>Desfazer:</strong> Use Ctrl+Z
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex-1">
          <BpmnModeler
            key={updateCounter} // Force re-render when XML changes
            ref={bpmnModelerRef}
            xml={bpmnXml}
            onElementSelect={handleElementSelect}
            onModelChange={handleBpmnChange}
          />
        </div>
      </div>

      {/* Chat IA BPMN */}
      <BpmnChat currentBpmnXml={bpmnXml} onBpmnUpdate={handleBpmnUpdate} />
    </div>
  )
}
