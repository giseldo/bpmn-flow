"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Square, Diamond, Circle, User, Settings, GitBranch, Layers } from "lucide-react"

interface BPMNToolbarProps {
  onAddElement: (bpmnType: string) => void
}

export default function BPMNToolbar({ onAddElement }: BPMNToolbarProps) {
  const bpmnElements = [
    {
      category: "Eventos",
      elements: [
        {
          type: "intermediateEvent",
          label: "Evento Intermediário",
          icon: Circle,
          description: "Evento que ocorre durante o processo",
        },
      ],
    },
    {
      category: "Atividades",
      elements: [
        {
          type: "task",
          label: "Tarefa",
          icon: Square,
          description: "Atividade genérica",
        },
        {
          type: "userTask",
          label: "Tarefa do Usuário",
          icon: User,
          description: "Tarefa executada por usuário",
        },
        {
          type: "serviceTask",
          label: "Tarefa de Serviço",
          icon: Settings,
          description: "Tarefa automatizada",
        },
        {
          type: "subprocess",
          label: "Subprocesso",
          icon: Layers,
          description: "Processo aninhado",
        },
      ],
    },
    {
      category: "Gateways",
      elements: [
        {
          type: "exclusiveGateway",
          label: "Gateway Exclusivo",
          icon: Diamond,
          description: "Decisão com um caminho",
        },
        {
          type: "parallelGateway",
          label: "Gateway Paralelo",
          icon: GitBranch,
          description: "Divisão/junção paralela",
        },
      ],
    },
  ]

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Elementos BPMN</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bpmnElements.map((category) => (
            <div key={category.category}>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">{category.category}</h4>
              <div className="grid grid-cols-1 gap-2">
                {category.elements.map((element) => {
                  const IconComponent = element.icon
                  return (
                    <Button
                      key={element.type}
                      variant="outline"
                      size="sm"
                      onClick={() => onAddElement(element.type)}
                      className="justify-start h-auto p-3"
                      title={element.description}
                    >
                      <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-xs font-medium">{element.label}</div>
                        <div className="text-xs text-muted-foreground">{element.description}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dicas BPMN</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>• Todo processo deve começar com um evento de início</p>
          <p>• Todo processo deve terminar com um evento de fim</p>
          <p>• Use gateways para decisões e paralelismo</p>
          <p>• Tarefas do usuário requerem formulários</p>
          <p>• Conecte elementos com setas de sequência</p>
        </CardContent>
      </Card>
    </div>
  )
}
