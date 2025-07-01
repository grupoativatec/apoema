/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import * as XLSX from 'xlsx';

import React, { useState, useEffect, useRef } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FaCopy, FaTrashAlt } from 'react-icons/fa';
import {
  createLicencaImportacao,
  deleteLicencaImportacao,
  getLicencasImportacao,
  updateLicencaImportacao,
} from '@/lib/actions/li.actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useVirtualizer } from '@tanstack/react-virtual';

const formatarDataBrasileira = (data: string | Date): string => {
  if (!data) return '';

  if (data instanceof Date) {
    return data.toLocaleDateString('pt-BR');
  }

  if (typeof data === 'string') {
    const partes = data.split('-');
    if (partes.length !== 3) return data;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return '';
};

const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const formatarDataInternacional = (data: string) => {
  if (!data) return '';
  const partes = data.split('/');
  if (partes.length !== 3) return data;
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
};

const Page = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [mostrarSomenteNaoDeferidas, setMostrarSomenteNaoDeferidas] = useState(true);

  const [form, setForm] = useState({
    imp: '',
    importador: '',
    referenciaDoCliente: '',
    numeroOrquestra: 0,
    numeroLi: '',
    ncm: '',
    dataRegistroLI: '',
    dataInclusaoOrquestra: '',
    previsaoDeferimento: '',
    situacao: 'analise',
    observacoes: '',
  });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const calcularPrevisaoDeferimento = (dataInclusao: string): string => {
    const data = new Date(dataInclusao);
    data.setDate(data.getDate() + 11);
    const iso = data.toISOString().split('T')[0];
    return formatarDataBrasileira(iso);
  };

  const verificarEAtualizarDeferidas = async (licencas: any[]) => {
    const normalizarNumeroLI = (valor: string): string => {
      return valor.replace(/\D/g, '');
    };

    try {
      const response = await fetch('/api/li-deferidas', {
        method: 'POST',
        headers: {
          Authorization: 'Cn53OKGD6t5wyIlylTTn91A_ZWzne1TcQKuYycuhVoCZ4Q2nICni2L3VBChnhIaN4',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Erro ao buscar dados das LIs deferidas.');

      const { dados: deferidas = [] } = await response.json();

      const licencasAtualizadas = licencas.map((li) => {
        const encontrada = deferidas.find(
          (d: any) =>
            d.IMP === li.imp &&
            normalizarNumeroLI(d.NumeroLI) === normalizarNumeroLI(li.numeroLi) &&
            d.StatusSiscomex === 'DEFERIDA',
        );

        if (encontrada && li.situacao.toLowerCase() !== 'deferida') {
          return { ...li, situacao: 'deferida', precisaAtualizar: true };
        }
        return li;
      });

      const deferidasAtualizadas = licencasAtualizadas.filter((li) => li.precisaAtualizar);

      const atualizacoes = licencasAtualizadas
        .filter((li) => li.precisaAtualizar)
        .map((li) =>
          updateLicencaImportacao(Number(li.licencaimportacaoid), {
            ...li,
            numeroOrquestra: parseInt(li.numeroOrquestra, 10) || 0,
            dataRegistroLI: formatarDataInternacional(li.dataRegistroLI),
            dataInclusaoOrquestra: formatarDataInternacional(li.dataInclusaoOrquestra),
            previsaoDeferimento: formatarDataInternacional(li.previsaoDeferimento),
            situacao: 'deferida',
            observacoes: li.observacoes,
          }),
        );

      await Promise.all(atualizacoes);

      setData(
        licencasAtualizadas.map((li) => {
          const { precisaAtualizar, ...rest } = li;
          return rest;
        }),
      );

      if (deferidasAtualizadas.length > 0) {
        toast({
          title: 'Licenças deferidas',
          description: `${deferidasAtualizadas.length} licença(s) foram atualizadas com sucesso para o status DEFERIDA.`,
        });
      }
    } catch (err) {
      console.error('Erro ao verificar LIs deferidas:', err);
    }
  };

  useEffect(() => {
    const fetchLicencas = async () => {
      try {
        const licencas = await getLicencasImportacao();
        const formatadas = licencas.map((item: any) => ({
          ...item,
          dataRegistroLI: formatarDataBrasileira(item.dataRegistroLI),
          dataInclusaoOrquestra: formatarDataBrasileira(item.dataInclusaoOrquestra),
          previsaoDeferimento: formatarDataBrasileira(item.previsaoDeferimento),
        }));
        setData(formatadas);

        await verificarEAtualizarDeferidas(formatadas);
      } catch (error) {
        console.error('Erro ao buscar Licenças de Importação:', error);
      } finally {
        setIsLoading(false); // Finaliza o carregamento
      }
    };
    fetchLicencas();
  }, []);

  const handleDuplicate = (id: string | number) => {
    const original = data?.find((item) => item.licencaimportacaoid === id);
    if (!original) {
      toast({
        title: 'Erro ao duplicar',
        description: 'Item original não encontrado.',
        variant: 'destructive',
      });
      return;
    }

    const { licencaimportacaoid, $databaseId, $collectionId, $createdAt, $updatedAt, ...cleaned } =
      original;

    const formatarOuVazio = (data: string) => {
      const iso = formatarDataInternacional(data);
      return isNaN(Date.parse(iso)) ? '' : iso;
    };

    const novoItem = {
      ...cleaned,
      dataRegistroLI: formatarOuVazio(cleaned.dataRegistroLI),
      dataInclusaoOrquestra: formatarOuVazio(cleaned.dataInclusaoOrquestra),
      previsaoDeferimento: formatarOuVazio(cleaned.previsaoDeferimento),
    };

    createLicencaImportacao(novoItem)
      .then((res) => {
        const novo = {
          ...res,
          dataRegistroLI: formatarDataBrasileira(res.dataRegistroLI),
          dataInclusaoOrquestra: formatarDataBrasileira(res.dataInclusaoOrquestra),
          previsaoDeferimento: formatarDataBrasileira(res.previsaoDeferimento),
        };

        setData((prev) => [...(prev || []), novo]);

        toast({
          title: 'LI duplicada com sucesso',
          description: `A LI ${res.numeroLi} foi adicionada.`,
        });
      })
      .catch((err) => {
        console.error('Erro ao duplicar Licença de Importação:', err);
        toast({
          title: 'Erro ao duplicar LI',
          description: 'Verifique os dados do item original ou tente novamente mais tarde.',
          variant: 'destructive',
        });
      });
  };

  // EDITA A DATA

  const handleChange = (field: string, value: string, id: string) => {
    if (!data) return;

    const updatedData = data.map((item) => {
      if (item.licencaimportacaoid === id) {
        const updatedItem = {
          ...item,
          [field]: field === 'numeroOrquestra' ? parseInt(value, 10) || 0 : value,
        };

        // Se o campo alterado for "dataInclusaoOrquestra", calcule a previsão de deferimento
        if (field === 'dataInclusaoOrquestra' && value.length === 10) {
          const dateParts = value.split('/');
          if (dateParts.length === 3) {
            const [day, month, year] = dateParts;
            const fullYear = year.length === 2 ? `20${year}` : year;
            const formattedDate = `${fullYear}-${month}-${day}`;
            updatedItem.previsaoDeferimento = calcularPrevisaoDeferimento(formattedDate);
          }
        }

        return updatedItem;
      }
      return item;
    });

    setData(updatedData);
  };

  //Função para salvar os dados apenas com o ENTER
  const handleSave = async (id: string) => {
    const item = data?.find((i) => i.licencaimportacaoid === id);
    if (!item) return;

    // Regex formats
    const formatoImp = /^IMP-\d{6}$/;
    const formatoNumeroLi = /^\d{2}\/\d{7}-\d{1}$/;
    const formatoNumeroOrquestra = /^\d{7}$/;

    // Sanitize inputs
    const numeroOrquestra = item.numeroOrquestra?.toString().trim() || '';
    const imp = item.imp?.trim().toUpperCase() || '';
    const numeroLi = item.numeroLi?.trim() || '';

    // Validação do Número Orquestra (7 dígitos)
    if (!formatoNumeroOrquestra.test(numeroOrquestra)) {
      toast({
        title: 'Formato inválido',
        description: 'Número do Orquestra inválido. Deve conter exatamente 7 dígitos (ex: 3350012)',
        variant: 'destructive',
      });
      return;
    }

    // Validação do formato IMP (IMP-123456)
    if (!formatoImp.test(imp)) {
      toast({
        title: 'Formato inválido',
        description: 'IMP inválido. O formato correto é: IMP-233631',
        variant: 'destructive',
      });
      return;
    }

    // Validação do formato número LI: 25/1350447-1
    if (!formatoNumeroLi.test(numeroLi)) {
      toast({
        title: 'Formato inválido',
        description: 'O número da LI deve seguir o padrão: 25/1350447-1',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateLicencaImportacao(Number(id), {
        ...item,
        numeroOrquestra: parseInt(item.numeroOrquestra, 10) || 0,
        dataRegistroLI: formatarDataInternacional(item.dataRegistroLI),
        dataInclusaoOrquestra: formatarDataInternacional(item.dataInclusaoOrquestra),
        previsaoDeferimento: formatarDataInternacional(item.previsaoDeferimento),
        situacao: item.situacao,
        observacoes: item.observacoes,
      });
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
    }
  };

  const handleSaveOnEnter = async (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: string,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSave(id);
    }
  };

  // Fim da função
  const handleAdd = async () => {
    try {
      const formatoNumeroLi = /^\d{2}\/\d{7}-\d{1}$/;
      const formatoImp = /^IMP-\d{6}$/;
      const formatoNumeroOrquestra = /^\d{7}$/;

      if (!formatoNumeroOrquestra.test(form.numeroOrquestra.toString())) {
        toast({
          title: 'Formato inválido',
          description:
            'Número do Orquestra inválido. Deve conter exatamente 7 dígitos (ex: 3350012)',
          variant: 'destructive',
        });
        return;
      }

      if (!formatoImp.test(form.imp)) {
        toast({
          title: 'Formato inválido',
          description: 'IMP inválido. O formato correto é: IMP-233631',
          variant: 'destructive',
        });
        return;
      }

      if (!formatoNumeroLi.test(form.numeroLi)) {
        toast({
          title: 'Formato inválido',
          description: 'O número da LI deve seguir o padrão: 25/1350447-1',
          variant: 'destructive',
        });
        return;
      }

      const dataInclusao = formatarDataInternacional(form.dataInclusaoOrquestra);
      const dataRegistro = formatarDataInternacional(form.dataRegistroLI);
      const previsaoDeferimento = calcularPrevisaoDeferimento(dataInclusao);

      const result = await createLicencaImportacao({
        ...form,
        dataRegistroLI: dataRegistro,
        dataInclusaoOrquestra: dataInclusao,
        previsaoDeferimento: formatarDataInternacional(previsaoDeferimento),
        situacao: form.situacao,
      });

      const novaLI = {
        ...result,
        dataRegistroLI: formatarDataBrasileira(result.dataRegistroLI),
        dataInclusaoOrquestra: formatarDataBrasileira(result.dataInclusaoOrquestra),
        previsaoDeferimento: formatarDataBrasileira(result.previsaoDeferimento),
      };

      setData([...(data || []), novaLI]);
      setOpen(false);
      setForm({
        imp: '',
        importador: '',
        referenciaDoCliente: '',
        numeroOrquestra: 0,
        numeroLi: '',
        ncm: '',
        dataRegistroLI: '',
        dataInclusaoOrquestra: '',
        previsaoDeferimento: '',
        situacao: 'analise',
        observacoes: '',
      });
    } catch (error) {
      console.error('Erro ao adicionar Licença de Importação', error);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const itemRemovido = data?.find((item) => item.licencaimportacaoid === id);

      await deleteLicencaImportacao(Number(id));
      const updatedData = data!.filter((item) => item.licencaimportacaoid !== id);
      setData(updatedData);

      toast({
        title: `LI ${itemRemovido?.numeroLi || ''} (${itemRemovido?.imp || ''}) deletada com sucesso`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir LI',
        description: 'Não foi possível remover a licença. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const termo = search.toLowerCase().replace(/\s/g, '');

  const filteredData = (data || []).filter((item) => {
    const normalizar = (valor: string) => valor?.toLowerCase().replace(/\s/g, '') || '';

    const correspondeBusca =
      normalizar(item.imp).includes(termo) ||
      normalizar(item.importador).includes(termo) ||
      normalizar(item.referenciaDoCliente).includes(termo) ||
      normalizar(item.numeroLi).includes(termo);

    const naoDeferida = mostrarSomenteNaoDeferidas
      ? item.situacao?.toLowerCase() !== 'deferida'
      : true;

    return correspondeBusca && naoDeferida;
  });

  const exportarParaExcel = () => {
    if (!data || data.length === 0) return;

    const dadosParaExportar = data.map((item) => ({
      IMP: item.imp,
      Importador: item.importador,
      'Referência do Cliente': item.referenciaDoCliente,
      'Número do Orquestra': item.numeroOrquestra,
      'Número da LI': item.numeroLi,
      NCM: item.ncm,
      'Data Registro LI': item.dataRegistroLI,
      'Data Inclusão Orquestra': item.dataInclusaoOrquestra,
      'Previsão Deferimento': item.previsaoDeferimento,
      Situação: item.situacao,
      Observações: item.observacoes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Licenças de Importação');

    XLSX.writeFile(workbook, 'licencas-importacao.xlsx');
  };

  const getSituacaoColor = (situacao: string) => {
    const normalized = situacao.toLowerCase();

    if (normalized === 'deferida') return 'text-[#059669] font-semibold dark:text-green'; // verde
    if (normalized === 'indeferida' || normalized === 'cancelada')
      return 'text-[#DC2626] dark:text-red font-semibold'; // vermelho
    return 'text-[#374151] dark:text-white'; // cinza escuro
  };

  function formatColumnName(coluna: string) {
    switch (coluna) {
      case 'imp':
        return 'Imp';
      case 'importador':
        return 'Importador';
      case 'referenciaDoCliente':
        return 'Referência';
      case 'numeroOrquestra':
        return 'Nº Orquestra';
      case 'numeroLi':
        return 'Número LI';
      case 'ncm':
        return 'Ncm';
      case 'dataRegistroLI':
        return 'Data de Registro LI';
      case 'dataInclusaoOrquestra':
        return 'Data de Pagamento';
      case 'previsaoDeferimento':
        return 'Previsão Deferimento';
      case 'situacao':
        return 'Situação';
      case 'observacoes':
        return 'Observações';
      default:
        return (
          coluna.charAt(0).toUpperCase() +
          coluna
            .slice(1)
            .replace(/([A-Z])/g, ' $1')
            .trim()
        );
    }
  }

  const [colunasVisiveis, setColunasVisiveis] = useState(() => {
    const savedColumns = getCookie('colunasVisiveis');
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
      const updatedColunas = { ...prev, [coluna]: !prev[coluna] };

      // Salvar no cookie
      setCookie('colunasVisiveis', JSON.stringify(updatedColunas), 365);

      return updatedColunas;
    });
  };

  // Virtualizer configurado com os dados filtrados
  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  return (
    <div className="space-y-10 rounded-2xl bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:gap-0">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Controle de Licenças de Importação
          </h1>
          <p className="text-sm text-muted-foreground">Visualize e gerencie as LIs registradas.</p>

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
                      <span className="capitalize">{formatColumnName(coluna)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center gap-3 uppercase">
            <Switch
              checked={mostrarSomenteNaoDeferidas}
              onCheckedChange={() => setMostrarSomenteNaoDeferidas((prev) => !prev)}
            />
            <span className="text-sm text-muted-foreground">Somente LIs não deferidas</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 uppercase">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={isLoading} className="uppercase">
                Adicionar LI
              </Button>
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
                  onChange={(e) => setForm({ ...form, importador: e.target.value })}
                />
                <Input
                  placeholder="Referência do Cliente"
                  value={form.referenciaDoCliente}
                  onChange={(e) => setForm({ ...form, referenciaDoCliente: e.target.value })}
                />

                <Input
                  placeholder="Número da LI"
                  value={form.numeroLi}
                  onChange={(e) => setForm({ ...form, numeroLi: e.target.value })}
                />

                <Input
                  placeholder="Número do Orquestra"
                  type="number"
                  value={form.numeroOrquestra || ''}
                  onChange={(e) =>
                    setForm({ ...form, numeroOrquestra: parseInt(e.target.value, 10) || 0 })
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
                  onChange={(e) => setForm({ ...form, dataRegistroLI: e.target.value })}
                />
                <Input
                  placeholder="Data Pagamento"
                  value={form.dataInclusaoOrquestra}
                  onChange={(e) => setForm({ ...form, dataInclusaoOrquestra: e.target.value })}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && value.length === 10) {
                      const dateParts = value.split('/');
                      if (dateParts.length === 3) {
                        const [day, month, year] = dateParts;
                        const fullYear = year.length === 2 ? `20${year}` : year;
                        const formattedDate = `${fullYear}-${month}-${day}`;
                        const previsao = calcularPrevisaoDeferimento(formattedDate);
                        setForm((prev) => ({ ...prev, previsaoDeferimento: previsao }));
                      }
                    }
                  }}
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
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
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
          <Button onClick={exportarParaExcel} disabled={isLoading} className="uppercase">
            Exportar para Excel
          </Button>
        </div>
      </div>

      <div ref={parentRef} className="max-h-[550px] overflow-auto rounded-2xl border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white shadow-md dark:bg-zinc-900">
            <TableRow>
              {colunasVisiveis.imp && <TableHead>IMP</TableHead>}
              {colunasVisiveis.importador && <TableHead>Importador</TableHead>}
              {colunasVisiveis.referenciaDoCliente && <TableHead>Referência</TableHead>}
              {colunasVisiveis.numeroOrquestra && <TableHead>Nº Orquestra</TableHead>}
              {colunasVisiveis.numeroLi && <TableHead>Numero LI</TableHead>}
              {colunasVisiveis.ncm && <TableHead>NCM</TableHead>}
              {colunasVisiveis.dataRegistroLI && <TableHead>Registro LI</TableHead>}
              {colunasVisiveis.dataInclusaoOrquestra && <TableHead>Data Pagamento</TableHead>}
              {colunasVisiveis.previsaoDeferimento && <TableHead>Previsão Deferimento</TableHead>}
              {colunasVisiveis.situacao && <TableHead>Situação</TableHead>}
              {colunasVisiveis.observacoes && <TableHead>Observações</TableHead>}
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
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
                          placeholder="Digite e pressione Enter"
                          onChange={(e) =>
                            handleChange('imp', e.target.value, item.licencaimportacaoid)
                          }
                          onKeyDown={(e) => handleSaveOnEnter(e, item.licencaimportacaoid)}
                          onBlur={() => handleSave(item.licencaimportacaoid)}
                          className="w-full sm:w-[110px] focus:ring-2 ring-primary"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.importador && (
                      <TableCell>
                        <Input
                          value={item.importador}
                          onChange={(e) =>
                            handleChange('importador', e.target.value, item.licencaimportacaoid)
                          }
                          onBlur={() => handleSave(item.licencaimportacaoid)}
                          className="w-full sm:w-[110px] focus:ring-2 ring-primary"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.referenciaDoCliente && (
                      <TableCell>
                        <Input
                          value={item.referenciaDoCliente}
                          onChange={(e) =>
                            handleChange(
                              'referenciaDoCliente',
                              e.target.value,
                              item.licencaimportacaoid,
                            )
                          }
                          onBlur={() => handleSave(item.licencaimportacaoid)}
                          className="w-full sm:w-[110px] focus:ring-2 ring-primary"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.numeroOrquestra && (
                      <TableCell>
                        <Input
                          value={item.numeroOrquestra}
                          onChange={(e) =>
                            handleChange(
                              'numeroOrquestra',
                              e.target.value,
                              item.licencaimportacaoid,
                            )
                          }
                          onBlur={() => handleSave(item.licencaimportacaoid)}
                          className="w-full sm:w-[110px] focus:ring-2 ring-primary"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.numeroLi && (
                      <TableCell>
                        <Input
                          value={item.numeroLi}
                          onChange={(e) =>
                            handleChange('numeroLi', e.target.value, item.licencaimportacaoid)
                          }
                          onBlur={() => handleSave(item.licencaimportacaoid)}
                          className="w-full sm:w-[130px] focus:ring-2 ring-primary"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.ncm && (
                      <TableCell>
                        <Input
                          value={item.ncm}
                          onChange={(e) =>
                            handleChange('ncm', e.target.value, item.licencaimportacaoid)
                          }
                          onBlur={() => handleSave(item.licencaimportacaoid)}
                          className="w-full sm:w-[110px] focus:ring-2 ring-primary"
                        />
                      </TableCell>
                    )}
                    {colunasVisiveis.dataRegistroLI && (
                      <TableCell>
                        <Input
                          type="text"
                          value={item.dataRegistroLI}
                          onChange={(e) =>
                            handleChange('dataRegistroLI', e.target.value, item.licencaimportacaoid)
                          }
                          onBlur={() => handleSave(item.licencaimportacaoid)}
                          className="w-full sm:w-[110px] focus:ring-2 ring-primary"
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
                              'dataInclusaoOrquestra',
                              e.target.value,
                              item.licencaimportacaoid,
                            )
                          }
                          onBlur={() => handleSave(item.licencaimportacaoid)}
                          className="w-full sm:w-[110px] focus:ring-2 ring-primary"
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
                          value={item.situacao}
                          onChange={async (e) => {
                            const valorSelecionado = e.target.value;

                            // Atualiza o estado local
                            handleChange('situacao', valorSelecionado, item.licencaimportacaoid);

                            // Chama o salvamento com o valor atualizado manualmente
                            await updateLicencaImportacao(Number(item.licencaimportacaoid), {
                              ...item,
                              situacao: valorSelecionado, // ← força o valor correto aqui
                              numeroOrquestra: parseInt(item.numeroOrquestra, 10) || 0,
                              dataRegistroLI: formatarDataInternacional(item.dataRegistroLI),
                              dataInclusaoOrquestra: formatarDataInternacional(
                                item.dataInclusaoOrquestra,
                              ),
                              previsaoDeferimento: formatarDataInternacional(
                                item.previsaoDeferimento,
                              ),
                              observacoes: item.observacoes,
                            });
                          }}
                          className={`${getSituacaoColor(item.situacao)} rounded border uppercase border-gray-300 bg-transparent px-2 py-1 dark:border-white/20 dark:bg-zinc-900 focus:ring-2 ring-primary`}
                        >
                          <option value="analise">Em Análise</option>
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
                            handleChange('observacoes', e.target.value, item.licencaimportacaoid)
                          }
                          onKeyDown={(e) => handleSaveOnEnter(e, item.licencaimportacaoid)}
                          onBlur={() => handleSave(item.licencaimportacaoid)}
                          className="w-full"
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDuplicate(item.licencaimportacaoid)}
                          className="w-[40px] dark:bg-zinc-800 dark:text-white"
                        >
                          <FaCopy />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="w-[40px] dark:bg-zinc-800 dark:text-white">
                              <FaTrashAlt />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza de que deseja excluir esta Licença de Importação? Esta
                                ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemove(item.licencaimportacaoid)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
