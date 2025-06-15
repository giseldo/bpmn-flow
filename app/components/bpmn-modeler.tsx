"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"

interface BpmnModelerProps {
  xml?: string
  onElementSelect?: (element: any) => void
  onModelChange?: (xml: string) => void
}

const BpmnModeler = forwardRef<any, BpmnModelerProps>(({ xml, onElementSelect, onModelChange }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const modelerRef = useRef<any>(null)

  useImperativeHandle(ref, () => modelerRef.current)

  useEffect(() => {
    const initModeler = async () => {
      if (typeof window !== "undefined" && containerRef.current) {
        try {
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
            // Enable all default modules including palette
            additionalModules: [],
          })

          modelerRef.current = modeler

          // Load initial diagram or create new one
          const initialXml =
            xml ||
            `<?xml version="1.0" encoding="UTF-8"?>
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

          await modeler.importXML(initialXml)

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
        } catch (error) {
          console.error("Error initializing BPMN modeler:", error)
        }
      }
    }

    initModeler()

    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (modelerRef.current && xml) {
      modelerRef.current.importXML(xml).catch((error: any) => {
        console.error("Error importing XML:", error)
      })
    }
  }, [xml])

  const loadBpmnJS = (): Promise<void> => {
    return new Promise((resolve, reject) => {
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
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load bpmn-js"))
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
        </div>
        <div className="text-xs text-gray-500">Powered by bpmn.io</div>
      </div>

      <div ref={containerRef} className="flex-1 w-full" style={{ minHeight: "500px" }} />
    </div>
  )
})

BpmnModeler.displayName = "BpmnModeler"

export default BpmnModeler
