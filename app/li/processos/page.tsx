/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
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

const Page = () => {
  const [orquestra, setOrquestra] = useState<any[]>([]);
  const [filteredOrquestra, setFilteredOrquestra] = useState<any[]>([]);

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
      let dataFinalizacao: string | undefined = undefined;

      if (novoStatus === 'Finalizado') {
        dataFinalizacao = new Date().toISOString().slice(0, 10);
      }

      // Atualiza o status no banco de dados
      await updateOrquestraStatus(imp, novoStatus, dataFinalizacao);

      // Atualiza localmente
      setOrquestra((prevOrquestras) =>
        prevOrquestras.map((orquestra) =>
          orquestra.imp === imp ? { ...orquestra, status: novoStatus, dataFinalizacao } : orquestra,
        ),
      );

      setFilteredOrquestra((prevFiltered) =>
        prevFiltered.map((orquestra) =>
          orquestra.imp === imp ? { ...orquestra, status: novoStatus, dataFinalizacao } : orquestra,
        ),
      );

      // Se novo status for "Fazer Orquestra", verifica se há IMP com anuencia PO que não seja FinalizadoPO
      if (novoStatus === 'Fazer Orquestra') {
        const impAtual = orquestra.find((o) => o.imp === imp);

        if (
          impAtual &&
          impAtual.anuencia?.toLowerCase().includes('po') &&
          impAtual.statusAnuencia !== 'FinalizadoPO'
        ) {
          await updateOrquestraStatusAnuencia(impAtual.imp, 'LiFeita-PoPendente');

          setOrquestra((prev) =>
            prev.map((o) =>
              o.imp === impAtual.imp ? { ...o, statusAnuencia: 'LiFeita-PoPendente' } : o,
            ),
          );

          setFilteredOrquestra((prev) =>
            prev.map((o) =>
              o.imp === impAtual.imp ? { ...o, statusAnuencia: 'LiFeita-PoPendente' } : o,
            ),
          );
        }
      }
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

  const currentData = getFilteredByTab();
  const showEmpty = !isLoading && currentData.length === 0;

  const formatBRDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-10 rounded-2xl bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
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
          LI´S a fazer
        </button>
        <button
          onClick={() => setActiveTab('anuenciaPO')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'anuenciaPO'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          PO a fazer
        </button>
        <button
          onClick={() => setActiveTab('liconferencia')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'liconferencia'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          Conferência LI
        </button>
        <button
          onClick={() => setActiveTab('orquestra')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'orquestra'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          Orquestra
        </button>
        <button
          onClick={() => setActiveTab('numerario')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'numerario'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          Númerario
        </button>
        <button
          onClick={() => setActiveTab('anuenciaPOFinalizada')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'anuenciaPOFinalizada'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          Finalizados PO
        </button>
        <button
          onClick={() => setActiveTab('finalizados')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase ${
            activeTab === 'finalizados'
              ? 'bg-primary text-white shadow-sm dark:text-black'
              : 'text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          Finalizados
        </button>
      </div>

      <div className="max-h-[550px] overflow-auto rounded-2xl border">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item) => (
                <TableRow key={item.imp}>
                  <TableCell>{item.imp || '-'}</TableCell>
                  <TableCell>{item.referencia || '-'}</TableCell>
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
