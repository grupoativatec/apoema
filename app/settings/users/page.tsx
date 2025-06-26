'use client';

import { useEffect, useState, useTransition } from 'react';
import { createAccount, deleteUser, getAllUsers, updateUserRole } from '@/lib/actions/user.actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Trash2 } from 'lucide-react';

type User = {
  role: string | undefined;
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const router = useRouter();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/is-admin');
        const data = await res.json();

        if (!data.isAdmin) {
          router.push('/dashboard');
        } else {
          setHasAccess(true);
        }
      } catch (err) {
        router.push('/dashboard');
      }
    };

    checkAdmin();
  }, [router]);

  // funcao pra remover usarios
  const handleRemove = (id: number) => {
    startTransition(async () => {
      try {
        await deleteUser(id);
        setUsers((prev) => prev.filter((user) => user.id !== id));
        toast({ description: 'Usuário removido com sucesso!' });
      } catch (err) {
        console.error('Erro ao remover usuário:', err);
        toast({
          description: 'Erro ao remover usuário.',
          variant: 'destructive',
        });
      }
    });
  };

  // funcao pra retornar todos os usarios cadastrados
  useEffect(() => {
    const fetchUsers = async () => {
      const fetched = await getAllUsers();
      setUsers(fetched);
    };
    fetchUsers();
  }, []);

  // funcao pra adicionar novos usarios
  const handleAddUser = async () => {
    try {
      await createAccount({
        fullName: newUser.name,
        email: newUser.email,
        password: newUser.password,
      });

      // atualizando novos usarios
      const refreshedUsers = await getAllUsers();
      setUsers(refreshedUsers);
      setNewUser({ name: '', email: '', password: '' });
      setDialogOpen(false);
      toast({ description: 'Usuário criado com sucesso!' });
    } catch (err) {
      console.error('Erro ao adicionar usuário:', err);
      toast({
        description: 'Erro ao adicionar usuário.',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    console.log('Mudando role do usuário', userId, 'para', role); // Verifique o que está sendo passado
    try {
      await updateUserRole(userId, role);
      // Atualiza a lista de usuários
      const refreshedUsers = await getAllUsers();
      setUsers(refreshedUsers);
      toast({ description: 'Role atualizada com sucesso!' });
    } catch (err) {
      console.error('Erro ao atualizar role:', err);
      toast({
        description: 'Erro ao atualizar role.',
        variant: 'destructive',
      });
    }
  };
  return (
    <main className="min-h-screen flex-1 bg-light-400 px-6 py-10 dark:border-white/20 dark:bg-zinc-900/80 dark:text-white">
      <div className="mx-auto max-w-7xl">
        <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-white/20 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-light-300">
              Gerenciar Usuários
            </h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-brand text-white hover:bg-brand/90">
                  + Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Adicionar novo usuário</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      placeholder="Nome"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Senha temporária"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    onClick={handleAddUser}
                    className="bg-zinc-900 text-white hover:bg-zinc-800"
                  >
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/20">
            <Table>
              <TableHeader className="bg-zinc-100 dark:bg-zinc-900/80">
                <TableRow>
                  <TableHead className="w-[60px]">Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                  <TableHead className="text-right">Alterar Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="size-9 dark:text-white">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">
                      {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-right max-w-[20px]">
                      <Select
                        value={user.role || 'membro'}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="uppercase">
                          <SelectValue>{user.role || 'membro'}</SelectValue>{' '}
                          {/* Exibe 'Membro' se a role não estiver definida */}
                        </SelectTrigger>
                        <SelectContent className="uppercase">
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="membro">Membro</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-md"
                            onClick={() => handleRemove(user.id)}
                            disabled={isPending}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </main>
  );
}
