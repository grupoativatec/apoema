"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createAccount,
  deleteUser,
  getAllUsers,
} from "@/lib/actions/user.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRemove = (id: string) => {
    startTransition(async () => {
      try {
        await deleteUser(id);
        setUsers((prev) => prev.filter((user) => user.id !== id));
        toast({
          description: "Usuário removido com sucesso!",
        });
      } catch (err) {
        console.error("Erro ao remover usuário:", err);
        toast({
          description: "Erro ao remover usuário.",
          variant: "destructive",
        });
      }
    });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const fetched = await getAllUsers();
      setUsers(fetched);
    };
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    try {
      await createAccount({
        fullName: newUser.name,
        email: newUser.email,
      });
      const refreshedUsers = await getAllUsers();
      setUsers(refreshedUsers);
      setNewUser({ name: "", email: "" });
      setDialogOpen(false);
      toast({ description: "Usuário criado com sucesso!" });
    } catch (err) {
      console.error("Erro ao adicionar usuário:", err);
      toast({
        description: "Erro ao adicionar usuário.",
        variant: "destructive",
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
                  <DialogTitle className="text-xl">
                    Adicionar novo usuário
                  </DialogTitle>
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
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-md"
                        onClick={() => handleRemove(user.id)}
                        disabled={isPending}
                      >
                        Remover
                      </Button>
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
