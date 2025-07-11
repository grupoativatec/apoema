/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  createOrquestra,
  getOrquestras,
  updateOrquestra,
  updateOrquestraObs,
  updateOrquestraStatus,
  updateOrquestraStatusAnuencia,
} from '@/lib/actions/orquestra.actions';
import EmptyState from '@/components/EmptyState';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createLicencaImportacao } from '@/lib/actions/li.actions';
import { AlertDialogFooter } from '@/components/ui/alert-dialog';

const Page = () => {
  const [orquestra, setOrquestra] = useState<any[]>([]);
  const [filteredOrquestra, setFilteredOrquestra] = useState<any[]>([]);
  const { toast } = useToast(); // Usando o hook do toast
  const [showNumerarioModal, setShowNumerarioModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      const res = await fetch('/api/is-admin');
      const { isAdmin } = await res.json();
      setIsAdminUser(isAdmin);
    };

    fetchAdminStatus();
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    | 'lis'
    | 'orquestra'
    | 'liconferencia'
    | 'numerario'
    | 'finalizados'
    | 'anuenciaPO'
    | 'anuenciaPOFinalizada'
  >('lis');
  const [sortField, setSortField] = useState('status');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawTerm = event.target.value;
    // lower + remove espaços
    const term = rawTerm.toLowerCase().replace(/\s+/g, '');

    setSearchTerm(rawTerm);

    // helper que normaliza qualquer string do objeto
    const normalize = (str?: string) => (str || '').toLowerCase().replace(/\s+/g, '');

    // filtra processos

    // filtra orquestras
    const filteredOrquestras = orquestra.filter((o) => {
      return (
        normalize(o.imp).includes(term) ||
        normalize(o.importador).includes(term) ||
        normalize(o.exportador).includes(term) ||
        normalize(o.referencia).includes(term)
      );
    });
    setFilteredOrquestra(filteredOrquestras);
  };

  const handleStatusChange = async (imp: string, novoStatus: string) => {
    try {
      const itemSelecionado = orquestra.find((o) => o.imp === imp);

      if (activeTab === 'orquestra' && novoStatus === 'Fazer Númerario') {
        setSelectedItem(itemSelecionado);
        setShowNumerarioModal(true);
        return;
      }

      let dataFinalizacao: string | undefined = undefined;
      if (novoStatus === 'Finalizado') {
        dataFinalizacao = new Date().toISOString().slice(0, 10);
      }

      await updateOrquestraStatus(imp, novoStatus, dataFinalizacao);

      setOrquestra((prev) =>
        prev.map((o) => (o.imp === imp ? { ...o, status: novoStatus, dataFinalizacao } : o)),
      );

      setFilteredOrquestra((prev) =>
        prev.map((o) => (o.imp === imp ? { ...o, status: novoStatus, dataFinalizacao } : o)),
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const statusOrder = ['Em andamento', 'Pendente', 'Aguardando informação', 'Finalizado'];

  const sortByDateDesc = (data: any[]) => {
    return [...data].sort((a, b) => {
      const getTime = (d?: string) => {
        if (!d || typeof d !== 'string') return 0;
        const parsed = new Date(d.trim() + 'T00:00:00');
        return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
      };

      return getTime(a.chegada) - getTime(b.chegada); // mais antigo primeiro
    });
  };

  const sortByDateDescFinalizados = (data: any[]) => {
    return [...data].sort((a, b) => {
      const getTime = (d?: string) => {
        if (!d || typeof d !== 'string') return 0;
        const parsed = new Date(d.trim() + 'T00:00:00');
        return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
      };

      return getTime(b.chegada) - getTime(a.chegada); // mais novo primeiro
    });
  };

  const sortedOrquestra = [...filteredOrquestra].sort((a, b) => {
    if (sortField === 'status') {
      const indexA = statusOrder.indexOf(a.status || 'Pendente');
      const indexB = statusOrder.indexOf(b.status || 'Pendente');
      return sortDirection === 'asc' ? indexA - indexB : indexB - indexA;
    }

    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    let canceled = false;

    const fetchAndSync = async () => {
      try {
        const response = await fetch('/api/processos', {
          method: 'POST',
          headers: {
            Authorization: 'U1F7m!2x@Xq$Pz9eN#4vA%6tG^cL*bKq',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) throw new Error('Erro ao buscar dados.');
        const { dados: processosData = [] } = await response.json();

        await Promise.all(
          processosData.map(
            async (processo: {
              Processo: string;
              Fatura: string;
              Cliente: string;
              Importador: string;
              DataCadastro: string;
              DataPrevisaoETA: string;
              Analista: string;
              Destino: string;
              ObsAnuencia: string;
            }) => {
              const orquestraData = {
                imp: processo.Processo || '',
                referencia: processo.Fatura || '',
                exportador: processo.Cliente || '',
                importador: processo.Importador || '',
                recebimento: processo.DataCadastro || '',
                chegada: processo.DataPrevisaoETA || '',
                analista: processo.Analista || '',
                destino: processo.Destino || '',
                anuencia: processo.ObsAnuencia || '',
              };

              // Tenta criar ou obter existente
              const existingOrquestra = await createOrquestra(orquestraData);

              // Verifica mudanças
              const needsUpdate =
                existingOrquestra.referencia !== orquestraData.referencia ||
                existingOrquestra.exportador !== orquestraData.exportador ||
                existingOrquestra.importador !== orquestraData.importador ||
                existingOrquestra.recebimento !== orquestraData.recebimento ||
                existingOrquestra.chegada !== orquestraData.chegada ||
                existingOrquestra.destino !== orquestraData.destino;

              // Atualiza se necessário
              if (needsUpdate) {
                await updateOrquestra(existingOrquestra.$id, orquestraData);
              }
            },
          ),
        );

        if (!canceled) {
          const orquestras = await getOrquestras();
          setOrquestra(orquestras);
          setFilteredOrquestra(orquestras);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Erro no polling:', err);
        setIsLoading(false);
      }
    };

    const loop = async () => {
      await fetchAndSync();
      if (!canceled) setTimeout(loop, 300_000);
    };

    loop();

    return () => {
      canceled = true;
    };
  }, []);

  // END USE EFFECT

  const isLiconferencia = (status: string) => {
    return ['Conferindo', 'Pendente', 'FinalizadaLi'].includes(status);
  };

  const isOrquestra = (status: string) => {
    return ['Fazer Orquestra', 'Aguardando informação', 'Em andamento'].includes(status);
  };

  const isNumerario = (status: string) => {
    return ['Em andamentoNumerario', 'Fazer Númerario'].includes(status);
  };

  const isFinalizados = (status: string) => {
    return ['Finalizado'].includes(status);
  };

  const isAnuenciaPO = (anuencia: string | null | undefined) => {
    return anuencia?.toLowerCase().includes('po');
  };

  const handleStatusAnuenciaChange = async (imp: string, novoStatusAnuencia: string) => {
    try {
      await updateOrquestraStatusAnuencia(imp, novoStatusAnuencia);

      // Atualizar localmente
      setOrquestra((prev) =>
        prev.map((o) => (o.imp === imp ? { ...o, statusAnuencia: novoStatusAnuencia } : o)),
      );
      setFilteredOrquestra((prev) =>
        prev.map((o) => (o.imp === imp ? { ...o, statusAnuencia: novoStatusAnuencia } : o)),
      );
    } catch (error) {
      console.error('Erro ao atualizar statusAnuencia:', error);
    }
  };

  const isLIS = (status: string | null | undefined) => {
    return (
      status === null ||
      status === undefined ||
      status === '' ||
      status === 'PendenteLi' ||
      status === 'Aguardando informaçãoLi' ||
      status === 'FazendoLi' ||
      status === 'Refazer'
    );
  };

  const getFilteredByTab = () => {
    if (activeTab === 'lis') {
      return sortByDateDesc(filteredOrquestra.filter((o) => isLIS(o.status)));
    }
    if (activeTab === 'liconferencia') {
      return sortByDateDesc(sortedOrquestra.filter((o) => isLiconferencia(o.status)));
    }
    if (activeTab === 'anuenciaPO') {
      return sortByDateDesc(
        filteredOrquestra.filter(
          (o) => isAnuenciaPO(o.anuencia) && o.statusAnuencia !== 'FinalizadoPO',
        ),
      );
    }

    if (activeTab === 'orquestra') {
      return sortByDateDesc(sortedOrquestra.filter((o) => isOrquestra(o.status)));
    }
    if (activeTab === 'numerario') {
      return sortByDateDesc(filteredOrquestra.filter((o) => isNumerario(o.status)));
    }
    if (activeTab === 'anuenciaPOFinalizada') {
      return sortByDateDesc(
        filteredOrquestra.filter((o) => {
          const temPO = typeof o.anuencia === 'string' && o.anuencia.toLowerCase().includes('po');
          const estaFinalizadoPO = o.statusAnuencia === 'FinalizadoPO';
          return temPO && estaFinalizadoPO;
        }),
      );
    }

    if (activeTab === 'finalizados') {
      return sortByDateDescFinalizados(sortedOrquestra.filter((o) => isFinalizados(o.status)));
    }
    return [];
  };

  const handleObsChange = async (imp: string, obs: string) => {
    try {
      await updateOrquestraObs(imp, obs);

      setOrquestra((prev) => prev.map((o) => (o.imp === imp ? { ...o, obs } : o)));

      setFilteredOrquestra((prev) => prev.map((o) => (o.imp === imp ? { ...o, obs } : o)));
    } catch (error) {
      console.error('Erro ao atualizar observação:', error);
    }
  };

  const currentData = useMemo(() => getFilteredByTab(), [activeTab, filteredOrquestra]);
  const showEmpty = !isLoading && currentData.length === 0;

  const formatBRDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
  };

  const contagemPorAba = {
    lis: filteredOrquestra.filter((o) => isLIS(o.status)).length,
    liconferencia: filteredOrquestra.filter((o) => isLiconferencia(o.status)).length,
    anuenciaPO: filteredOrquestra.filter(
      (o) => isAnuenciaPO(o.anuencia) && o.statusAnuencia !== 'FinalizadoPO',
    ).length,
    orquestra: filteredOrquestra.filter((o) => isOrquestra(o.status)).length,
    numerario: filteredOrquestra.filter((o) => isNumerario(o.status)).length,
    anuenciaPOFinalizada: filteredOrquestra.filter((o) => {
      const temPO = typeof o.anuencia === 'string' && o.anuencia.toLowerCase().includes('po');
      const estaFinalizadoPO = o.statusAnuencia === 'FinalizadoPO';
      return temPO && estaFinalizadoPO;
    }).length,
    finalizados: filteredOrquestra.filter((o) => isFinalizados(o.status)).length,
  };

  return (
    <div className="space-y-3 rounded-2xl  bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:gap-0">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Processos</h1>
          <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
            Acompanhe seus processos e filtre com facilidade.
          </p>

          <Input
            placeholder="Buscar..."
            className="mb-5 mt-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary dark:border-white/30 dark:bg-zinc-900 md:w-96"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {selectedItem && (
        <FazerNumerarioDialog
          open={showNumerarioModal}
          onClose={() => {
            setShowNumerarioModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onCreated={async () => {
            const orquestras = await getOrquestras();
            setOrquestra(orquestras);
            setFilteredOrquestra(orquestras);
          }}
        />
      )}

      {/* Abas estilo ClickUp */}
      <div className="flex items-center gap-2 border-b border-border pb-2 uppercase ">
        <button
          onClick={() => setActiveTab('lis')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'lis'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          LI´S a fazer ({contagemPorAba.lis})
        </button>
        <button
          onClick={() => setActiveTab('anuenciaPO')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'anuenciaPO'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          PO A FAZER ({contagemPorAba.anuenciaPO}){' '}
        </button>
        <button
          onClick={() => setActiveTab('liconferencia')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'liconferencia'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          CONFERÊNCIA LI ({contagemPorAba.liconferencia})
        </button>
        <button
          onClick={() => setActiveTab('orquestra')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'orquestra'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          ORQUESTRA ({contagemPorAba.orquestra})
        </button>
        <button
          onClick={() => setActiveTab('numerario')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'numerario'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          NÚMERARIO ({contagemPorAba.numerario})
        </button>
        <button
          onClick={() => setActiveTab('anuenciaPOFinalizada')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'anuenciaPOFinalizada'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          FINALIZADOS PO ({contagemPorAba.anuenciaPOFinalizada})
        </button>
        <button
          onClick={() => setActiveTab('finalizados')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'finalizados'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          FINALIZADOS ({contagemPorAba.finalizados})
        </button>
      </div>

      <div className="overflow-auto rounded-2xl  border">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : showEmpty ? (
          <EmptyState tab={activeTab} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Imp</TableHead>
                <TableHead className="min-w-[100px]">Ref. Cliente</TableHead>
                <TableHead className="min-w-[100px]">Adquirente</TableHead>
                <TableHead className="min-w-[100px]">Importador</TableHead>
                <TableHead className="min-w-[100px]">Recebimento</TableHead>
                <TableHead className="min-w-[100px]">Prev. Chegada</TableHead>
                <TableHead className="min-w-[100px]">Destino</TableHead>
                <TableHead className="min-w-[140px]" onClick={() => handleSort('status')}>
                  Status {sortDirection === 'asc' ? '▲' : '▼'}
                </TableHead>
                <TableHead className="min-w-[100px]">Observação</TableHead>
                {isAdminUser && <TableHead className="min-w-[100px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item) => (
                <TableRow key={item.imp}>
                  <TableCell>{item.imp || '-'}</TableCell>
                  <TableCell>
                    <div className="max-w-[160px] truncate" title={item.referencia || '-'}>
                      {item.referencia || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-[150px] truncate" title={item.exportador}>
                      {item.exportador?.split(' ').slice(0, 8).join(' ') || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-[150px] truncate" title={item.importador}>
                      {item.importador?.split(' ').slice(0, 8).join(' ') || '-'}
                    </span>
                  </TableCell>
                  <TableCell>{formatBRDate(item.recebimento)}</TableCell>
                  <TableCell>{formatBRDate(item.chegada)}</TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-lg px-3 py-1 text-sm text-white ${
                        ['navegantes', 'itajai - sc'].includes(item.destino?.toLowerCase())
                          ? 'bg-[#2ecc71]'
                          : ['sao francisco', 'itapoa - sc'].includes(item.destino?.toLowerCase())
                            ? 'bg-[#e91e63]'
                            : item.destino?.toLowerCase() === 'santos'
                              ? 'bg-[#333333]'
                              : 'bg-[#7f8c8d]'
                      }`}
                    >
                      {item.destino || '-'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {activeTab === 'anuenciaPO' ? (
                      <Select
                        value={item.statusAnuencia || 'LiPendente-PoPendente'}
                        onValueChange={(value) => handleStatusAnuenciaChange(item.imp, value)}
                      >
                        <SelectTrigger className="w-[180px] text-sm">
                          <SelectValue placeholder="Selecionar status PO" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LiPendente-PoPendente">
                            LI Pendente / PO Pendente
                          </SelectItem>
                          <SelectItem value="LiFeita-PoPendente">LI Feita / PO Pendente</SelectItem>
                          <SelectItem value="FinalizadoPO">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : activeTab === 'anuenciaPOFinalizada' ? (
                      <Select
                        value={item.statusAnuencia || ''}
                        onValueChange={(value) => handleStatusAnuenciaChange(item.imp, value)}
                      >
                        <SelectTrigger className="w-[180px] text-sm">
                          <SelectValue placeholder="Selecionar status PO" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LiFeita-PoPendente">Refazer PO</SelectItem>
                          <SelectItem value="FinalizadoPO">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        value={item.status || 'Pendente'}
                        onValueChange={(value) => handleStatusChange(item.imp, value)}
                      >
                        <SelectTrigger className="w-[130px] text-sm">
                          <SelectValue placeholder="Selecionar status" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeTab === 'lis' && (
                            <>
                              <SelectItem value="Refazer">Refazer Li</SelectItem>
                              <SelectItem value="Aguardando informaçãoLi">
                                Aguardando Informação
                              </SelectItem>
                              <SelectItem value="PendenteLi">Pendente</SelectItem>
                              <SelectItem value="FazendoLi">Em Andamento</SelectItem>
                              <SelectItem value="Pendente">Finalizado</SelectItem>
                            </>
                          )}
                          {activeTab === 'liconferencia' && (
                            <>
                              <SelectItem value="Refazer">Refazer Li</SelectItem>
                              <SelectItem value="Pendente">Pendente</SelectItem>
                              <SelectItem value="Conferindo">Conferindo</SelectItem>
                              <SelectItem value="Fazer Orquestra">Fazer Orquestra</SelectItem>
                            </>
                          )}
                          {activeTab === 'orquestra' && (
                            <>
                              <SelectItem value="Fazer Orquestra">Fazer Orquestra</SelectItem>
                              <SelectItem value="Refazer">Refazer LI</SelectItem>
                              <SelectItem value="Aguardando informação">
                                Aguardando Informação
                              </SelectItem>
                              <SelectItem value="Em andamento">Em andamento</SelectItem>
                              <SelectItem value="Fazer Númerario">Finalizado</SelectItem>
                            </>
                          )}
                          {activeTab === 'numerario' && (
                            <>
                              <SelectItem value="Fazer Númerario">Fazer Númerario</SelectItem>
                              <SelectItem value="Refazer">Refazer LI</SelectItem>
                              <SelectItem value="Fazer Orquestra">Refazer Orquestra</SelectItem>
                              <SelectItem value="Em andamentoNumerario">Em andamento</SelectItem>
                              <SelectItem value="Finalizado">Finalizado</SelectItem>
                            </>
                          )}
                          {activeTab === 'finalizados' && (
                            <>
                              <SelectItem value="Refazer">Refazer LI</SelectItem>
                              <SelectItem value="Fazer Orquestra">Refazer Orquestra</SelectItem>
                              <SelectItem value="Fazer Númerario">Refazer Númerario</SelectItem>
                              <SelectItem value="Finalizado">Finalizado</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>

                  <TableCell>
                    <Textarea
                      value={item.obs || ''}
                      onChange={(e) => {
                        const novoObs = e.target.value;
                        setOrquestra((prev) =>
                          prev.map((o) => (o.imp === item.imp ? { ...o, obs: novoObs } : o)),
                        );
                        setFilteredOrquestra((prev) =>
                          prev.map((o) => (o.imp === item.imp ? { ...o, obs: novoObs } : o)),
                        );
                      }}
                      onBlur={(e) => handleObsChange(item.imp, e.target.value)}
                      className="h-[40px] max-w-[150px] resize-none overflow-auto px-2 py-1 text-sm"
                    />
                  </TableCell>

                  {isAdminUser && (
                    <TableCell>
                      <EditIMPDialog
                        item={item}
                        onSave={(updatedItem) => {
                          setOrquestra((prev) =>
                            prev.map((o) => (o.imp === updatedItem.imp ? updatedItem : o)),
                          );
                          setFilteredOrquestra((prev) =>
                            prev.map((o) => (o.imp === updatedItem.imp ? updatedItem : o)),
                          );

                          toast({
                            description: `${updatedItem.imp} atualizado com sucesso!`,
                          });
                        }}
                      />
                      <DeleteIMPDialog
                        imp={item.imp}
                        onConfirm={async () => {
                          try {
                            const res = await fetch('/api/delete-orquestra', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ processoid: item.processoid }),
                            });

                            const result = await res.json();

                            if (result.success) {
                              // Atualiza a lista de orquestras após a exclusão
                              setOrquestra((prev) =>
                                prev.filter((o) => o.processoid !== item.processoid),
                              );
                              setFilteredOrquestra((prev) =>
                                prev.filter((o) => o.processoid !== item.processoid),
                              );

                              // Exibe o toast de sucesso
                              toast({
                                description: `${item.imp} excluído com sucesso!`,
                              });
                            } else {
                              // Exibe o toast de erro caso a exclusão falhe
                              toast({
                                description: 'Erro ao excluir a IMP.',
                                variant: 'destructive',
                              });
                            }
                          } catch (error) {
                            console.error('Erro ao excluir IMP:', error);
                            // Exibe o toast de erro caso ocorra algum erro na chamada da API
                            toast({
                              description: 'Erro ao tentar excluir a IMP.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Page;

const DeleteIMPDialog = ({ imp, onConfirm }: { imp: string; onConfirm: () => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          className="w-[40px] dark:bg-zinc-800 dark:text-white"
        >
          <Trash2 size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir processo</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o processo <strong>{imp}</strong>? Essa ação não pode ser
          desfeita.
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Confirmar exclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditIMPDialog = ({ item, onSave }: { item: any; onSave: (updated: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ ...item });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/processos/edit-orquestra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData }),
      });

      const text = await res.text();

      try {
        const result = JSON.parse(text);
        if (result.success) {
          onSave(result.updated);
          setOpen(false);
        }
        // continue normalmente...
      } catch (err) {
        console.error('Erro ao fazer parse do JSON:', err);
      }
    } catch (err) {
      console.error('Erro ao editar IMP:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="w-[40px] dark:bg-zinc-800 dark:text-white mr-2">
          <Pencil size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Processo</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-muted-foreground">IMP</label>
            <Input name="imp" value={formData.imp || ''} disabled readOnly />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-muted-foreground">
              Referência do Cliente
            </label>
            <Input
              name="referencia"
              value={formData.referencia || ''}
              onChange={handleChange}
              placeholder="Referência"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-muted-foreground">Exportador</label>
            <Input
              name="exportador"
              value={formData.exportador || ''}
              onChange={handleChange}
              placeholder="Exportador"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-muted-foreground">Importador</label>
            <Input
              name="importador"
              value={formData.importador || ''}
              onChange={handleChange}
              placeholder="Importador"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-muted-foreground">Data de Recebimento</label>
            <Input
              type="date"
              name="recebimento"
              value={formData.recebimento?.slice(0, 10) || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-muted-foreground">
              Data Prev. de Chegada
            </label>
            <Input
              type="date"
              name="chegada"
              value={formData.chegada?.slice(0, 10) || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-muted-foreground">Destino</label>
            <Select
              value={formData.destino || ''}
              onValueChange={(value) =>
                setFormData((prev: any) => ({
                  ...prev,
                  destino: value.toUpperCase(),
                }))
              }
            >
              <SelectTrigger className="w-full uppercase">
                <SelectValue placeholder="Selecione o destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RIO DE JANEIRO">Rio de Janeiro</SelectItem>
                <SelectItem value="ITAPOA - SC">Itapoa - SC</SelectItem>
                <SelectItem value="NAVEGANTES">Navegantes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-sky-500 hover:bg-sky-400 text-white">
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FazerNumerarioDialog = ({
  open,
  onClose,
  item,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  item: any;
  onCreated: () => void;
}) => {
  const [liList, setLiList] = useState([
    {
      numeroLi: '',
      ncm: '',
      numeroOrquestra: '',
      dataInclusaoOrquestra: '',
      dataRegistroLI: '',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const calcularPrevisaoDeferimento = (data: string) => {
    const d = new Date(data);
    d.setDate(d.getDate() + 11);
    return d.toISOString().split('T')[0];
  };

  const handleChange = (index: number, field: string, value: string) => {
    setLiList((prev) => prev.map((li, i) => (i === index ? { ...li, [field]: value } : li)));
  };

  const handleAddLI = () => {
    setLiList((prev) => [
      ...prev,
      {
        numeroLi: '',
        ncm: '',
        numeroOrquestra: '',
        dataInclusaoOrquestra: '',
        dataRegistroLI: '',
      },
    ]);
  };

  const handleRemoveLI = (index: number) => {
    setLiList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      for (let i = 0; i < liList.length; i++) {
        const li = liList[i];

        const numeroLiValido = /^\d{2}\/\d{7}-\d$/.test(li.numeroLi);
        const numeroOrquestraValido = /^\d{7}$/.test(li.numeroOrquestra);
        const ncmValido = /^\d{4}\.\d{2}\.\d{2}$/.test(li.ncm);

        if (!numeroLiValido) {
          toast({
            description: `LI ${i + 1}: Número da LI inválido. Use o formato 25/2651918-9.`,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        if (!numeroOrquestraValido) {
          toast({
            description: `LI ${i + 1}: Número da Orquestra inválido. Deve conter 7 dígitos.`,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        if (!ncmValido) {
          toast({
            description: `LI ${i + 1}: NCM inválido. Use o formato 9503.00.99.`,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
      }

      const promises = liList.map((li) => {
        const payload = {
          imp: item.imp,
          importador: item.importador,
          referenciaDoCliente: item.referencia,
          numeroOrquestra: Number(li.numeroOrquestra),
          numeroLi: li.numeroLi,
          ncm: li.ncm,
          dataInclusaoOrquestra: li.dataInclusaoOrquestra,
          dataRegistroLI: li.dataRegistroLI,
          previsaoDeferimento: calcularPrevisaoDeferimento(li.dataInclusaoOrquestra),
          situacao: 'analise',
          observacoes: item.obs || '',
        };

        return createLicencaImportacao(payload);
      });

      await Promise.all(promises);

      await updateOrquestraStatus(item.imp, 'Fazer Númerario');

      toast({
        description: `Criadas ${liList.length} LIs para ${item.imp}`,
      });

      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        description: 'Erro ao criar uma ou mais LIs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="h-[90vh] max-w-3xl flex flex-col justify-between overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-1">
            Adicionar LIs para {item?.imp}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-2 space-y-6 flex-1">
          {liList.map((li, index) => (
            <div
              key={index}
              className="space-y-4 border-muted border p-5 pb-4 border-zinc-700 rounded-sm"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">LI {index + 1}</span>
                {liList.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red hover:bg-transparent"
                    onClick={() => handleRemoveLI(index)}
                  >
                    Remover
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Número da LI</label>
                  <Input
                    value={li.numeroLi}
                    placeholder="Ex: 25/2651918-9"
                    onChange={(e) => handleChange(index, 'numeroLi', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">NCM</label>
                  <Input
                    value={li.ncm}
                    placeholder="Ex: 9503.00.99"
                    onChange={(e) => handleChange(index, 'ncm', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Número da Orquestra</label>
                  <Input
                    value={li.numeroOrquestra}
                    placeholder="Ex: 3405521"
                    onChange={(e) => handleChange(index, 'numeroOrquestra', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Data Registro LI</label>
                  <Input
                    type="date"
                    value={li.dataRegistroLI}
                    onChange={(e) => handleChange(index, 'dataRegistroLI', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Data Inclusão Orquestra</label>
                  <Input
                    type="date"
                    value={li.dataInclusaoOrquestra}
                    onChange={(e) => handleChange(index, 'dataInclusaoOrquestra', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Previsão Deferimento</label>
                  <Input
                    disabled
                    value={
                      li.dataInclusaoOrquestra
                        ? new Date(
                            calcularPrevisaoDeferimento(li.dataInclusaoOrquestra),
                          ).toLocaleDateString('pt-BR')
                        : ''
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={handleAddLI} className="w-full">
            + Adicionar outra LI
          </Button>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar todas'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
