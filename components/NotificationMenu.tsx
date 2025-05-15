"use client";

import { Bell, Package, Trash2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function NotificationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="relative flex size-[45px] items-center justify-center rounded-xl bg-[#f0f0f0] p-0 text-[#333] shadow-drop-1 hover:bg-[#e0e0e0] dark:border dark:border-white/20 dark:bg-zinc-900 dark:text-white"
        >
          <Bell className="size-6" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] rounded-xl p-0 shadow-xl dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
          <DropdownMenuLabel className="text-base font-semibold text-zinc-900 dark:text-white">
            Notificações
          </DropdownMenuLabel>
        </div>

        <div className="py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Nenhuma funcionalidade ativa
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
