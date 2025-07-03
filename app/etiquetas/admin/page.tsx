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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCopy, LinkIcon, Pencil, Trash2 } from 'lucide-react';
import {
  getAllDownloads,
  createDownload,
  updateDownload,
  deleteDownload,
  CreateDownloadResponse,
} from '@/lib/actions/etiquetasDownloads.actions';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface EtiquetasDownload {
  id: string;
  pedido: string;
  client: string;
  link: string;
  acceptedAt: Date | null;
  acceptedName: string | null;
}

const Page = () => {
  const [downloads, setDownloads] = useState<EtiquetasDownload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pedido, setPedido] = useState('');

  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EtiquetasDownload | null>(null);
  const [linkStatuses, setLinkStatuses] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [client, setClient] = useState('');
  const [link, setLink] = useState('');

  const parentRef = useRef<HTMLDivElement>(null);
  const [itemToDelete, setItemToDelete] = useState<EtiquetasDownload | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: downloads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 10,
  });

  const handleEditClick = (item: EtiquetasDownload) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem?.id || !editingItem.client || !editingItem.link) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Todos os campos precisam ser preenchidos.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const response = await updateDownload({
      id: editingItem.id,
      pedido: editingItem.pedido,
      client: editingItem.client,
      link: editingItem.link,
    });

    if (response?.success) {
      try {
        const updated = await getAllDownloads(); // pega todos os dados atualizados
        setDownloads(updated);
        await checkAllLinks(updated); // revalida status dos links
      } catch (error) {
        console.error('Erro ao recarregar após update:', error);
      }

      setEditDialogOpen(false);
      toast({
        title: 'Formulario atualizado',
        description: `Pedido ${editingItem.pedido} atualizado com sucesso.`,
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o download.',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  const handleAddDownload = async () => {
    if (!client || !link) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos antes de salvar.',
        variant: 'destructive',
      });
      return;
    }

    const response: CreateDownloadResponse = await createDownload({ pedido, client, link });

    if (response.success) {
      setDownloads((prev) => [response.download, ...prev]);
      setClient('');
      setPedido('');
      setLink('');
      setOpen(false);

      toast({
        title: 'Formulario adicionado',
        description: `O link do pedido ${pedido} foi registrado com sucesso.`,
      });
    } else {
      toast({
        title: 'Erro',
        description: response.message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Sucesso',
        description: 'Link copiado para a área de transferência.',
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const checkIfLinkIsOnline = async (url: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/validate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      return data.online === true;
    } catch (err) {
      console.error('Erro na verificação do link:', err);
      return false;
    }
  };

  const checkAllLinks = async (downloads: EtiquetasDownload[]) => {
    const statusMap: Record<string, boolean> = {};

    await Promise.all(
      downloads.map(async (dl) => {
        const isOnline = await checkIfLinkIsOnline(dl.link);
        statusMap[dl.id] = isOnline;
      }),
    );

    setLinkStatuses(statusMap);
  };

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setIsLoading(true); // ← Início do carregamento
        const data = await getAllDownloads();
        setDownloads(data);
        await checkAllLinks(data);
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  const getFormLink = (id: string) => `${window.location.origin}/etiquetas/download/${id}`;

  return (
    <>
      <div className="space-y-10 rounded-2xl bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Formularios</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Adicionar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Formulario</DialogTitle>
                <DialogDescription>
                  Preencha os dados do pedido para gerar o link.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Pedido"
                  value={pedido}
                  onChange={(e) => setPedido(e.target.value)}
                />

                <Input
                  placeholder="Nome do Cliente"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />
                <Input
                  placeholder="Link para Download"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddDownload}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-2xl border" ref={parentRef}>
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Link Download</TableHead>
                  <TableHead>Data de Aceite</TableHead>
                  <TableHead>Nome Preenchido</TableHead>
                  <TableHead>Formulário</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const dl = downloads[virtualRow.index];
                  return (
                    <TableRow key={dl.id}>
                      <TableCell>
                        <div
                          className="max-w-[250px] truncate whitespace-nowrap overflow-hidden"
                          title={dl.pedido}
                        >
                          {dl.pedido}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-[160px] truncate whitespace-nowrap overflow-hidden"
                          title={dl.client}
                        >
                          {dl.client}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={dl.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Abrir
                        </a>
                      </TableCell>
                      <TableCell>
                        {dl.acceptedAt ? (
                          format(new Date(dl.acceptedAt), 'dd/MM/yyyy HH:mm')
                        ) : (
                          <span className="text-gray-400 italic">Não preenchido</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-[160px] truncate whitespace-nowrap overflow-hidden"
                          title={dl.acceptedName || undefined}
                        >
                          {dl.acceptedName ? (
                            dl.acceptedName
                          ) : (
                            <span className="text-gray-400 italic">Não preenchido</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex  items-center h-full">
                          {/* Acessar formulário */}
                          <a
                            href={`/etiquetas/download/${dl.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600"
                            title="Abrir formulário público"
                          >
                            <LinkIcon size={18} />
                          </a>

                          {/* Copiar link */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(getFormLink(dl.id))}
                            title="Copiar link"
                          >
                            <ClipboardCopy size={18} />
                          </Button>

                          {/* Editar  */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(dl)}
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </Button>

                          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Editar Download</DialogTitle>
                                <DialogDescription>Atualize os dados do pedido.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <Input
                                  placeholder="Pedido"
                                  value={editingItem?.pedido || ''}
                                  onChange={(e) =>
                                    setEditingItem(
                                      (prev) => prev && { ...prev, pedido: e.target.value },
                                    )
                                  }
                                />

                                <Input
                                  placeholder="Nome do Cliente"
                                  value={editingItem?.client || ''}
                                  onChange={(e) =>
                                    setEditingItem(
                                      (prev) => prev && { ...prev, client: e.target.value },
                                    )
                                  }
                                />
                                <Input
                                  placeholder="Link do Drive"
                                  value={editingItem?.link || ''}
                                  onChange={(e) =>
                                    setEditingItem(
                                      (prev) => prev && { ...prev, link: e.target.value },
                                    )
                                  }
                                />
                              </div>
                              <DialogFooter>
                                <Button onClick={handleSaveEdit} disabled={isSaving}>
                                  {isSaving ? (
                                    <span className="flex items-center gap-2">
                                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                      Salvando...
                                    </span>
                                  ) : (
                                    'Salvar'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Deletar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setItemToDelete(dl)}
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center items-center h-full">
                          <span
                            className="inline-block h-3 w-3 rounded-full"
                            title={
                              linkStatuses[dl.id] === true
                                ? 'Link online'
                                : linkStatuses[dl.id] === false
                                  ? 'Link offline'
                                  : 'Verificando status...'
                            }
                            style={{
                              backgroundColor:
                                linkStatuses[dl.id] === true
                                  ? '#22c55e' // verde
                                  : linkStatuses[dl.id] === false
                                    ? '#ef4444' // vermelho
                                    : '#a1a1aa', // cinza
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={!!itemToDelete} onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o pedido <strong>{itemToDelete?.pedido}</strong>? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setItemToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!itemToDelete) return;

                const response = await deleteDownload(itemToDelete.id);
                if (response?.success) {
                  setDownloads((prev) => prev.filter((d) => d.id !== itemToDelete.id));
                  toast({
                    title: 'Removido',
                    description: `Pedido ${itemToDelete.pedido} foi removido.`,
                    variant: 'destructive',
                  });
                  setItemToDelete(null);
                } else {
                  toast({
                    title: 'Erro',
                    description: 'Não foi possível remover o formulário.',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Page;
