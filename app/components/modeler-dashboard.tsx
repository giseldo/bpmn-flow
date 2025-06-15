"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../contexts/auth-context"
import { useProcess } from "../contexts/process-context"
import { Plus, Edit, Trash2, LogOut, Workflow, Calendar, Download, FileText, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ModelerDashboard() {
  const { user, logout } = useAuth()
  const { processes, deleteProcess } = useProcess()

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este processo BPMN?")) {
      deleteProcess(id)
    }
  }

  const exportBpmn = async (process: any) => {
    if (process.bpmnXml) {
      const blob = new Blob([process.bpmnXml], { type: "application/xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${process.name}.bpmn`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Workflow className="h-8 w-8 text-blue-600" />
                <img
                  src="https://sjc.microlink.io/hKMidDToalksAPXLcKdeeJ3i7LmrCqHhkfvKToc8m5ulzd6o_3fpdZsZGPUkT2HhyFVAc5ZYGdcDFH-jJXlfig.jpeg"
                  alt="bpmn.io"
                  className="h-6 w-auto"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Modelador bpmn.io</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Web-based tooling for BPMN, DMN and Forms
                  <ExternalLink className="h-3 w-3" />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <Badge variant="secondary">Analista de Processos</Badge>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Processos de Negócio</h2>
            <p className="text-muted-foreground">Gerencie seus processos modelados com bpmn.io</p>
          </div>
          <Link href="/process-editor">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Processo BPMN
            </Button>
          </Link>
        </div>

        {processes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center gap-3 mb-4">
                <Workflow className="h-12 w-12 text-muted-foreground" />
                <img
                  src="https://sjc.microlink.io/hKMidDToalksAPXLcKdeeJ3i7LmrCqHhkfvKToc8m5ulzd6o_3fpdZsZGPUkT2HhyFVAc5ZYGdcDFH-jJXlfig.jpeg"
                  alt="bpmn.io"
                  className="h-8 w-auto opacity-50"
                  style={{
                    filter: "grayscale(100%)",
                    objectFit: "contain",
                  }}
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum processo modelado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece criando seu primeiro processo de negócio usando o editor bpmn.io profissional
              </p>
              <Link href="/process-editor">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Processo
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {processes.map((process) => (
              <Card key={process.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{process.name}</span>
                    <div className="flex gap-1">
                      <Link href={`/process-editor?id=${process.id}`}>
                        <Button variant="ghost" size="sm" title="Editar processo">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {process.bpmnXml && (
                        <Button variant="ghost" size="sm" onClick={() => exportBpmn(process)} title="Exportar BPMN">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(process.id)}
                        title="Excluir processo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {process.description || "Processo de negócio modelado com bpmn.io"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(process.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <img
                            src="https://sjc.microlink.io/hKMidDToalksAPXLcKdeeJ3i7LmrCqHhkfvKToc8m5ulzd6o_3fpdZsZGPUkT2HhyFVAc5ZYGdcDFH-jJXlfig.jpeg"
                            alt="bpmn.io"
                            className="h-3 w-auto"
                            style={{
                              filter:
                                "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)",
                              objectFit: "contain",
                            }}
                          />
                          bpmn.io
                        </Badge>
                        {process.bpmnXml && (
                          <Badge variant="secondary" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            BPMN 2.0
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {process.bpmnXml ? "Processo BPMN completo e válido" : "Processo em desenvolvimento"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img
                src="https://sjc.microlink.io/hKMidDToalksAPXLcKdeeJ3i7LmrCqHhkfvKToc8m5ulzd6o_3fpdZsZGPUkT2HhyFVAc5ZYGdcDFH-jJXlfig.jpeg"
                alt="bpmn.io"
                className="h-5 w-auto"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)",
                  objectFit: "contain",
                }}
              />
              Recursos do bpmn.io
            </CardTitle>
            <CardDescription>
              Web-based tooling for BPMN, DMN and Forms - Usado por milhares de empresas mundialmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">✨ Editor Profissional</h4>
                <p className="text-muted-foreground">
                  Interface completa com paleta de elementos BPMN 2.0 padrão da indústria
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">📁 Compatibilidade Total</h4>
                <p className="text-muted-foreground">Import/Export de arquivos .bpmn válidos e interoperáveis</p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">🎯 Validação Automática</h4>
                <p className="text-muted-foreground">Validação em tempo real da estrutura e semântica BPMN</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
