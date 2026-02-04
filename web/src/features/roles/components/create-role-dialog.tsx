"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createRole } from "../api/roles-api"

export interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string | null
  onSuccess: () => void
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  token,
  onSuccess,
}: CreateRoleDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setError(null)
    setIsLoading(true)
    try {
      await createRole({
        name: name.trim(),
        description: description.trim() || null,
        token,
      })
      setName("")
      setDescription("")
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-role-name">Name</FieldLabel>
                <Input
                  id="create-role-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Manager"
                  required
                  minLength={2}
                  maxLength={255}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-role-description">
                  Description
                </FieldLabel>
                <Input
                  id="create-role-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
