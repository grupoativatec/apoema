"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PencilLine } from "lucide-react";
import { getCurrentUser, updateUser } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  // Busca dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setName(user.nome);
        setEmail(user.email);
        setAvatar(user.avatar);
        setAvatarUrlInput(user.avatar);
        setUserId(user.id);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  // Salvar alterações
  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);

    await updateUser({
      userId,
      fullName: name,
      email,
      avatar: avatarUrlInput,
    });

    setAvatar(avatarUrlInput);
    setIsSaving(false);

    toast({
      title: "Salvando alterações...",
      description: "Alterações salvas com sucesso!",
    });
  };

  return (
    <div className="flex items-center justify-center bg-light-400 px-4 py-10 dark:bg-zinc-900">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 text-black shadow-xl dark:border dark:border-white/20 dark:bg-zinc-900/80 dark:text-zinc-200">
        <h2 className="mb-6 text-3xl font-semibold">Editar Perfil</h2>

          <div className="flex flex-col items-center justify-center gap-10 text-center">
          {/* Avatar Preview */}
          <div className="relative mb-6 flex size-40 items-center justify-center overflow-hidden rounded-full border-4 border-light-300 shadow-lg dark:border-white/20">
            {isLoading ? (
              <Skeleton className="size-40 rounded-full" />
            ) : (
              <Image
                src={avatarUrlInput || "/assets/images/avatar.png"}
                alt="Avatar"
                fill
                className="rounded-full object-cover"
              />
            )}
          </div>

          {/* Formulário */}
          <div className="flex w-full flex-col gap-6">
            {/* Nome */}
            <div className="relative">
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="peer w-full border-b-2 border-light-400 bg-transparent pt-6 text-lg text-black placeholder-transparent outline-none focus:border-black dark:text-zinc-400 dark:focus:border-white"
                    placeholder="Nome"
                  />
                  <label className="absolute left-0 top-0 text-sm text-black transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg dark:text-zinc-200">
                    Nome
                  </label>
                </>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer w-full border-b-2 border-light-300 bg-transparent pt-6 text-lg text-black placeholder-transparent outline-none focus:border-black dark:text-zinc-400 dark:focus:border-white"
                    placeholder="Email"
                  />
                  <label className="absolute left-0 top-0 text-sm text-black transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg dark:text-zinc-200">
                    Email
                  </label>
                </>
              )}
            </div>

            {/* URL do Avatar */}
            <div className="relative">
              <input
                type="text"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                className="peer w-full border-b-2 border-light-300 bg-transparent pt-6 text-lg text-black placeholder-transparent outline-none focus:border-black dark:text-zinc-400 dark:focus:border-white"
                placeholder="URL do Avatar"
              />
              <label className="absolute left-0 top-0 text-sm text-black transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg dark:text-zinc-200">
                URL da imagem de perfil
              </label>
            </div>

            {/* Botão de salvar */}
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className={`mt-4 self-start rounded-lg bg-blue px-6 py-2 font-medium text-white transition hover:opacity-85 ${
                isSaving || isLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
