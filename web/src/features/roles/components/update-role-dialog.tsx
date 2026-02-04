"use client"

import { useState, useEffect } from "react"
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
import { updateRole } from "../api/roles-api"
import type { Role } from "../types/role.types"

export interface UpdateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  token: string | null
  onSuccess: () => void
}

export function UpdateRoleDialog({
  open,
  onOpenChange,
  role,
  token,
  onSuccess,
}: UpdateRoleDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (role) {
      setName(role.name)
      setDescription(role.description ?? "")
    }
  }, [role])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !role?.id) return
    setError(null)
    setIsLoading(true)
    try {
      await updateRole(role.id, {
        name: name.trim(),
        description: description.trim() || null,
        token,
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="update-role-name">Name</FieldLabel>
                <Input
                  id="update-role-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Manager"
                  required
                  minLength={2}
                  maxLength={255}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="update-role-description">
                  Description
                </FieldLabel>
                <Input
                  id="update-role-description"
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
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
