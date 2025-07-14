'use client';
import Cookies from 'js-cookie';

import React, { useEffect, useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import * as XLSX from 'xlsx';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Download, Filter, Search, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PLANILHA_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQh3TlwfOnJOB5pMIvEA5UNiYLHD5jODIgGCqpvMDqFR05HAGbysqJBXCdfENahY151zEs5ri6ebJPY/pub?gid=0&single=true&output=csv';

function parseCSV(csv: string): any[] {
  const lines = csv.trim().split('\n');
  let headers = lines[0].split(',').map((h) => h.trim());

  const headerCount: Record<string, number> = {};
  headers = headers.map((header) => {
    if (!headerCount[header]) {
      headerCount[header] = 1;
      return header;
    } else {
      headerCount[header]++;
      return `${header}_${headerCount[header]}`;
    }
  });

  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return headers.reduce(
      (obj, key, idx) => {
        obj[key] = values[idx]?.trim() ?? '';
        return obj;
      },
      {} as Record<string, string>,
    );
  });
}

// Mapeamento de cores para SITUAÇÃO
const situacaoStyles: Record<string, string> = {
  'AGUARD. DOCS': 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#3b2f0b] dark:text-[#f5e8b3]', // amarelo suave
  'APOEMA/ABRIR': 'bg-[#DBEAFE] text-[#1E3A8A] dark:bg-[#243c5a] dark:text-[#c5d8f7]', // azul claro
  CONFERIDO: 'bg-[#D1FAE5] text-[#065F46] dark:bg-[#1f3d35] dark:text-[#a7f3d0]', // verde claro
  FAZER: 'bg-[#FEE2E2] text-[#991B1B] dark:bg-[#472828] dark:text-[#fecaca]', // vermelho claro
  'FAZER LI': 'bg-[#FFEDD5] text-[#9A3412] dark:bg-[#4a2e1b] dark:text-[#fdebc8]', // laranja claro
  'FAZER LI / FAZER PO': 'bg-[#FED7AA] text-[#7C2D12] dark:bg-[#4b3424] dark:text-[#ffe8c7]', // laranja médio
  'FAZER PO': 'bg-[#FDBA74] text-[#78350F] dark:bg-[#5a3b1d] dark:text-[#ffd7aa]', // laranja forte
  IMPORTAÇÃO: 'bg-[#E9D5FF] text-[#6B21A8] dark:bg-[#3d2d52] dark:text-[#e0c5ff]', // roxo claro
  'IMPRIMIR / FAZER LI': 'bg-[#FCE7F3] text-[#9D174D] dark:bg-[#4a2b39] dark:text-[#fbcfe8]', // rosa claro
  REGISTRADO: 'bg-[#CCFBF1] text-[#0F766E] dark:bg-[#1f3b3a] dark:text-[#99f6e4]', // teal claro
};

