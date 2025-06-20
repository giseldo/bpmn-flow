"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react"

interface BpmnModelerProps {
  xml?: string
  onElementSelect?: (element: any) => void
  onModelChange?: (xml: string) => void
}

const BpmnModeler = forwardRef<any, BpmnModelerProps>(({ xml, onElementSelect, onModelChange }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const modelerRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  useImperativeHandle(ref, () => ({
    importXML: async (xmlString: string) => {
      console.log("🔄 BpmnModeler: Tentando importar XML...")
      console.log("📄 BpmnModeler: XML recebido para importação:", xmlString.substring(0, 300) + "...")
      console.log("📏 BpmnModeler: Tamanho do XML:", xmlString.length)
      
      if (modelerRef.current && isReady) {
        try {
          console.log("✅ BpmnModeler: Modeler está pronto, importando...")
          const result = await modelerRef.current.importXML(xmlString)
          console.log("✅ BpmnModeler: XML importado com sucesso!", result)
          console.log("🔍 BpmnModeler: Resultado da importação:", {
            warnings: result.warnings?.length || 0,
            hasWarnings: !!result.warnings?.length,
            warningsDetails: result.warnings || []
          })

          // Forçar re-render do canvas
          const canvas = modelerRef.current.get("canvas")
          if (canvas) {
            console.log("🎨 BpmnModeler: Ajustando canvas...")
            canvas.zoom("fit-viewport")
            // Forçar redraw
            setTimeout(() => {
              console.log("🔄 BpmnModeler: Forçando redraw do canvas...")
              canvas.zoom("fit-viewport")
            }, 100)
          } else {
            console.warn("⚠️ BpmnModeler: Canvas não encontrado")
          }

          return true
        } catch (error) {
          console.error("❌ BpmnModeler: Erro ao importar XML:", error)
          console.error("🔍 BpmnModeler: Detalhes do erro:", {
            errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
            errorStack: error instanceof Error ? error.stack : undefined,
            xmlLength: xmlString.length,
            xmlStart: xmlString.substring(0, 100)
          })
          return false
        }
      } else {
        console.warn("⚠️ BpmnModeler: Modeler não está pronto ainda")
        console.log("🔍 BpmnModeler: Status do modeler:", {
          hasModelerRef: !!modelerRef.current,
          isReady: isReady,
          hasContainer: !!containerRef.current
        })
        return false
      }
    },
    saveXML: async (options?: any) => {
      if (modelerRef.current && isReady) {
        return await modelerRef.current.saveXML(options)
      }
      return null
    },
    get: (service: string) => {
      if (modelerRef.current && isReady) {
        return modelerRef.current.get(service)
      }
      return null
    },
    isReady: () => isReady,
  }))

  useEffect(() => {
    const initModeler = async () => {
      if (typeof window !== "undefined" && containerRef.current) {
        try {
          console.log("🚀 BpmnModeler: Inicializando modeler...")

          // Load bpmn-js from CDN
          if (!(window as any).BpmnJS) {
            await loadBpmnJS()
          }

          const BpmnJS = (window as any).BpmnJS

          const modeler = new BpmnJS({
            container: containerRef.current,
            keyboard: {
              bindTo: window,
            },
            additionalModules: [],
          })

          modelerRef.current = modeler
          console.log("🎯 BpmnModeler: Modeler criado")

          // Load initial diagram
          const initialXml = xml || getDefaultBpmnXml()

          await modeler.importXML(initialXml)
          console.log("✅ BpmnModeler: XML inicial carregado")

          // Set up event listeners
          const eventBus = modeler.get("eventBus")

          eventBus.on("selection.changed", (event: any) => {
            const element = event.newSelection[0]
            if (element && onElementSelect) {
              onElementSelect(element)
            }
          })

          eventBus.on("commandStack.changed", async () => {
            if (onModelChange) {
              try {
                const result = await modeler.saveXML({ format: true })
                onModelChange(result.xml)
              } catch (error) {
                console.error("Error saving XML:", error)
              }
            }
          })

          // Force palette to be visible
          const palette = modeler.get("palette")
          if (palette) {
            palette.open()
          }

          setIsReady(true)
          console.log("🎉 BpmnModeler: Modeler pronto!")
        } catch (error) {
          console.error("❌ BpmnModeler: Erro ao inicializar:", error)
        }
      }
    }

    initModeler()

    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy()
        setIsReady(false)
      }
    }
  }, [])

  // Watch for XML changes from props with delay
  useEffect(() => {
    if (!xml || !isReady) return

    console.log("🔍 BpmnModeler: XML prop mudou, aguardando para importar...")

    // Delay para garantir que o modeler está completamente pronto
    const timer = setTimeout(async () => {
      if (modelerRef.current && isReady) {
        try {
          console.log("⏰ BpmnModeler: Importando XML após delay...")
          const result = await modelerRef.current.importXML(xml)
          console.log("✅ BpmnModeler: XML importado com sucesso do prop!", result)
          
          // Forçar re-render do canvas
          const canvas = modelerRef.current.get("canvas")
          if (canvas) {
            canvas.zoom("fit-viewport")
            // Adicionar feedback visual temporário
            const container = containerRef.current
            if (container) {
              container.style.border = "2px solid #10b981"
              setTimeout(() => {
                container.style.border = ""
              }, 1000)
            }
          }
        } catch (error) {
          console.error("❌ BpmnModeler: Erro ao importar XML do prop:", error)
          // Feedback visual de erro
          const container = containerRef.current
          if (container) {
            container.style.border = "2px solid #ef4444"
            setTimeout(() => {
              container.style.border = ""
            }, 2000)
          }
        }
      } else {
        console.warn("⚠️ BpmnModeler: Modeler não está pronto para importar XML")
      }
    }, 200) // Aumentar delay para garantir estabilidade

    return () => clearTimeout(timer)
  }, [xml, isReady])

  const getDefaultBpmnXml = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js" exporterVersion="17.0.0">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="79" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
  }

  const loadBpmnJS = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log("📦 BpmnModeler: Carregando bpmn-js...")

      // Load CSS first
      const cssLink = document.createElement("link")
      cssLink.rel = "stylesheet"
      cssLink.href = "https://unpkg.com/bpmn-js@17.0.0/dist/assets/bpmn-js.css"
      document.head.appendChild(cssLink)

      // Load diagram-js CSS for palette
      const diagramCssLink = document.createElement("link")
      diagramCssLink.rel = "stylesheet"
      diagramCssLink.href = "https://unpkg.com/bpmn-js@17.0.0/dist/assets/diagram-js.css"
      document.head.appendChild(diagramCssLink)

      // Load bpmn-font CSS
      const fontCssLink = document.createElement("link")
      fontCssLink.rel = "stylesheet"
      fontCssLink.href = "https://unpkg.com/bpmn-js@17.0.0/dist/assets/bpmn-font/css/bpmn.css"
      document.head.appendChild(fontCssLink)

      // Load JS
      const script = document.createElement("script")
      script.src = "https://unpkg.com/bpmn-js@17.0.0/dist/bpmn-modeler.development.js"
      script.onload = () => {
        console.log("✅ BpmnModeler: bpmn-js carregado")
        resolve()
      }
      script.onerror = () => {
        console.error("❌ BpmnModeler: Falha ao carregar bpmn-js")
        reject(new Error("Failed to load bpmn-js"))
      }
      document.head.appendChild(script)
    })
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* bpmn.io branding */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
          <span className="text-sm font-medium text-gray-600">BPMN Editor</span>
          {isReady && <span className="text-xs text-green-600">● Ready</span>}
        </div>
        <div className="text-xs text-gray-500">Powered by bpmn.io</div>
      </div>

      <div ref={containerRef} className="flex-1 w-full" style={{ minHeight: "500px" }} />
    </div>
  )
})

BpmnModeler.displayName = "BpmnModeler"

export default BpmnModeler
