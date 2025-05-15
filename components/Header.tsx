/* eslint-disable tailwindcss/migration-from-tailwind-2 */
"use client";
import React, { useState, useEffect } from "react";
import Search from "./Search";
import FileUploader from "./FileUploader";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationMenu } from "./NotificationMenu";
import { SearchIcon } from "lucide-react";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);

  const toggleSearchModal = () => {
    setSearchModalOpen((prev) => !prev);
  };

  // Ctrl + K (or Cmd + K on macOS)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        toggleSearchModal();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <header className="header flex h-16 w-full items-center justify-end border-b bg-background px-10 dark:bg-zinc-900">
      <div className="flex items-center gap-3 px-5">
        <button
          onClick={toggleSearchModal}
          className="h-[45px] gap-2 rounded-lg bg-[#f0f0f0] px-4 text-[#333] shadow-drop-1 hover:bg-[#e0e0e0] dark:border dark:border-white/20 dark:bg-zinc-900"
        >
          <SearchIcon className="size-4 text-light-100 dark:text-white" />
        </button>
        <FileUploader
          className="dark:border dark:border-white/20"
          ownerId={userId}
          accountId={accountId}
        />
        <NotificationMenu />
        <ThemeToggle />
      </div>

      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-xl border border-black/10 bg-white/80 p-4 text-black shadow-2xl backdrop-blur-xl transition-all duration-200 ease-in-out dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-sm">
            <button
              onClick={toggleSearchModal}
              className="absolute right-7 top-[29px] text-sm text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <Search closeModal={toggleSearchModal} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
