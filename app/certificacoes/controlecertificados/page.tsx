'use client'

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

// ✅ Função de validação de datas
const isValidDate = (value: string) => {
  const d = new Date(value);
  return !isNaN(d.getTime());
};

// ✅ Formatação de data para exibição
const formatDateAsString = (date: any): string => {
  if (!date) return "";
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newCertification, setNewCertification] = useState({
    referencia: "",
    nomeComercial: "",
    validade: "",
    manutencaoData: "",
    manutencaoEmAndamento: false,
    certificado: "",
  });

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

  const handleSortByMaintenanceDate = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);

    const sorted = [...certifications].sort((a, b) => {
      const dateA = new Date(a.manutencaoData).getTime();
      const dateB = new Date(b.manutencaoData).getTime();
      return newOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setCertifications(sorted);
  };

  const handleUpdateMaintenanceStatus = async (id: string, newValue: boolean) => {
    try {
      const cert = certifications.find((c) => c.id === id);
      if (!cert) return;

      const updated = {
        ...cert,
        manutencaoEmAndamento: newValue,
      };

      await updateCertification(id, updated);
      setCertifications((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
    } catch (error) {
      console.error("Erro ao atualizar manutenção:", error);
    }
  };

  const handleSaveEditCertification = async () => {
    if (editingCertification) {
      try {
        const validadeOk = isValidDate(editingCertification.validade);
        const manutencaoOk = isValidDate(editingCertification.manutencaoData);

        if (!validadeOk || !manutencaoOk) {
          alert("Data inválida em edição");
          return;
        }

        const payload = {
          referencia: editingCertification.referencia.trim(),
          nomeComercial: editingCertification.nomeComercial.trim(),
          validade: new Date(editingCertification.validade),
          manutencaoData: new Date(editingCertification.manutencaoData),
          manutencaoEmAndamento: editingCertification.manutencaoEmAndamento,
          certificado: editingCertification.certificado.trim(),
        };

        console.log("Edit Payload:", payload); // ⚠️ Depuração

        await updateCertification(editingCertification.id, payload);

        setCertifications((prev) =>
          prev.map((c) =>
            c.id === editingCertification.id
              ? { ...payload, id: editingCertification.id }
              : c
          )
        );

        setEditingCertification(null);
        setIsEditDialogOpen(false);
      } catch (error) {
        console.error("Erro ao salvar edição:", error);
      }
    }
  };

  const handleDeleteCertification = async (id: string) => {
    try {
      await deleteCertification(id);
      setCertifications((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleAddCertification = async () => {
    try {
      const validadeOk = isValidDate(newCertification.validade);
      const manutencaoOk = isValidDate(newCertification.manutencaoData);

      if (!validadeOk || !manutencaoOk) {
        alert("Data inválida no cadastro");
        return;
      }

      const payload = {
        id: crypto.randomUUID(),
        referencia: newCertification.referencia.trim(),
        nomeComercial: newCertification.nomeComercial.trim(),
        validade: new Date(newCertification.validade),
        manutencaoData: new Date(newCertification.manutencaoData),
        manutencaoEmAndamento: newCertification.manutencaoEmAndamento,
        certificado: newCertification.certificado.trim(),
      };

      console.log("Add Payload:", payload); // ⚠️ Depuração

      await createCertification(payload);
      setCertifications((prev) => [...prev, payload]);

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
      console.error("Erro ao adicionar:", error);
    }
  };

  const handleExportToExcel = () => {
    const data = certifications.map((c) => ({
      Referencia: c.referencia,
      "Nome Comercial": c.nomeComercial,
      Certificado: c.certificado,
      Validade: formatDateAsString(c.validade),
      "Data de Manutenção": formatDateAsString(c.manutencaoData),
      "Manutenção em Andamento": c.manutencaoEmAndamento ? "Sim" : "Não",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Certificações");
    XLSX.writeFile(workbook, "certificacoes.xlsx");
  };

  const filteredCertifications = certifications.filter((c) =>
    [c.referencia, c.nomeComercial, c.certificado]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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
            className="mb-5 mt-4 w-full md:w-96"
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
          <Skeleton className="h-8 w-full" />
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-zinc-900">
              <TableRow>
                <TableHead>REF. APOEMA</TableHead>
                <TableHead>NOME COMERCIAL</TableHead>
                <TableHead>CERTIFICADO</TableHead>
                <TableHead>VALIDADE</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={handleSortByMaintenanceDate}
                >
                  DATA MANUTENÇÃO {sortOrder === "asc" ? "↑" : "↓"}
                </TableHead>
                <TableHead>EM ANDAMENTO</TableHead>
                <TableHead>AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertifications.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>{cert.referencia}</TableCell>
                  <TableCell>{cert.nomeComercial}</TableCell>
                  <TableCell>{cert.certificado}</TableCell>
                  <TableCell>{formatDateAsString(cert.validade)}</TableCell>
                  <TableCell>
                    {formatDateAsString(cert.manutencaoData)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={cert.manutencaoEmAndamento ? "sim" : "nao"}
                      onValueChange={(val) =>
                        handleUpdateMaintenanceStatus(cert.id, val === "sim")
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
                    >
                      <FaEdit />
                    </Button>
                    <Button onClick={() => handleDeleteCertification(cert.id)}>
                      <FaTrash />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Certificado</DialogTitle>
          </DialogHeader>
          {editingCertification && (
            <div className="grid gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
              <Input
                placeholder="REF"
                value={editingCertification.referencia}
                onChange={(e) =>
                  setEditingCertification((prev: any) => ({
                    ...prev,
                    referencia: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Nome Comercial"
                value={editingCertification.nomeComercial}
                onChange={(e) =>
                  setEditingCertification((prev: any) => ({
                    ...prev,
                    nomeComercial: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Certificado"
                value={editingCertification.certificado}
                onChange={(e) =>
                  setEditingCertification((prev: any) => ({
                    ...prev,
                    certificado: e.target.value,
                  }))
                }
              />
              <Input
                type="date"
                value={editingCertification.validade?.split("T")[0] || ""}
                onChange={(e) =>
                  setEditingCertification((prev: any) => ({
                    ...prev,
                    validade: e.target.value,
                  }))
                }
              />
              <Input
                type="date"
                value={editingCertification.manutencaoData?.split("T")[0] || ""}
                onChange={(e) =>
                  setEditingCertification((prev: any) => ({
                    ...prev,
                    manutencaoData: e.target.value,
                  }))
                }
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSaveEditCertification}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Adição */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Certificado</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="REF"
              value={newCertification.referencia}
              onChange={(e) =>
                setNewCertification((prev) => ({
                  ...prev,
                  referencia: e.target.value,
                }))
              }
            />
            <Input
              placeholder="Nome Comercial"
              value={newCertification.nomeComercial}
              onChange={(e) =>
                setNewCertification((prev) => ({
                  ...prev,
                  nomeComercial: e.target.value,
                }))
              }
            />
            <Input
              placeholder="Certificado"
              value={newCertification.certificado}
              onChange={(e) =>
                setNewCertification((prev) => ({
                  ...prev,
                  certificado: e.target.value,
                }))
              }
            />
            <Input
              type="date"
              value={newCertification.validade}
              onChange={(e) =>
                setNewCertification((prev) => ({
                  ...prev,
                  validade: e.target.value,
                }))
              }
            />
            <Input
              type="date"
              value={newCertification.manutencaoData}
              onChange={(e) =>
                setNewCertification((prev) => ({
                  ...prev,
                  manutencaoData: e.target.value,
                }))
              }
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddCertification}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
