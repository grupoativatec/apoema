"use client";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { actionsDropdownItems } from "@/constants";
import { constructDownloadUrl } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "./ActionsModalContent";
import { useToast } from "@/hooks/use-toast";
import FileDelete from "./FileDelete";

const translateLabel = (value: string) => {
  const translations: Record<string, string> = {
    rename: "Renomear",
    delete: "Excluir",
    share: "Compartilhar",
    details: "Detalhes",
    download: "Baixar",
  };

  return translations[value] || value;
};

const ActionsDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmail] = useState<string[]>([]);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);

  const path = usePathname();
  const { toast } = useToast();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setAction(null);
    setName(file.name);
    setIsDropdownOpen(false);
  };

  const handleActions = async () => {
    if (!action) return null;
    setIsLoading(true);

    let success = false;

    const actions = {
      rename: () =>
        renameFile({
          fileId: file.$id,
          name,
          extension: file.extension,
          path,
        }),

      share: () =>
        updateFileUsers({
          fileId: file.$id,
          emails,
          path,
        }),

      delete: () => {
        if (!file?.$id || !file?.bucketFileId) {
          toast({
            title: "Erro ao deletar arquivo",
          });
          return false;
        }

        return deleteFile({
          fileId: file.$id,
          path,
          bucketFileId: file.bucketFileId,
        });
      },
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) closeAllModals();

    setIsLoading(false);
  };

  const handleRemoveUser = async (email: string) => {
    const updateEmails = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      fileId: file.$id,
      emails,
      path,
    });

    if (success) setEmail(updateEmails);

    closeAllModals();

    toast({
      title: "Usuário removido com sucesso",
    });
  };

  const handleDropdownAction = (actionsItems: ActionType) => {
    setAction(actionsItems);

    if (["rename", "share", "delete", "details"].includes(actionsItems.value)) {
      setIsModalOpen(true);
      setIsDropdownOpen(false);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const renderDialogContent = () => {
    if (!action) return null;

    return (
      <DialogContent className="shad-dialog button dark:bg-zinc-900/80 dark:text-white">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100 dark:text-white">
            {translateLabel(action.value)}
          </DialogTitle>

          {action.value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          )}

          {action.value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmail}
              onRemove={handleRemoveUser}
            />
          )}

          {action.value === "details" && <FileDetails file={file} />}
          {action.value === "delete" && <FileDelete file={file} />}
        </DialogHeader>

        {["rename", "share", "delete"].includes(action.value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button
              onClick={closeAllModals}
              className="modal-cancel-button dark:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleActions}
              className="modal-submit-button dark:text-white"
            >
              {!isLoading ? (
                translateLabel(action.value)
              ) : (
                <div className="flex space-x-1">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="h-4 w-6 rounded-full bg-white"
                      style={{ borderRadius: "50% 50% 40% 40%" }}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        ease: "easeInOut",
                        delay: index * 0.2,
                      }}
                    />
                  ))}
                </div>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots menu"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="dark:bg-zinc-800">
          <DropdownMenuLabel className="max-w-[200px] truncate dark:text-white">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionsItems) => (
            <DropdownMenuItem
              key={actionsItems.value}
              className="shad-dropdown-item dark:text-white"
              onClick={() => {
                if (actionsItems.value === "download") return;
                handleDropdownAction(actionsItems);
              }}
            >
              {actionsItems.value === "download" ? (
                <Link
                  download={file.name}
                  href={constructDownloadUrl(file.bucketFileId)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={actionsItems.icon}
                    alt={actionsItems.label}
                    width={30}
                    height={30}
                  />
                  {translateLabel(actionsItems.value)}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionsItems.icon}
                    alt={actionsItems.label}
                    width={30}
                    height={30}
                  />
                  {translateLabel(actionsItems.value)}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionsDropdown;
