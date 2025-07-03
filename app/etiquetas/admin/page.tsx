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

  const [code, setCode] = useState('');
  const [client, setClient] = useState('');
  const [link, setLink] = useState('');

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

    const response = await updateDownload({
      id: editingItem.id,
      pedido: editingItem.pedido,
      client: editingItem.client,
      link: editingItem.link,
    });

    if (response?.success) {
      setDownloads((prev) => prev.map((item) => (item.id === editingItem.id ? editingItem : item)));
      setEditDialogOpen(false);
      toast({
        title: 'Download atualizado',
        description: `Cliente ${editingItem.client} atualizado com sucesso.`,
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o download.',
        variant: 'destructive',
      });
    }
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
        title: 'Download adicionado',
        description: `O link do cliente ${client} foi registrado com sucesso.`,
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

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const data = await getAllDownloads();
        setDownloads(data);
      } catch (error) {
        toast({
          title: 'Erro ao carregar downloads',
          description: 'Verifique sua conexão ou tente novamente mais tarde.',
          variant: 'destructive',
        });
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

        <div className="max-h-[550px] overflow-auto rounded-2xl border">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {downloads.map((dl) => (
                  <TableRow key={dl.id}>
                    <TableCell>{dl.pedido}</TableCell>
                    <TableCell>{dl.client}</TableCell>
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
                      {dl.acceptedName ? (
                        dl.acceptedName
                      ) : (
                        <span className="text-gray-400 italic">Não preenchido</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
                              <Button onClick={handleSaveEdit}>Salvar</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Deletar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            const response = await deleteDownload(dl.id);
                            if (response?.success) {
                              setDownloads((prev) => prev.filter((d) => d.id !== dl.id));
                              toast({
                                title: 'Removido',
                                description: `Pedido ${dl.pedido} foi removido.`,
                              });
                            } else {
                              toast({
                                title: 'Erro',
                                description: 'Não foi possível remover o download.',
                                variant: 'destructive',
                              });
                            }
                          }}
                          title="Excluir"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
