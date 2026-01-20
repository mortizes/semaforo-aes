"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { AE, AeStatus, AeMode } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface AEFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ae?: AE | null;
  onSuccess: () => void;
}

export const AEFormDialog = ({
  open,
  onOpenChange,
  ae,
  onSuccess,
}: AEFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    avatar_url: "",
    is_available: true,
    status: "disponible" as AeStatus,
    mode: "presencial" as AeMode,
  });

  const isEditing = !!ae;

  useEffect(() => {
    if (ae) {
      setFormData({
        name: ae.name,
        avatar_url: ae.avatar_url || "",
        is_available: ae.is_available,
        status: ae.status,
        mode: ae.mode,
      });
    } else {
      setFormData({
        name: "",
        avatar_url: "",
        is_available: true,
        status: "disponible",
        mode: "presencial",
      });
    }
  }, [ae, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setIsLoading(true);

    const dataToSave = {
      name: formData.name.trim(),
      avatar_url: formData.avatar_url.trim() || null,
      is_available: formData.mode === "off" || formData.mode === "vacaciones" 
        ? false 
        : formData.is_available,
      status: formData.status,
      mode: formData.mode,
    };

    if (isEditing && ae) {
      const { error } = await supabase
        .from("aes")
        .update(dataToSave)
        .eq("id", ae.id);

      if (error) {
        toast.error("Error al actualizar el AE");
        console.error(error);
      } else {
        toast.success("AE actualizado correctamente");
        onSuccess();
        onOpenChange(false);
      }
    } else {
      const { error } = await supabase.from("aes").insert([dataToSave]);

      if (error) {
        toast.error("Error al crear el AE");
        console.error(error);
      } else {
        toast.success("AE creado correctamente");
        onSuccess();
        onOpenChange(false);
      }
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar AE" : "Nuevo Account Executive"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del Account Executive."
              : "Añade un nuevo Account Executive al equipo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ej: María García"
              required
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">URL del Avatar (opcional)</Label>
            <Input
              id="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_available">Disponible</Label>
            <Switch
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_available: checked }))
              }
              disabled={formData.mode === "off" || formData.mode === "vacaciones"}
              aria-label="Marcar como disponible"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value: AeStatus) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger id="status" aria-label="Seleccionar estado">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="ocupado">Ocupado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Modalidad</Label>
            <Select
              value={formData.mode}
              onValueChange={(value: AeMode) =>
                setFormData((prev) => ({ ...prev, mode: value }))
              }
            >
              <SelectTrigger id="mode" aria-label="Seleccionar modalidad">
                <SelectValue placeholder="Seleccionar modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="remoto">Remoto</SelectItem>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="vacaciones">Vacaciones</SelectItem>
              </SelectContent>
            </Select>
            {(formData.mode === "off" || formData.mode === "vacaciones") && (
              <p className="text-xs text-amber-600">
                Al seleccionar Off o Vacaciones, se marcará automáticamente como
                no disponible.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Guardando...
                </span>
              ) : isEditing ? (
                "Guardar cambios"
              ) : (
                "Crear AE"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
