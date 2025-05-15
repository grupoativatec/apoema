/* eslint-disable tailwindcss/migration-from-tailwind-2 */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PencilLine } from "lucide-react";
import { getCurrentUser, updateUser } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/file.actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setName(user.fullName);
        setEmail(user.email);
        setAvatar(user.avatar);
        setUserId(user.$id);
      }
      setIsLoading(false); // Finaliza o carregamento
    };

    fetchUser();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
      setNewAvatarFile(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true); // Inicia o processo de salvamento

    let avatarUrl = avatar;

    if (newAvatarFile) {
      const fileData = await uploadFile({
        file: newAvatarFile,
        ownerId: userId,
        accountId: userId,
        path: "/profile",
      });

      avatarUrl = fileData.url;
    }

    await updateUser({
      userId,
      fullName: name,
      email,
      avatar: avatarUrl,
    });

    setAvatar(avatarUrl);

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

        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start">
          <div className="relative mb-6 flex size-40 items-center justify-center overflow-hidden rounded-full border-4 border-light-300 shadow-lg dark:border-white/20">
            {isLoading ? (
              <Skeleton className="size-40 rounded-full" />
            ) : (
              <Image
                src={
                  avatar && avatar !== "" ? avatar : "/assets/images/avatar.png"
                }
                alt="Avatar"
                fill
                className="rounded-full object-cover"
              />
            )}
            {!isLoading && (
              <label className="absolute bottom-2 right-2 m-2 cursor-pointer rounded-full bg-blue p-2">
                <PencilLine className="size-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Form */}
          <div className="flex w-full flex-col gap-6">
            <div className="relative">
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="peer w-full border-b-2 border-light-400 bg-transparent pt-4 text-lg text-black placeholder-transparent outline-none focus:border-black dark:text-zinc-400 dark:focus:border-white"
                    placeholder="Nome"
                  />
                  <label className="absolute left-0 top-0 text-sm text-black transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg dark:text-zinc-200">
                    Nome
                  </label>
                </>
              )}
            </div>

            <div className="relative">
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer w-full border-b-2 border-light-300 bg-transparent pt-4 text-lg text-black placeholder-transparent outline-none focus:border-black dark:text-zinc-400 dark:focus:border-white"
                    placeholder="Email"
                  />
                  <label className="absolute left-0 top-0 text-sm text-black transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg dark:text-zinc-200">
                    Email
                  </label>
                </>
              )}
            </div>

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
