/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as XLSX from "xlsx";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FaTrash, FaEdit } from "react-icons/fa";

import {
  getCertifications,
  updateCertification,
  deleteCertification,
  createCertification,
} from "@/lib/actions/certifications.actions";
import { Skeleton } from "@/components/ui/skeleton";

// Função auxiliar para formatar datas como string
const formatDateAsString = (date: any): string => {
  if (!date) return "";
  if (typeof date === "string") return date;
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const Page = () => {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [editingCertification, setEditingCertification] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newCertification, setNewCertification] = useState({
    referencia: "",
    nomeComercial: "",
    validade: "",
    manutencaoData: "",
    manutencaoEmAndamento: false,
    certificado: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  // Fetch de certificados ao carregar o componente
  useEffect(() => {
    const fetchCertifications = async () => {
      setIsLoading(true);
      try {
        const data = await getCertifications();
        setCertifications(data);
      } catch (error) {
        console.error("Erro ao buscar certificados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertifications();
  }, []);

  // Ordenação por DATA MANUTENÇÃO
  const handleSortByMaintenanceDate = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);

    const sortedCertifications = [...certifications].sort((a, b) => {
      const parseDate = (dateString: string): number => {
        if (!dateString) return 0;
        const [day, month, year] = dateString.split("/").map(Number);
        return new Date(year, month - 1, day).getTime();
      };

      const dateA = parseDate(a.manutencaoData);
      const dateB = parseDate(b.manutencaoData);

      if (dateA === 0 && dateB === 0) return 0;
      if (dateA === 0) return newOrder === "asc" ? 1 : -1;
      if (dateB === 0) return newOrder === "asc" ? -1 : 1;

      return newOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setCertifications(sortedCertifications);
  };

  // Atualizar diretamente o valor de manutenção em andamento
  const handleUpdateMaintenanceStatus = async (
    id: string,
    newValue: boolean
  ) => {
    try {
      const currentCertification = certifications.find(
        (cert) => cert.$id === id
      );

      if (!currentCertification) {
        console.error("Certificação não encontrada");
        return;
      }

      const updatedPayload = {
        ...currentCertification,
      };

      const updatedCertification = await updateCertification(
        id,
        updatedPayload
      );

      setCertifications((prev) =>
        prev.map((cert) => (cert.$id === id ? updatedCertification : cert))
      );
    } catch (error) {
      console.error("Erro ao atualizar manutenção em andamento:", error);
    }
  };

  // Handler para salvar alterações em um certificado existente
  const handleSaveEditCertification = async () => {
    if (editingCertification) {
      try {
        const sanitizedData = {
          referencia: editingCertification.referencia.trim(),
          nomeComercial: editingCertification.nomeComercial.trim(),
          validade: formatDateAsString(editingCertification.validade),
          manutencaoData: formatDateAsString(
            editingCertification.manutencaoData
          ),
          manutencaoEmAndamento: editingCertification.manutencaoEmAndamento,
          certificado: editingCertification.certificado.trim(),
        };

        const updatedCertification = await updateCertification(
          editingCertification.$id,
          sanitizedData
        );

        setCertifications((prev) =>
          prev.map((cert) =>
            cert.$id === editingCertification.$id ? updatedCertification : cert
          )
        );

        setEditingCertification(null);
        setIsEditDialogOpen(false);
      } catch (error) {
        console.error("Erro ao atualizar certificado:", error);
      }
    }
  };

  // Handler para excluir um certificado
  const handleDeleteCertification = async (id: string) => {
    try {
      await deleteCertification(id);
      setCertifications((prev) => prev.filter((cert) => cert.$id !== id));
    } catch (error) {
      console.error("Erro ao excluir certificado:", error);
    }
  };

  const handleAddCertification = async () => {
    try {
      const sanitizedData = {
        referencia: newCertification.referencia.trim(),
        nomeComercial: newCertification.nomeComercial.trim(),
        validade: formatDateAsString(newCertification.validade),
        manutencaoData: formatDateAsString(newCertification.manutencaoData),
        manutencaoEmAndamento: newCertification.manutencaoEmAndamento,
        certificado: newCertification.certificado.trim(),
      };

      const result = await createCertification(sanitizedData);

      setCertifications((prev) => [...prev, result]);

      setNewCertification({
        referencia: "",
        nomeComercial: "",
        validade: "",
        manutencaoData: "",
        manutencaoEmAndamento: false,
        certificado: "",
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Erro ao criar certificado:", error);
    }
  };

  // Função para exportar os dados para Excel
  const handleExportToExcel = () => {
    const filteredData = certifications.map(
      ({
        referencia,
        nomeComercial,
        certificado,
        validade,
        manutencaoData,
        manutencaoEmAndamento,
      }) => ({
        Referencia: referencia,
        "Nome Comercial": nomeComercial,
        Certificado: certificado,
        Validade: validade,
        "Data de Manutenção": manutencaoData,
        "Manutenção em Andamento": manutencaoEmAndamento ? "Sim" : "Não",
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(filteredData, {
      header: [
        "Referencia",
        "Nome Comercial",
        "Certificado",
        "Validade",
        "Data de Manutenção",
        "Manutenção em Andamento",
      ],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Certificações");

    XLSX.writeFile(workbook, "certificacoes.xlsx");
  };

  // Filtro de busca
  const filteredCertifications = certifications.filter(
    (cert) =>
      cert.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.nomeComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 rounded-2xl bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:gap-0">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Controle de Certificações
          </h1>

          <Input
            placeholder="Buscar por referência, nome ou certificado"
            className="mb-5 mt-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary dark:border-white/30 dark:bg-zinc-900 md:w-96"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} disabled={isLoading}>
          Adicionar Certificado
        </Button>
      </div>
      <Button onClick={handleExportToExcel} disabled={isLoading}>
        Exportar para Excel
      </Button>

      <div className="max-h-[550px] overflow-auto rounded-2xl border">
        {isLoading ? (
          <div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-4 p-4">
                <Skeleton className="h-8 w-1/6" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-8 w-1/6" />
                <Skeleton className="h-8 w-1/6" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white shadow-md dark:bg-zinc-900">
              <TableRow>
                <TableHead>REF. APOEMA</TableHead>
                <TableHead>NOME COMERCIAL</TableHead>
                <TableHead>CERTIFICADO</TableHead>
                <TableHead>VALIDADE DATA</TableHead>
                <TableHead
                  onClick={handleSortByMaintenanceDate}
                  className="cursor-pointer"
                >
                  DATA MANUTENÇÃO{" "}
                  {sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : ""}
                </TableHead>
                <TableHead>MANUTENÇÃO EM ANDAMENTO</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertifications.map((cert) => (
                <TableRow key={cert.$id}>
                  <TableCell>{cert.referencia}</TableCell>
                  <TableCell className="w-[250px]">
                    {cert.nomeComercial}
                  </TableCell>
                  <TableCell>{cert.certificado}</TableCell>
                  <TableCell>{cert.validade}</TableCell>
                  <TableCell>{cert.manutencaoData}</TableCell>
                  <TableCell>
                    <Select
                      value={cert.manutencaoEmAndamento ? "sim" : "nao"}
                      onValueChange={(value) =>
                        handleUpdateMaintenanceStatus(cert.$id, value === "sim")
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditingCertification(cert);
                        setIsEditDialogOpen(true);
                      }}
                      className="w-[40px] dark:bg-zinc-800 dark:text-white"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCertification(cert.$id)}
                      className="w-[40px] dark:bg-zinc-800 dark:text-white"
                    >
                      <FaTrash />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Certificado</DialogTitle>
          </DialogHeader>
          {editingCertification && (
            <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
              <Input
                placeholder="REF. APOEMA"
                value={editingCertification.referencia || ""}
                onChange={(e) =>
                  setEditingCertification((prev: any) => ({
                    ...prev,
                    referencia: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="NOME COMERCIAL"
                value={editingCertification.nomeComercial || ""}
                onChange={(e) =>
                  setEditingCertification((prev: any) => ({
                    ...prev,
                    nomeComercial: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="CERTIFICADO"
                value={editingCertification.certificado || ""}
                onChange={(e) =>
                  setEditingCertification((prev: any) => ({
                    ...prev,
                    certificado: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="VALIDADE DATA"
                value={editingCertification.validade || ""}
                onChange={(e) =>
                  setEditingCertification((prev: any) => ({
                    ...prev,
                    validade: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="MANUTENÇÃO DATA"
                value={editingCertification.manutencaoData || ""}
                onChange={(e) =>
                  setEditingCertification((prev: any) => ({
                    ...prev,
                    manutencaoData: e.target.value,
                  }))
                }
              />
            </div>
          )}
          <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleSaveEditCertification}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Certificado</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="REF. APOEMA"
              value={newCertification.referencia}
              onChange={(e) =>
                setNewCertification((prev) => ({
                  ...prev,
                  referencia: e.target.value,
                }))
              }
            />
            <Input
              placeholder="NOME COMERCIAL"
              value={newCertification.nomeComercial}
              onChange={(e) =>
                setNewCertification((prev) => ({
                  ...prev,
                  nomeComercial: e.target.value,
                }))
              }
            />
            <Input
              placeholder="CERTIFICADO"
              value={newCertification.certificado}
              onChange={(e) =>
                setNewCertification((prev) => ({
                  ...prev,
                  certificado: e.target.value,
                }))
              }
            />
            <Input
              placeholder="VALIDADE DATA"
              value={newCertification.validade}
              onChange={(e) =>
                setNewCertification((prev) => ({
                  ...prev,
                  validade: e.target.value,
                }))
              }
            />
            <Input
              placeholder="MANUTENÇÃO DATA"
              value={newCertification.manutencaoData}
              onChange={(e) =>
                setNewCertification((prev) => ({
                  ...prev,
                  manutencaoData: e.target.value,
                }))
              }
            />
          </div>
          <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleAddCertification}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
