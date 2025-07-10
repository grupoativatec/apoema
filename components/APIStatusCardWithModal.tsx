'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { pingAPI } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { API } from '@/types/types';
import { Input } from './ui/input';
import {
  deleteMonitoramentoApi,
  updateMonitoramentoApi,
} from '@/lib/actions/monitoramentoApis.actions';

interface HistoryItem {
  status: 'online' | 'offline';
  code: number | null;
  time: string;
  responseTime: number | null;
}

export function APIStatusCardWithModal({
  onUpdate,
  onDelete,
  ...initialAPI
}: API & {
  onUpdate: (updated: API) => void;
  onDelete: (id: number) => void;
}) {
  const [api, setAPI] = useState<API>(initialAPI);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTestAgain = async () => {
    setLoading(true);
    const start = new Date();
    const res = await pingAPI(api.url);

    const updated: API = {
      ...api,
      online: res.online,
      responseTime: res.time,
    };
    setAPI(updated);

    setHistory((prev) => [
      {
        status: res.online ? 'online' : 'offline',
        code: res.online ? 200 : null,
        time: start.toLocaleTimeString(),
        responseTime: res.time,
      },
      ...prev.slice(0, 4),
    ]);
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className={cn(
            'flex flex-col justify-between p-4 shadow-sm border transition-all hover:scale-[1.01] cursor-pointer',
            'dark:bg-[#1f2937]',
            api.online
              ? 'border-[#34d39966] bg-[#ecfdf5] dark:bg-[#064e3b33]'
              : 'border-[#f8717166] bg-[#fef2f2] dark:bg-[#7f1d1d33]',
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">{api.name}</h2>
            <div
              className={cn(
                'h-3 w-3 rounded-full',
                api.online ? 'bg-[#22c55e] animate-pulse' : 'bg-[#ef4444]',
              )}
              title={api.online ? 'Online' : 'Offline'}
            />
          </div>

          <p className="text-sm break-all text-muted-foreground mb-2">{api.url}</p>

          <p className="text-xs text-muted-foreground mb-3">
            {api.responseTime !== null ? `Resposta: ${api.responseTime}ms` : 'Sem resposta'}
          </p>

          <Badge variant="secondary" className="self-start text-xs">
            {api.categoria}
          </Badge>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar API: {api.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 font-medium">Nome</label>
            <Input value={api.name} onChange={(e) => setAPI({ ...api, name: e.target.value })} />
          </div>
          <div>
            <label className="block mb-1 font-medium">URL</label>
            <Input value={api.url} onChange={(e) => setAPI({ ...api, url: e.target.value })} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Real URL</label>
            <Input
              value={api.realUrl}
              onChange={(e) => setAPI({ ...api, realUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Authorization</label>
            <Input
              value={api.authorization || ''}
              onChange={(e) => setAPI({ ...api, authorization: e.target.value })}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Categoria</label>
            <Input
              value={api.categoria}
              onChange={(e) => setAPI({ ...api, categoria: e.target.value })}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Descrição</label>
            <Input
              value={api.descricao}
              onChange={(e) => setAPI({ ...api, descricao: e.target.value })}
            />
          </div>

          <div className="flex justify-between pt-4 gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Deletar</Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja deletar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A API <strong>{api.name}</strong> será removida
                    permanentemente do monitoramento.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      const res = await deleteMonitoramentoApi(api.id!);
                      if (res.success) {
                        toast.success('API deletada com sucesso!');
                        onDelete(api.id!);
                      } else {
                        toast.error('Erro ao deletar API');
                      }
                    }}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              className="bg-sky-500 text-white hover:bg-sky-400"
              onClick={async () => {
                const updatedApi = {
                  id: api.id!,
                  name: api.name,
                  url: api.url,
                  realUrl: api.realUrl,
                  categoria: api.categoria,
                  descricao: api.descricao,
                  authorization: api.authorization,
                  online: api.online,
                  responseTime: api.responseTime,
                };
                const res = await updateMonitoramentoApi(updatedApi);
                if (res.success) {
                  toast.success('API atualizada com sucesso!');
                  onUpdate(updatedApi);
                } else {
                  toast.error('Erro ao atualizar API');
                }
              }}
            >
              Salvar alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
