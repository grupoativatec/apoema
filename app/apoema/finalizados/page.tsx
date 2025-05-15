/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrquestrasFinalizadas } from "@/lib/actions/orquestra.actions";

function parseBrazilianDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}`);
}

const Page = () => {
  const [orquestras, setOrquestras] = useState<any[]>([]);
  const [analysts, setAnalysts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Todos");
  const [filteredOrquestras, setFilteredOrquestras] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"recebimento" | "chegada">(
    "recebimento"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getOrquestrasFinalizadas();

      const sorted = [...data].sort((a, b) => {
        const dateA = parseBrazilianDate(a.recebimento);
        const dateB = parseBrazilianDate(b.recebimento);
        return dateB.getTime() - dateA.getTime();
      });

      setOrquestras(sorted);

      const uniqueAnalysts = Array.from(
        new Set(
          sorted
            .map((item) => item.analista)
            .filter((a) => typeof a === "string" && a.trim() !== "")
        )
      );

      setAnalysts(uniqueAnalysts);
      setActiveTab("Todos"); // Aba padrão
      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let data = [...orquestras];

    // Filtro por analista
    if (activeTab !== "Todos") {
      data = data.filter((item) => item.analista === activeTab);
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase().replace(/\s+/g, "");
      const normalize = (str = "") => str.toLowerCase().replace(/\s+/g, "");

      data = data.filter((item) =>
        [item.imp, item.referencia, item.importador, item.exportador].some(
          (field) => normalize(field).includes(term)
        )
      );
    }

    // Ordenação
    data.sort((a, b) => {
      const dateA = parseBrazilianDate(a[sortField]);
      const dateB = parseBrazilianDate(b[sortField]);
      return sortDirection === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

    setFilteredOrquestras(data);
  }, [orquestras, activeTab, searchTerm, sortField, sortDirection]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field: "recebimento" | "chegada") => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
  };

  const getArrow = (field: string) => {
    if (sortField === field) {
      return sortDirection === "asc" ? " ▲" : " ▼";
    }
    return " ▲▼";
  };

  return (
    <div className="w-[90vw] bg-white p-8 shadow-lg dark:bg-zinc-900">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Processos Finalizados</h1>
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              theme === "dark"
                ? "text-white dark:bg-zinc-800"
                : "bg-zinc-100 text-muted-foreground hover:bg-muted"
            }`}
          >
            {theme === "dark" ? "☀️ Tema Claro" : "🌙 Tema Escuro"}
          </button>
        )}
      </div>

      <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
        Acompanhe todos os processos que a Apoema finalizou.
      </p>

      <Input
        placeholder="Buscar..."
        disabled={isLoading}
        value={searchTerm}
        onChange={handleSearch}
        className="mb-5 mt-4 w-full md:w-96"
      />

      {/* Abas com "Todos" + analistas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
        {["Todos", ...analysts].map((analista) => (
          <button
            key={analista}
            onClick={() => setActiveTab(analista)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === analista
                ? "bg-primary text-white shadow-sm dark:text-black"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {analista}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="max-h-[90vh] overflow-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imp</TableHead>
              <TableHead>Ref. Cliente</TableHead>
              <TableHead>Exportador</TableHead>
              <TableHead>Importador</TableHead>
              <TableHead
                onClick={() => handleSort("recebimento")}
                className="cursor-pointer"
              >
                Recebimento{getArrow("recebimento")}
              </TableHead>
              <TableHead
                onClick={() => handleSort("chegada")}
                className="cursor-pointer"
              >
                Prev. Chegada{getArrow("chegada")}
              </TableHead>
              <TableHead>Destino</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array(7)
                    .fill(0)
                    .map((_, j) => (
                      <TableCell key={`cell-${i}-${j}`}>
                        <Skeleton className="h-4 w-full rounded" />
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : filteredOrquestras.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  Nenhuma IMP encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrquestras.map((item) => (
                <TableRow key={`row-${item.imp}`}>
                  <TableCell>{item.imp || "-"}</TableCell>
                  <TableCell>{item.referencia || "-"}</TableCell>
                  <TableCell>{item.exportador || "-"}</TableCell>
                  <TableCell>{item.importador || "-"}</TableCell>
                  <TableCell>{item.recebimento || "-"}</TableCell>
                  <TableCell>{item.chegada || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-lg px-3 py-1 text-sm text-white ${
                        ["navegantes", "itajai - sc"].includes(
                          item.destino?.toLowerCase()
                        )
                          ? "bg-[#2ecc71]"
                          : ["sao francisco", "itapoa - sc"].includes(
                                item.destino?.toLowerCase()
                              )
                            ? "bg-[#e91e63]"
                            : item.destino?.toLowerCase() === "santos"
                              ? "bg-[#333333]"
                              : "bg-[#7f8c8d]"
                      }`}
                    >
                      {item.destino || "-"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