export default function PlanilhaPage() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [situacoesSelecionadas, setSituacoesSelecionadas] = useState<string[]>(['APOEMA/ABRIR']);
  const [colunasVisiveis, setColunasVisiveis] = useState<Record<string, boolean>>({});
  const [ordenarPor, setOrdenarPor] = useState<'ETD' | 'ETA' | null>(null);
  const [ordemAscendente, setOrdemAscendente] = useState(true);

  function parseDataBrasil(data: string): Date | null {
    if (!data) return null;
    const [dia, mes, ano] = data.split('/');
    if (!dia || !mes || !ano) return null;
    return new Date(+ano, +mes - 1, +dia);
  }

  const opcoesSituacao = [
    'AGUARD. DOCS',
    'APOEMA/ABRIR',
    'CONFERIDO',
    'FAZER',
    'FAZER LI',
    'FAZER LI / FAZER PO',
    'FAZER PO',
    'IMPORTAÇÃO',
    'IMPRIMIR / FAZER LI',
    'REGISTRADO',
  ];

  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(PLANILHA_CSV_URL);
        const text = await response.text();
        const parsed = parseCSV(text);
        const apenasInmetro = parsed.filter((row) => {
          const valor = row['ANUÊNCIA']?.toUpperCase().trim();
          return valor && valor.includes('INMETRO');
        });

        setData(apenasInmetro);

        const headers = Object.keys(apenasInmetro[0] || {});

        const cookieColunas = Cookies.get('colunasVisiveisPreEmbarque');
        const parsedCookie = cookieColunas ? JSON.parse(cookieColunas) : null;

        const colunasIniciais = headers.reduce(
          (acc, key) => {
            acc[key] =
              parsedCookie?.[key] ??
              [
                'IMP',
                'IMPORTADOR',
                'ADQUIRENTE',
                'REFERENCIA',
                'ETD',
                'ETA',
                'DESTINO',
                'NAVIO',
                'CONTAINER',
                'SITUAÇÃO',
                'BL',
              ].includes(key);
            return acc;
          },
          {} as Record<string, boolean>,
        );

        setColunasVisiveis(colunasIniciais);
      } catch (error) {
        console.error('Erro ao carregar planilha:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const termo = search.toLowerCase();

    let resultado = data.filter((row) => {
      const situacaoKey = Object.keys(row).find((k) => k.trim().toUpperCase() === 'SITUAÇÃO');
      const situacao = situacaoKey ? row[situacaoKey]?.toUpperCase().trim() : '';
      const situacaoValida =
        situacoesSelecionadas.length === 0 || situacoesSelecionadas.includes(situacao);
      const contemBusca = Object.values(row).some(
        (value) => typeof value === 'string' && value.toLowerCase().includes(termo),
      );
      return situacaoValida && contemBusca;
    });

    if (ordenarPor) {
      resultado = [...resultado].sort((a, b) => {
        const dataA = parseDataBrasil(a[ordenarPor] || '');
        const dataB = parseDataBrasil(b[ordenarPor] || '');
        if (!dataA || !dataB) return 0;
        return ordemAscendente
          ? dataA.getTime() - dataB.getTime()
          : dataB.getTime() - dataA.getTime();
      });
    }

    setFilteredData(resultado);
  }, [search, data, situacoesSelecionadas, ordenarPor, ordemAscendente]);

  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const contarPorSituacao = (situacao: string) => {
    const situacaoKey = Object.keys(data[0] || {}).find(
      (k) => k.trim().toUpperCase() === 'SITUAÇÃO',
    );
    if (!situacaoKey) return 0;
    return data.filter((row) => row[situacaoKey]?.toUpperCase().trim() === situacao.toUpperCase())
      .length;
  };

  return (
    <div className=" bg-zinc-100 dark:bg-zinc-900/80 p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-zinc-900/80 dark:border dark:border-zinc-700 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 space-y-6 w-full transition-colors"
      >
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Anuência INMETRO
            </h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <Input
                placeholder="Buscar em todas as colunas"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 transition"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="w-full md:w-[300px]">
              <Select
                onValueChange={(value) => {
                  if (value === '__all') {
                    setSituacoesSelecionadas([]);
                  } else {
                    setSituacoesSelecionadas([value]);
                  }
                }}
                value={situacoesSelecionadas[0] || '__all'}
              >
                <SelectTrigger className="rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
                  <SelectValue placeholder="Filtrar por Situação" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-lg">
                  <SelectItem value="__all">Mostrar todas ({data.length})</SelectItem>
                  {opcoesSituacao.map((situacao) => (
                    <SelectItem key={situacao} value={situacao}>
                      {situacao} ({contarPorSituacao(situacao)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Selecionar colunas
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg">
                <div className="grid gap-3 p-2">
                  {Object.keys(colunasVisiveis).map((coluna) => (
                    <div key={coluna} className="flex items-center space-x-2">
                      <Checkbox
                        id={coluna}
                        checked={colunasVisiveis[coluna]}
                        onCheckedChange={(checked) => {
                          const novoEstado = {
                            ...colunasVisiveis,
                            [coluna]: !!checked,
                          };

                          setColunasVisiveis(novoEstado);

                          Cookies.set('colunasVisiveisPreEmbarque', JSON.stringify(novoEstado), {
                            expires: 30,
                          });
                        }}
                        className="border-zinc-300 dark:border-zinc-600"
                      />
                      <Label
                        htmlFor={coluna}
                        className="capitalize text-sm text-zinc-700 dark:text-zinc-200"
                      >
                        {coluna}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Tabela */}
        <div
          ref={parentRef}
          className="relative overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700 w-full scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800"
        >
          <Table className="table-fixed w-full">
            <TableHeader className="sticky top-0 z-10 bg-white dark:bg-zinc-900/90 backdrop-blur-sm shadow-sm">
              <TableRow>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <TableHead key={idx} className="px-3 py-2">
                        <Skeleton className="h-4 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                      </TableHead>
                    ))
                  : Object.keys(colunasVisiveis)
                      .filter((key) => colunasVisiveis[key])
                      .map((key) => (
                        <TableHead
                          key={key}
                          className="px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="truncate cursor-pointer flex items-center gap-1"
                                onClick={() => {
                                  if (key === 'ETD' || key === 'ETA') {
                                    if (ordenarPor === key) {
                                      setOrdemAscendente((prev) => !prev);
                                    } else {
                                      setOrdenarPor(key);
                                      setOrdemAscendente(true);
                                    }
                                  }
                                }}
                              >
                                {key}
                                {(key === 'ETD' || key === 'ETA') && (
                                  <span className="text-xs">
                                    {ordenarPor === key ? (ordemAscendente ? '↑' : '↓') : '⇅'}
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-sm break-words">
                              {key}
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                      ))}
              </TableRow>
            </TableHeader>
            <TableBody
              style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
            >
              <AnimatePresence>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, idx) => (
                      <TableRow key={idx} className="bg-white dark:bg-zinc-900">
                        <TableCell colSpan={5} className="px-3 py-2">
                          <Skeleton className="h-4 w-full rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredData.map((row, rowIndex) => (
                      <motion.tr
                        key={rowIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`${
                          rowIndex % 2 === 0
                            ? 'bg-white dark:bg-zinc-900'
                            : 'bg-zinc-50 dark:bg-zinc-800/70'
                        } hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors`}
                      >
                        {Object.keys(colunasVisiveis)
                          .filter((key) => colunasVisiveis[key])
                          .map((key, colIdx) => (
                            <TableCell
                              key={colIdx}
                              className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`truncate ${
                                      key.toUpperCase() === 'SITUAÇÃO'
                                        ? situacaoStyles[row[key]?.toUpperCase().trim()] ||
                                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                        : ''
                                    } rounded-md px-1 py-0.5 cursor-default`}
                                  >
                                    {String(row[key] || '')}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs break-words text-xs">
                                  {String(row[key] || '')}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          ))}
                      </motion.tr>
                    ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
