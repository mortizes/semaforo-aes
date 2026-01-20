"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AE, AeStatus, AeMode } from "@/types/database";
import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";

interface AERowProps {
  ae: AE;
  onEdit: (ae: AE) => void;
  onDelete: (id: string) => void;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getStatusColor = (status: AeStatus): string => {
  return status === "disponible"
    ? "bg-green-500/20 text-green-700 border-green-500/30"
    : "bg-red-500/20 text-red-700 border-red-500/30";
};

const getModeColor = (mode: AeMode): string => {
  const colors: Record<AeMode, string> = {
    presencial: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    remoto: "bg-purple-500/20 text-purple-700 border-purple-500/30",
    off: "bg-gray-500/20 text-gray-700 border-gray-500/30",
    vacaciones: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  };
  return colors[mode];
};

const getModeLabel = (mode: AeMode): string => {
  const labels: Record<AeMode, string> = {
    presencial: "Presencial",
    remoto: "Remoto",
    off: "Off",
    vacaciones: "Vacaciones",
  };
  return labels[mode];
};

export const AERow = ({ ae, onEdit, onDelete }: AERowProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAvailabilityChange = async (checked: boolean) => {
    if (ae.mode === "off" || ae.mode === "vacaciones") {
      toast.error("No puedes marcar disponible mientras estás en Off o Vacaciones");
      return;
    }

    setIsUpdating(true);
    const { error } = await supabase
      .from("aes")
      .update({ is_available: checked })
      .eq("id", ae.id);

    if (error) {
      toast.error("Error al actualizar disponibilidad");
      console.error(error);
    } else {
      toast.success(checked ? "Ahora estás disponible" : "Ahora estás ocupado");
    }
    setIsUpdating(false);
  };

  const handleStatusChange = async (value: AeStatus) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("aes")
      .update({ status: value })
      .eq("id", ae.id);

    if (error) {
      toast.error("Error al actualizar estado");
      console.error(error);
    }
    setIsUpdating(false);
  };

  const handleModeChange = async (value: AeMode) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("aes")
      .update({ mode: value })
      .eq("id", ae.id);

    if (error) {
      toast.error("Error al actualizar modalidad");
      console.error(error);
    } else if (value === "off" || value === "vacaciones") {
      toast.info("Se ha marcado como no disponible automáticamente");
    }
    setIsUpdating(false);
  };

  const minutesSinceLastChange = Math.floor(
    (Date.now() - new Date(ae.last_change_at).getTime()) / 60000
  );

  const formatLastAvailable = (date: string | null): string => {
    if (!date) return "-";
    const d = new Date(date);
    const time = format(d, "HH:mm", { locale: es });
    const day = format(d, "EEE d MMM", { locale: es });
    return `${time}; ${day}`;
  };

  const rowBgColor = ae.is_available
    ? "bg-green-50 hover:bg-green-100/80"
    : ae.mode === "off" || ae.mode === "vacaciones"
    ? "bg-gray-100 hover:bg-gray-200/80"
    : "bg-red-50 hover:bg-red-100/80";

  return (
    <TableRow className={`${rowBgColor} transition-colors`}>
      {/* Nombre con Avatar */}
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={ae.avatar_url || undefined} alt={ae.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {getInitials(ae.name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-gray-900">{ae.name}</span>
        </div>
      </TableCell>

      {/* Switch Disponible */}
      <TableCell>
        <div className="flex items-center justify-center">
          <Switch
            checked={ae.is_available}
            onCheckedChange={handleAvailabilityChange}
            disabled={isUpdating || ae.mode === "off" || ae.mode === "vacaciones"}
            aria-label={`Marcar ${ae.name} como ${ae.is_available ? "no disponible" : "disponible"}`}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </TableCell>

      {/* Estado (Disponible/Ocupado) */}
      <TableCell>
        <Select
          value={ae.status}
          onValueChange={(v) => handleStatusChange(v as AeStatus)}
          disabled={isUpdating}
        >
          <SelectTrigger
            className={`w-[130px] ${getStatusColor(ae.status)} border font-medium`}
            aria-label={`Estado de ${ae.name}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disponible">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Disponible
              </span>
            </SelectItem>
            <SelectItem value="ocupado">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Ocupado
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      {/* Modalidad */}
      <TableCell>
        <Select
          value={ae.mode}
          onValueChange={(v) => handleModeChange(v as AeMode)}
          disabled={isUpdating}
        >
          <SelectTrigger
            className={`w-[130px] ${getModeColor(ae.mode)} border font-medium`}
            aria-label={`Modalidad de ${ae.name}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="presencial">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Presencial
              </span>
            </SelectItem>
            <SelectItem value="remoto">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                Remoto
              </span>
            </SelectItem>
            <SelectItem value="off">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-500" />
                Off
              </span>
            </SelectItem>
            <SelectItem value="vacaciones">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Vacaciones
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      {/* Minutos desde último cambio */}
      <TableCell className="text-center">
        <Badge variant="outline" className="font-mono text-sm">
          {minutesSinceLastChange.toLocaleString()}
        </Badge>
      </TableCell>

      {/* Último cambio a Disponible */}
      <TableCell className="text-sm text-gray-600">
        {formatLastAvailable(ae.last_available_at)}
      </TableCell>

      {/* Acciones */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label={`Acciones para ${ae.name}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(ae)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(ae.id)}
              className="text-red-600 focus:text-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
