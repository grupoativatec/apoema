'use client';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { APIStatusCardWithModal } from '@/components/APIStatusCardWithModal';
import { API } from '@/types/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  addMonitoramentoApi,
  getAllMonitoramentoApis,
  updateMonitoramentoApiStatus,
} from '@/lib/actions/monitoramentoApis.actions';

// 👇 Caso ainda não tenha essa função, crie em utils.ts
async function pingAPI(url: string): Promise<{ online: boolean; time: number | null }> {
  try {
    const res = await fetch(`/api/ping?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return { online: data.online, time: data.responseTime };
  } catch {
    return { online: false, time: null };
  }
}

export default function MonitoramentoAPIsPage() {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<API[]>([]);
  const [newApiModalOpen, setNewApiModalOpen] = useState(false);
  const [newAPI, setNewAPI] = useState({
    name: '',
    url: '',
    realUrl: '',
    categoria: '',
    descricao: '',
    authorization: '',
  });

  const handleAddAPI = async () => {
    const res = await addMonitoramentoApi(newAPI);

    if (res.success) {
      const updated = await getAllMonitoramentoApis();
      setData(updated);
      toast.success(`API "${newAPI.name}" adicionada com sucesso!`);
    } else {
      toast.error('Erro ao adicionar a nova API.');
    }

    setNewAPI({ name: '', url: '', realUrl: '', categoria: '', descricao: '', authorization: '' });
    setNewApiModalOpen(false);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      const rawApis = await getAllMonitoramentoApis();
      const apis = rawApis.map((api: any) => ({
        ...api,
        realUrl: api.real_url,
      }));

      const updated = await Promise.all(
        apis.map(async (api: { real_url: string; url: any }) => {
          const { online, time } = await pingAPI(api.real_url);
          await updateMonitoramentoApiStatus({ url: api.url, online, responseTime: time });
          return { ...api, online, responseTime: time };
        }),
      );

      setData(updated);
      setIsLoading(false);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = data.filter((api) =>
    `${api.name} ${api.url} ${api.categoria}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 rounded-2xl bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
      <div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Monitoramento de APIs</h1>
        <p className="text-muted-foreground">Visualize e filtre suas APIs por status e nome.</p>

        <Input
          placeholder="Buscar por nome ou URL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary dark:border-white/30 dark:bg-zinc-900 md:w-96"
        />

        <Dialog open={newApiModalOpen} onOpenChange={setNewApiModalOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4">Adicionar Nova API</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova API</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={newAPI.name}
                  onChange={(e) => setNewAPI({ ...newAPI, name: e.target.value })}
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={newAPI.url}
                  onChange={(e) => setNewAPI({ ...newAPI, url: e.target.value })}
                />
              </div>
              <div>
                <Label>Real URL</Label>
                <Input
                  value={newAPI.realUrl}
                  onChange={(e) => setNewAPI({ ...newAPI, realUrl: e.target.value })}
                />
              </div>

              <div>
                <Label>Authorization (opcional)</Label>
                <Input
                  value={newAPI.authorization || ''}
                  onChange={(e) => setNewAPI({ ...newAPI, authorization: e.target.value })}
                />
              </div>

              <div>
                <Label>Categoria</Label>
                <Input
                  value={newAPI.categoria}
                  onChange={(e) => setNewAPI({ ...newAPI, categoria: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={newAPI.descricao}
                  onChange={(e) => setNewAPI({ ...newAPI, descricao: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleAddAPI}>Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhuma API encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((api) => (
            <APIStatusCardWithModal
              key={api.id}
              {...api}
              onUpdate={(updatedApi) =>
                setData((prev) =>
                  prev.map((item) =>
                    item.id === updatedApi.id ? { ...item, ...updatedApi } : item,
                  ),
                )
              }
              onDelete={(id) => setData((prev) => prev.filter((item) => item.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
