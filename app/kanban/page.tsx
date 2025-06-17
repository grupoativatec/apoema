'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  createKanban,
  deleteKanban,
  getAllKanbans,
  updateKanbanName,
} from '@/lib/actions/kanban.actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function KanbanListPage() {
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const [kanbans, setKanbans] = useState([{ id: 'default', name: 'Meu Kanban Principal' }]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKanbanName, setNewKanbanName] = useState('');

  const [editingKanban, setEditingKanban] = useState<{ id: string; name: string } | null>(null);
  const [editedName, setEditedName] = useState('');

  //  Carrega os kanbans ao montar
  useEffect(() => {
    const fetchKanbans = async () => {
      try {
        const result = await getAllKanbans();
        setKanbans(result);
      } catch (error) {
        console.error('Erro ao carregar kanbans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKanbans();
  }, []);

  const handleCreateKanban = async () => {
    if (!newKanbanName.trim()) return;

    const newKanban = {
      id: `${Date.now()}`,
      name: newKanbanName,
    };

    try {
      // ⬇️ Cria no banco usando server action
      await createKanban(newKanban);

      // ⬇️ Atualiza estado local
      setKanbans((prev) => [...prev, newKanban]);
      setNewKanbanName('');
      setIsDialogOpen(false);

      // ⬇️ Redireciona para o novo kanban
      router.push(`/kanban/${newKanban.id}`);
    } catch (err) {
      console.error('Erro ao criar kanban:', err);
    }
  };

  const handleDeleteKanban = async (id: string) => {
    try {
      await deleteKanban(id);
      setKanbans((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error('Erro ao deletar kanban:', err);
    }
  };

  const handleUpdateKanbanName = async () => {
    if (!editingKanban || !editedName.trim()) return;

    try {
      await updateKanbanName(editingKanban.id, editedName);
      setKanbans((prev) =>
        prev.map((k) => (k.id === editingKanban.id ? { ...k, name: editedName } : k)),
      );
      setEditingKanban(null);
      setEditedName('');
    } catch (err) {
      console.error('Erro ao editar kanban:', err);
    }
  };

  return (
    <div className="min-h-screen w-full p-10 bg-zinc-900 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-700 pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Apoema - Kanbans</h1>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="group flex items-center gap-2 bg-sky-400 hover:bg-sky-300 transition px-4 py-2 rounded-md text-white">
                <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium text-sm">Criar Kanban</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-zinc-900 border border-zinc-700 text-white max-w-sm w-full rounded-lg">
              <DialogHeader className="space-y-2 text-center">
                <DialogTitle className="text-lg font-semibold">Criar novo Kanban</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Digite o nome do Kanban"
                  value={newKanbanName}
                  onChange={(e) => setNewKanbanName(e.target.value)}
                  className="bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-400"
                />
              </div>

              <DialogFooter className="mt-6 flex justify-end">
                <Button
                  onClick={handleCreateKanban}
                  className="bg-sky-400 hover:bg-blue-400 text-white"
                >
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Kanbans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-800 p-6 rounded-xl border border-zinc-600 space-y-3"
                >
                  <Skeleton className="h-6 w-3/4 bg-zinc-700" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-700" />
                </div>
              ))
            : kanbans.map((kanban) => (
                <div
                  key={kanban.id}
                  className="relative group bg-zinc-800 hover:bg-zinc-700 transition-colors p-6 rounded-xl shadow-md border border-zinc-600 text-left hover:shadow-lg"
                >
                  <button
                    onClick={() => router.push(`/kanban/${kanban.id}`)}
                    className="w-full text-left"
                  >
                    <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {kanban.name}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">Clique para abrir</p>
                  </button>

                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingKanban(kanban);
                        setEditedName(kanban.name);
                      }}
                      className="p-1 rounded hover:bg-blue-600 transition"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDeleteKanban(kanban.id)}
                      className="p-1 rounded hover:bg-red-600 transition"
                      title="Excluir"
                    >
                      <TrashIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
        </div>

        {/* Modal de edição */}
        <Dialog open={!!editingKanban} onOpenChange={() => setEditingKanban(null)}>
          <DialogContent className="bg-zinc-900 border border-zinc-700 text-white max-w-sm w-full rounded-lg">
            <DialogHeader className="space-y-2 text-center">
              <DialogTitle className="text-lg font-semibold">Editar Kanban</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Input
                placeholder="Nome do Kanban"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-400"
              />
            </div>

            <DialogFooter className="mt-6 flex justify-end">
              <Button
                onClick={handleUpdateKanbanName}
                className="bg-sky-400 hover:bg-sky-300 text-white"
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
