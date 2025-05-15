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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FaCopy, FaTrashAlt } from "react-icons/fa";
import {
  createLicencaImportacao,
  deleteLicencaImportacao,
  getLicencasImportacao,
  updateLicencaImportacao,
} from "@/lib/actions/li.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const formatarDataBrasileira = (data: string) => {
  if (!data) return "";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const formatarDataInternacional = (data: string) => {
  if (!data) return "";
  const partes = data.split("/");
  if (partes.length !== 3) return data;
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
};

const Page = () => {
  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

  const [form, setForm] = useState({
    imp: "",
    importador: "",
    referenciaDoCliente: "",
    numeroOrquestra: 0,
    numeroLi: "",
    ncm: "",
    dataRegistroLI: "",
    dataInclusaoOrquestra: "",
    previsaoDeferimento: "",
    situacao: "em análise",
    observacoes: "",
  });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const calcularPrevisaoDeferimento = (dataInclusao: string): string => {
    const data = new Date(dataInclusao);
    data.setDate(data.getDate() + 11);
    const iso = data.toISOString().split("T")[0];
    return formatarDataBrasileira(iso);
  };

  useEffect(() => {
    const fetchLicencas = async () => {
      try {
        const licencas = await getLicencasImportacao();
        const formatadas = licencas.map((item: any) => ({
          ...item,
          dataRegistroLI: formatarDataBrasileira(item.dataRegistroLI),
          dataInclusaoOrquestra: formatarDataBrasileira(
            item.dataInclusaoOrquestra
          ),
          previsaoDeferimento: formatarDataBrasileira(item.previsaoDeferimento),
        }));
        setData(formatadas);
      } catch (error) {
        console.error("Erro ao buscar Licenças de Importação:", error);
      } finally {
        setIsLoading(false); // Finaliza o carregamento
      }
    };
    fetchLicencas();
  }, []);

  const handleDuplicate = (index: number) => {
    const original = data![index];

    const {
      $id,
      $databaseId,
      $collectionId,
      $createdAt,
      $updatedAt,
      ...cleaned
    } = original;

    const novoItem = {
      ...cleaned,
      dataRegistroLI: formatarDataInternacional(cleaned.dataRegistroLI),
      dataInclusaoOrquestra: formatarDataInternacional(
        cleaned.dataInclusaoOrquestra
      ),
      previsaoDeferimento: formatarDataInternacional(
        cleaned.previsaoDeferimento
      ),
    };

    createLicencaImportacao(novoItem)
      .then((res) => {
        const novo = {
          ...res,
          dataRegistroLI: formatarDataBrasileira(res.dataRegistroLI),
          dataInclusaoOrquestra: formatarDataBrasileira(
            res.dataInclusaoOrquestra
          ),
          previsaoDeferimento: formatarDataBrasileira(res.previsaoDeferimento),
        };

        setData((prev) => [...(prev || []), novo]);
      })
      .catch((err) => {
        console.error("Erro ao duplicar LI:", err);
      });
  };

  const handleChange = async (field: string, value: string, id: string) => {
    if (!data) return;

    const updatedData = data.map((item) => {
      if (item.$id === id) {
        const updatedItem = {
          ...item,
          [field]:
            field === "numeroOrquestra" ? parseInt(value, 10) || 0 : value,
        };

        // Se o campo alterado for "dataInclusaoOrquestra", calcule a previsão de deferimento
        if (field === "dataInclusaoOrquestra" && value.length === 10) {
          const dateParts = value.split("/");
          if (dateParts.length === 3) {
            const [day, month, year] = dateParts;
            const fullYear = year.length === 2 ? `20${year}` : year;
            const formattedDate = `${fullYear}-${month}-${day}`;

            const previsao = calcularPrevisaoDeferimento(formattedDate);
            updatedItem.previsaoDeferimento = previsao; // Atualiza a previsão de deferimento
          }
        }

        return updatedItem;
      }
      return item;
    });

    setData(updatedData); // Atualize o estado com os dados modificados

    try {
      const targetItem = updatedData.find((item) => item.$id === id);
      if (!targetItem) return;

      const {
        $id,
        $databaseId,
        $collectionId,
        $createdAt,
        $updatedAt,
        ...dataToUpdate
      } = targetItem;

      if (dataToUpdate.numeroOrquestra) {
        dataToUpdate.numeroOrquestra = parseInt(
          dataToUpdate.numeroOrquestra,
          10
        );
      }

      // Envia a atualização para o backend
      await updateLicencaImportacao(id, dataToUpdate);
      console.log(`Licença de Importação com id ${id} atualizada com sucesso.`);
    } catch (err) {
      console.error("Erro ao atualizar Licença de Importação no backend:", err);
      alert("Erro ao salvar a alteração no backend. Tente novamente.");
    }
  };

  const handleAdd = async () => {
    try {
      const dataInclusao = formatarDataInternacional(
        form.dataInclusaoOrquestra
      );
      const dataRegistro = formatarDataInternacional(form.dataRegistroLI);
      const previsaoDeferimento = calcularPrevisaoDeferimento(dataInclusao);

      const result = await createLicencaImportacao({
        ...form,
        dataRegistroLI: dataRegistro,
        dataInclusaoOrquestra: dataInclusao,
        previsaoDeferimento: formatarDataInternacional(previsaoDeferimento),
      });

      const novaLI = {
        ...result,
        dataRegistroLI: formatarDataBrasileira(result.dataRegistroLI),
        dataInclusaoOrquestra: formatarDataBrasileira(
          result.dataInclusaoOrquestra
        ),
        previsaoDeferimento: formatarDataBrasileira(result.previsaoDeferimento),
      };

      setData([...(data || []), novaLI]);
      setOpen(false);
      setForm({
        imp: "",
        importador: "",
        referenciaDoCliente: "",
        numeroOrquestra: 0,
        numeroLi: "",
        ncm: "",
        dataRegistroLI: "",
        dataInclusaoOrquestra: "",
        previsaoDeferimento: "",
        situacao: "em análise",
        observacoes: "",
      });
    } catch (error) {
      console.error("Erro ao adicionar Licença de Importação", error);
    }
  };

  const handleRemove = async (index: number) => {
    const id = data![index].$id;
    try {
      await deleteLicencaImportacao(id);
      const updatedData = data!.filter((_, i) => i !== index);
      setData(updatedData);
    } catch (error) {
      console.error("Erro ao excluir Licença de Importação", error);
    }
  };

  const filteredData = (data || []).filter((item) => {
    const termo = search.toLowerCase();
    return (
      item.imp?.toLowerCase().includes(termo) ||
      item.importador?.toLowerCase().includes(termo) ||
      item.referenciaDoCliente?.toLowerCase().includes(termo)
    );
  });

  const exportarParaExcel = () => {
    if (!data || data.length === 0) return;

    const dadosParaExportar = data.map((item) => ({
      IMP: item.imp,
      Importador: item.importador,
      "Referência do Cliente": item.referenciaDoCliente,
      "Número do Orquestra": item.numeroOrquestra,
      "Número da LI": item.numeroLi,
      NCM: item.ncm,
      "Data Registro LI": item.dataRegistroLI,
      "Data Inclusão Orquestra": item.dataInclusaoOrquestra,
      "Previsão Deferimento": item.previsaoDeferimento,
      Situação: item.situacao,
      Observações: item.observacoes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Licenças de Importação");

    XLSX.writeFile(workbook, "licencas-importacao.xlsx");
  };

  const getSituacaoColor = (situacao: string) => {
    const normalized = situacao.toLowerCase();
    if (normalized === "deferida") return "text-green font-semibold";
    if (normalized === "indeferida" || normalized === "cancelada")
      return "text-red font-semibold";
    return "text-gray dark:text-white";
  };

  function formatColumnName(coluna: string) {
    switch (coluna) {
      case "imp":
        return "Imp";
      case "importador":
        return "Importador";
      case "referenciaDoCliente":
        return "Referência";
      case "numeroOrquestra":
        return "Nº Orquestra";
      case "numeroLi":
        return "Número LI";
      case "ncm":
        return "Ncm";
      case "dataRegistroLI":
        return "Data de Registro LI";
      case "dataInclusaoOrquestra":
        return "Data de Pagamento";
      case "previsaoDeferimento":
        return "Previsão Deferimento";
      case "situacao":
        return "Situação";
      case "observacoes":
        return "Observações";
      default:
        return (
          coluna.charAt(0).toUpperCase() +
          coluna
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim()
        );
    }
  }

  const [colunasVisiveis, setColunasVisiveis] = useState(() => {
    const savedColumns = getCookie("colunasVisiveis");
    if (savedColumns) {
      return JSON.parse(savedColumns);
    } else {
      return {
        imp: true,
        importador: true,
        referenciaDoCliente: true,
        numeroOrquestra: false,
        numeroLi: true,
        ncm: false,
        dataRegistroLI: false,
        dataInclusaoOrquestra: true,
        previsaoDeferimento: true,
        situacao: true,
        observacoes: false,
      };
    }
  });

  const handleColumnToggle = (coluna: string) => {
    setColunasVisiveis((prev: typeof colunasVisiveis) => {
      const updatedColunas = {
        ...prev,
        [coluna]: !prev[coluna],
      };

      // Salvar no cookie
      setCookie("colunasVisiveis", JSON.stringify(updatedColunas), 365);

      return updatedColunas;
    });
  };

  useEffect(() => {
    if (
      form.dataInclusaoOrquestra &&
      form.dataInclusaoOrquestra.length === 10
    ) {
      const dateParts = form.dataInclusaoOrquestra.split("/");

      if (dateParts.length === 3) {
        const [day, month, year] = dateParts;

        const fullYear = year.length === 2 ? `20${year}` : year;

        const formattedDate = `${fullYear}-${month}-${day}`;

        const previsao = calcularPrevisaoDeferimento(formattedDate);

        setForm((prev) => ({
          ...prev,
          previsaoDeferimento: previsao,
        }));
      } else {
        console.log("Data no formato inválido", form.dataInclusaoOrquestra);
      }
    } else if (
      form.dataInclusaoOrquestra &&
      form.dataInclusaoOrquestra.length !== 10
    ) {
      console.log("A data deve ter o formato dd/mm/yyyy completo.");
    }
  }, [form.dataInclusaoOrquestra]);

  return (
    <div className="space-y-10 rounded-2xl bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:gap-0">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Controle de Licenças de Importação
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie as LIs registradas.
          </p>

          <Input
            placeholder="Buscar por IMP, importador ou referência"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
            className="mb-5 mt-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary dark:border-white/30 dark:bg-zinc-900 md:w-96"
          />

          <div className="mb-5">
            <Select
              value=""
              onValueChange={(selectedOption) => {
                handleColumnToggle(selectedOption);
              }}
            >
              <SelectTrigger
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary dark:border-white/30 dark:bg-zinc-900 md:w-96"
              >
                <SelectValue placeholder="Colunas:" />
              </SelectTrigger>
              <SelectContent className="">
                {Object.keys(colunasVisiveis).map((coluna) => (
                  <SelectItem key={coluna} value={coluna}>
                    <div className="flex w-full items-center justify-between capitalize">
                      <input
                        type="checkbox"
                        checked={colunasVisiveis[coluna]}
                        onChange={() => handleColumnToggle(coluna)}
                        className="mr-5 size-5"
                      />
                      <span className="capitalize">
                        {formatColumnName(coluna)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={exportarParaExcel} disabled={isLoading}>
            Exportar para Excel
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>Adicionar LI</Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nova Licença de Importação</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
              <Input
                placeholder="IMP-00000"
                value={form.imp}
                onChange={(e) => setForm({ ...form, imp: e.target.value })}
              />
              <Input
                placeholder="Importador"
                value={form.importador}
                onChange={(e) =>
                  setForm({ ...form, importador: e.target.value })
                }
              />
              <Input
                placeholder="Referência do Cliente"
                value={form.referenciaDoCliente}
                onChange={(e) =>
                  setForm({ ...form, referenciaDoCliente: e.target.value })
                }
              />

              <Input
                placeholder="Número da LI"
                value={form.numeroLi}
                onChange={(e) => setForm({ ...form, numeroLi: e.target.value })}
              />

              <Input
                placeholder="Número do Orquestra"
                type="number"
                value={form.numeroOrquestra || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    numeroOrquestra: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
              <Input
                placeholder="NCM"
                value={form.ncm}
                onChange={(e) => setForm({ ...form, ncm: e.target.value })}
              />

              <Input
                placeholder="Data Registro LI"
                value={form.dataRegistroLI}
                onChange={(e) =>
                  setForm({ ...form, dataRegistroLI: e.target.value })
                }
              />
              <Input
                placeholder="Data Pagamento"
                value={form.dataInclusaoOrquestra}
                onChange={(e) =>
                  setForm({ ...form, dataInclusaoOrquestra: e.target.value })
                }
              />

              <div className="flex flex-col gap-1">
                <Input
                  type="text"
                  value={form.previsaoDeferimento}
                  readOnly
                  placeholder="Previsão de Deferimento"
                />
              </div>

              {/* Textarea em linha separada no grid */}
              <div className="col-span-full">
                <Textarea
                  placeholder="Observações"
                  className="min-h-[80px]"
                  value={form.observacoes}
                  onChange={(e) =>
                    setForm({ ...form, observacoes: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Rodapé alinhado e com botões claros */}
            <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button onClick={handleAdd} className="w-full sm:w-auto">
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-h-[550px] overflow-auto rounded-2xl border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white shadow-md dark:bg-zinc-900">
            <TableRow>
              {colunasVisiveis.imp && <TableHead>IMP</TableHead>}
              {colunasVisiveis.importador && <TableHead>Importador</TableHead>}
              {colunasVisiveis.referenciaDoCliente && (
                <TableHead>Referência</TableHead>
              )}
              {colunasVisiveis.numeroOrquestra && (
                <TableHead>Nº Orquestra</TableHead>
              )}
              {colunasVisiveis.numeroLi && <TableHead>Numero LI</TableHead>}
              {colunasVisiveis.ncm && <TableHead>NCM</TableHead>}
              {colunasVisiveis.dataRegistroLI && (
                <TableHead>Registro LI</TableHead>
              )}
              {colunasVisiveis.dataInclusaoOrquestra && (
                <TableHead>Data Pagamento</TableHead>
              )}
              {colunasVisiveis.previsaoDeferimento && (
                <TableHead>Previsão Deferimento</TableHead>
              )}
              {colunasVisiveis.situacao && <TableHead>Situação</TableHead>}
              {colunasVisiveis.observacoes && (
                <TableHead>Observações</TableHead>
              )}
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              : filteredData.map((item, index) => (
                  <TableRow key={index}>
                    {colunasVisiveis.imp && (
                      <TableCell>
                        <Input
                          value={item.imp}
                          onChange={(e) =>
                            handleChange("imp", e.target.value, item.$id)
                          }
                          className="w-full sm:w-[110px]"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.importador && (
                      <TableCell>
                        <Input
                          value={item.importador}
                          onChange={(e) =>
                            handleChange("importador", e.target.value, item.$id)
                          }
                          className="w-full sm:w-[120px]"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.referenciaDoCliente && (
                      <TableCell>
                        <Input
                          value={item.referenciaDoCliente}
                          onChange={(e) =>
                            handleChange(
                              "referenciaDoCliente",
                              e.target.value,
                              item.$id
                            )
                          }
                          className="w-full sm:w-[110px]"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.numeroOrquestra && (
                      <TableCell>
                        <Input
                          value={item.numeroOrquestra}
                          onChange={(e) =>
                            handleChange(
                              "numeroOrquestra",
                              e.target.value,
                              item.$id
                            )
                          }
                          className="w-full sm:w-[110px]"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.numeroLi && (
                      <TableCell>
                        <Input
                          value={item.numeroLi}
                          onChange={(e) =>
                            handleChange("numeroLi", e.target.value, item.$id)
                          }
                          className="w-full sm:w-[120px]"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.ncm && (
                      <TableCell>
                        <Input
                          value={item.ncm}
                          onChange={(e) =>
                            handleChange("ncm", e.target.value, item.$id)
                          }
                          className="w-full sm:w-[110px]"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.dataRegistroLI && (
                      <TableCell>
                        <Input
                          type="text"
                          value={item.dataRegistroLI}
                          onChange={(e) =>
                            handleChange(
                              "dataRegistroLI",
                              e.target.value,
                              item.$id
                            )
                          }
                          className="w-full sm:w-[110px]"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.dataInclusaoOrquestra && (
                      <TableCell>
                        <Input
                          type="text"
                          value={item.dataInclusaoOrquestra}
                          onChange={(e) =>
                            handleChange(
                              "dataInclusaoOrquestra",
                              e.target.value,
                              item.$id
                            )
                          }
                          className="w-full sm:w-[130px]"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.previsaoDeferimento && (
                      <TableCell>
                        <Input
                          type="text"
                          value={item.previsaoDeferimento}
                          readOnly
                          className="w-full sm:w-[130px]"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.situacao && (
                      <TableCell>
                        <select
                          className={`${getSituacaoColor(item.situacao)} rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-white/20 dark:bg-zinc-900`}
                          value={item.situacao}
                          onChange={(e) =>
                            handleChange("situacao", e.target.value, item.$id)
                          }
                        >
                          <option value="em análise">Em análise</option>
                          <option value="cancelada">Cancelada</option>
                          <option value="deferida">Deferida</option>
                          <option value="indeferida">Indeferida</option>
                        </select>
                      </TableCell>
                    )}
                    {colunasVisiveis.observacoes && (
                      <TableCell>
                        <Textarea
                          value={item.observacoes}
                          onChange={(e) =>
                            handleChange(
                              "observacoes",
                              e.target.value,
                              item.$id
                            )
                          }
                          className="w-full"
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDuplicate(index)}
                          className="w-[40px] dark:bg-zinc-800 dark:text-white"
                        >
                          <FaCopy />
                        </Button>
                        <Button
                          onClick={() => handleRemove(index)}
                          className="w-[40px] dark:bg-zinc-800 dark:text-white"
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
