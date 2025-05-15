"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { SIDENAV_ITEMS } from "../constants/links";
import { SideNavItem } from "../constants/types";
import { signOutUser } from "@/lib/actions/user.actions";

interface Props {
  fullName: string;
  avatar: string;
}

const MobileNavigation = ({ fullName, avatar }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-0 z-50 w-full bg-white shadow dark:bg-zinc-900 md:hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand.png" alt="Logo" width={32} height={32} />
          <span className="text-lg font-semibold dark:text-white">
            VaultCloud
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(true)}
          className="text-zinc-700 dark:text-zinc-100"
        >
          <Icon icon="lucide:menu" width={24} height={24} />
        </button>
      </div>

      {/* Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex"
          >
            {/* Backdrop */}
            <div
              className="flex-1 bg-black/30"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar (agora à direita) */}
            <div className="relative z-50 ml-auto flex w-64 flex-col bg-white shadow-xl dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
                <span className="text-lg font-semibold dark:text-white">
                  Menu
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-600 dark:text-zinc-300"
                >
                  <Icon icon="lucide:x" width={22} height={22} />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {SIDENAV_ITEMS.map((item, idx) => (
                  <MenuItem key={idx} item={item} />
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={avatar ?? "/assets/images/avatar.png"}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium dark:text-white">
                        {fullName}
                      </span>
                      <Link
                        href="/profile"
                        className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
                      >
                        Ver perfil
                      </Link>
                    </div>
                  </div>
                  <button
                    className="text-zinc-500 transition dark:text-zinc-400"
                    onClick={async () => {
                      await signOutUser();
                    }}
                  >
                    <Icon icon="lucide:log-out" width={20} height={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileNavigation;

const MenuItem = ({ item }: { item: SideNavItem }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const isActive = pathname.includes(item.path);

  return (
    <div className="group relative">
      {item.submenu ? (
        <>
          <button
            onClick={() => setSubMenuOpen(!subMenuOpen)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-100 hover:shadow-sm dark:text-zinc-100 dark:hover:bg-zinc-800 ${
              isActive ? "bg-zinc-100 font-semibold dark:bg-zinc-800" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            <motion.div
              animate={{ rotate: subMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon icon="lucide:chevron-down" width={18} height={18} />
            </motion.div>
          </button>

          <AnimatePresence>
            {subMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-8 mt-2 flex flex-col gap-2 border-l border-zinc-200 pl-4 dark:border-zinc-700"
              >
                {item.subMenuItems?.map((subItem, idx) => (
                  <Link
                    key={idx}
                    href={subItem.path}
                    className={`text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white ${
                      pathname === subItem.path
                        ? "font-medium text-black dark:text-white"
                        : ""
                    }`}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <Link
          href={item.path}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-100 hover:shadow-sm dark:text-zinc-100 dark:hover:bg-zinc-800 ${
            pathname === item.path
              ? "bg-zinc-100 font-semibold dark:bg-zinc-800"
              : ""
          }`}
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      )}
    </div>
  );
};
