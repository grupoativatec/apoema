"use client";

import { Bell, Package, Trash2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  getNotifications,
  updateNotification,
  deleteNotification as deleteNotificationAPI,
  createNotification,
  getBackendLastUpdated,
  markAllNotificationsAsReadBatch,
} from "@/lib/actions/notification.actions";
import { getQuantidadeImpsDeferindoHoje } from "@/lib/actions/li.actions";
import { getAccountId } from "@/lib/actions/user.actions";

type Notification = {
  $id: string;
  text: string;
  imp: string;
  importador: string;
  lida: boolean;
};

export function NotificationMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const userId = await getAccountId();
        if (!userId) {
          console.error("User ID não encontrado");
          return;
        }

        // Verificar se já existem notificações armazenadas e se não precisam ser atualizadas
        const cachedNotifications = Cookies.get("notifications");
        const lastUpdated = Cookies.get("notifications_last_updated");

        if (cachedNotifications && lastUpdated) {
          setNotifications(JSON.parse(cachedNotifications));
        } else {
          const backendTimestamp = await getBackendLastUpdated(userId);

          if (!lastUpdated || backendTimestamp !== lastUpdated) {
            // Carregar novas notificações do backend
            const fetchedNotifications = await getNotifications(userId);

            const quantidade = await getQuantidadeImpsDeferindoHoje();
            if (quantidade > 0) {
              try {
                const createdNotification = await createNotification({
                  text: `Quantidade de LIs deferindo hoje: ${quantidade}`,
                  userId,
                });
                fetchedNotifications.push(createdNotification);
              } catch (error) {
                console.error(
                  "Erro ao criar notificação de quantidade de LIs:",
                  error
                );
              }
            }

            const mappedNotifications = fetchedNotifications.map((doc) => ({
              $id: doc.$id,
              text: doc.text,
              imp: doc.imp,
              importador: doc.importador,
              lida: doc.lida,
            }));

            const sortedNotifications = [...mappedNotifications].sort(
              (a, b) => {
                if (!a.lida && b.lida) return -1;
                if (a.lida && !b.lida) return 1;
                return 0;
              }
            );

            setNotifications(sortedNotifications);
            Cookies.set("notifications", JSON.stringify(sortedNotifications), {
              expires: 1,
            });
            if (backendTimestamp) {
              Cookies.set("notifications_last_updated", backendTimestamp, {
                expires: 1,
              });
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const markAllAsRead = async () => {
    try {
      const userId = await getAccountId();
      if (!userId) {
        console.error("User ID não encontrado");
        return;
      }

      const unreadNotifications = notifications.filter((n) => !n.lida);
      const unreadIds = unreadNotifications.map((n) => n.$id);

      if (unreadIds.length > 0) {
        await markAllNotificationsAsReadBatch(unreadIds);

        const updatedNotifications = notifications.map((n) =>
          unreadIds.includes(n.$id) ? { ...n, lida: true } : n
        );
        setNotifications(updatedNotifications);

        Cookies.set("notifications", JSON.stringify(updatedNotifications), {
          expires: 1,
        });
      }
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
    }
  };

  const clearAll = async () => {
    try {
      const userId = await getAccountId();
      if (!userId) {
        console.error("User ID não encontrado");
        return;
      }

      for (const notification of notifications) {
        await deleteNotificationAPI(notification.$id);
      }
      setNotifications([]);
      Cookies.remove("notifications");
      Cookies.remove("notifications_last_updated");
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const userId = await getAccountId();
      if (!userId) {
        console.error("User ID não encontrado");
        return;
      }

      await updateNotification(id, { lida: true });
      const updatedNotifications = notifications.map((n) =>
        n.$id === id ? { ...n, lida: true } : n
      );
      setNotifications(updatedNotifications);

      Cookies.set("notifications", JSON.stringify(updatedNotifications), {
        expires: 1,
      });
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const userId = await getAccountId();
      if (!userId) {
        console.error("User ID não encontrado");
        return;
      }

      await deleteNotificationAPI(id);
      const updatedNotifications = notifications.filter((n) => n.$id !== id);
      setNotifications(updatedNotifications);

      Cookies.set("notifications", JSON.stringify(updatedNotifications), {
        expires: 1,
      });
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="relative flex size-[45px] items-center justify-center rounded-xl bg-[#f0f0f0] p-0 text-[#333] shadow-drop-1 hover:bg-[#e0e0e0] dark:border dark:border-white/20 dark:bg-zinc-900 dark:text-white"
        >
          <Bell className="size-6" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-tr from-[#60A5FA] via-[#3B82F6] to-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white shadow-lg ring-2 ring-white/20 dark:ring-black/30">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
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
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              className="text-xs text-black/80 hover:underline dark:text-white/80"
            >
              Marcar todas
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-black/80 hover:underline dark:text-white/80"
            >
              Limpar tudo
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Carregando notificações...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Nenhuma nova notificação
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.$id}
                className={`group flex items-center gap-3 border-b border-zinc-800 p-4 transition-colors ${
                  notification.lida
                    ? "opacity-50"
                    : "bg-zinc-100 hover:bg-zinc-100 hover:opacity-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                <Package className="size-5 shrink-0 text-purple-700 dark:text-purple-400" />
                <div className="flex flex-1 flex-col justify-center text-sm">
                  <p className="break-words font-medium text-black dark:text-white">
                    {notification.text}
                  </p>
                </div>
                <div className="ml-auto flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!notification.lida && (
                    <button
                      title="Marcar como lida"
                      onClick={() => markAsRead(notification.$id)}
                      className="text-green"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    title="Excluir"
                    onClick={() => deleteNotification(notification.$id)}
                    className="text-red"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
