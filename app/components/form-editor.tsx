"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import type { FormField } from "../contexts/process-context"
import { Plus, Trash2 } from "lucide-react"

interface FormEditorProps {
  nodeId: string
  fields: FormField[]
  onChange: (fields: FormField[]) => void
}

export default function FormEditor({ nodeId, fields, onChange }: FormEditorProps) {
  const [newField, setNewField] = useState<Partial<FormField>>({
    label: "",
    type: "text",
    required: false,
  })

  const addField = () => {
    if (!newField.label?.trim()) return

    const field: FormField = {
      id: `field-${Date.now()}`,
      label: newField.label,
      type: newField.type as FormField["type"],
      required: newField.required || false,
      options: newField.type === "select" ? ["Opção 1", "Opção 2"] : undefined,
    }

    onChange([...fields, field])
    setNewField({ label: "", type: "text", required: false })
  }

  const removeField = (fieldId: string) => {
    onChange(fields.filter((f) => f.id !== fieldId))
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    onChange(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Formulário da Tarefa</h4>
      </div>

      {/* Existing Fields */}
      {fields.map((field) => (
        <Card key={field.id} className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Input
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                className="font-medium"
              />
              <Button variant="ghost" size="sm" onClick={() => removeField(field.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={field.type}
                onValueChange={(value: FormField["type"]) => updateField(field.id, { type: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="select">Seleção</SelectItem>
                  <SelectItem value="textarea">Texto Longo</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
                />
                <Label htmlFor={`required-${field.id}`} className="text-sm">
                  Obrigatório
                </Label>
              </div>
            </div>
            {field.type === "select" && (
              <div>
                <Label className="text-sm">Opções (uma por linha)</Label>
                <textarea
                  className="w-full p-2 border rounded text-sm"
                  rows={3}
                  value={field.options?.join("\n") || ""}
                  onChange={(e) => updateField(field.id, { options: e.target.value.split("\n").filter(Boolean) })}
                />
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* Add New Field */}
      <Card className="p-3 border-dashed">
        <div className="space-y-2">
          <Input
            placeholder="Nome do campo"
            value={newField.label || ""}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <Select
              value={newField.type}
              onValueChange={(value: FormField["type"]) => setNewField({ ...newField, type: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="select">Seleção</SelectItem>
                <SelectItem value="textarea">Texto Longo</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-required"
                checked={newField.required}
                onCheckedChange={(checked) => setNewField({ ...newField, required: !!checked })}
              />
              <Label htmlFor="new-required" className="text-sm">
                Obrigatório
              </Label>
            </div>
            <Button onClick={addField} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
