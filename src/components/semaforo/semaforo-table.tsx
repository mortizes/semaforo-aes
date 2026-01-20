"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { AE } from "@/types/database";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AERow } from "./ae-row";
import { AEFormDialog } from "./ae-form-dialog";
import { toast } from "sonner";

export const SemaforoTable = () => {
  const [aes, setAes] = useState<AE[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAe, setEditingAe] = useState<AE | null>(null);

  const fetchAes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("aes")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        toast.error("Error al cargar los AEs");
        console.error("Supabase error:", error);
        return;
      }

      setAes(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Error de conexión con la base de datos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAes();

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel("aes-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "aes",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAes((prev) => [...prev, payload.new as AE].sort((a, b) =>
              a.name.localeCompare(b.name)
            ));
            toast.info(`${(payload.new as AE).name} se ha unido al equipo`);
          } else if (payload.eventType === "UPDATE") {
            setAes((prev) =>
              prev.map((ae) =>
                ae.id === payload.new.id ? (payload.new as AE) : ae
              )
            );
          } else if (payload.eventType === "DELETE") {
            setAes((prev) =>
              prev.filter((ae) => ae.id !== payload.old.id)
            );
            toast.info("Un AE ha sido eliminado");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAes]);

  const handleEdit = (ae: AE) => {
    setEditingAe(ae);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ae = aes.find((a) => a.id === id);
    if (!ae) return;

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar a ${ae.name}?`
    );
    if (!confirmed) return;

    const { error } = await supabase.from("aes").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar el AE");
      console.error(error);
    } else {
      toast.success(`${ae.name} ha sido eliminado`);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingAe(null);
    }
  };

  const handleAddNew = () => {
    setEditingAe(null);
    setIsDialogOpen(true);
  };

  // Estadísticas
  const availableCount = aes.filter((ae) => ae.is_available).length;
  const occupiedCount = aes.filter(
    (ae) => !ae.is_available && ae.mode !== "off" && ae.mode !== "vacaciones"
  ).length;
  const offCount = aes.filter(
    (ae) => ae.mode === "off" || ae.mode === "vacaciones"
  ).length;

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total AEs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aes.length}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {availableCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Ocupados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              {occupiedCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Off / Vacaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">{offCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
            Semáforo de AEs
          </CardTitle>
          <Button onClick={handleAddNew}>
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
            Nuevo AE
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-primary"
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
            </div>
          ) : aes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground mb-4"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">
                No hay AEs registrados
              </h3>
              <p className="text-muted-foreground mb-4">
                Comienza añadiendo tu primer Account Executive
              </p>
              <Button onClick={handleAddNew}>
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
                  <line x1="12" x2="12" y1="5" y2="19" />
                  <line x1="5" x2="19" y1="12" y2="12" />
                </svg>
                Añadir primer AE
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[200px]">Nombre</TableHead>
                    <TableHead className="w-[100px] text-center">
                      Disponible
                    </TableHead>
                    <TableHead className="w-[140px]">Estado</TableHead>
                    <TableHead className="w-[140px]">Modalidad</TableHead>
                    <TableHead className="w-[120px] text-center">
                      Min. desde cambio
                    </TableHead>
                    <TableHead className="w-[180px]">
                      Último &quot;Disponible&quot;
                    </TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aes.map((ae) => (
                    <AERow
                      key={ae.id}
                      ae={ae}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AEFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        ae={editingAe}
        onSuccess={fetchAes}
      />
    </div>
  );
};
