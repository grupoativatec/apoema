'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import Image from 'next/image';

import { SIDENAV_ITEMS } from '../constants/links';
import { SideNavItem } from '../constants/types';
import { signOutUser } from '@/lib/actions/user.actions';
import { useTheme } from 'next-themes';

interface Props {
  name: string;
  avatar: string;
  userId: string;
  accountId: string;
  role: string;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Sidebar = ({ name, avatar, role, isCollapsed, setIsCollapsed }: Props) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedCollapse = localStorage.getItem('sidebarCollapsed');
    if (storedCollapse !== null) {
      setIsCollapsed(storedCollapse === 'true');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }
  }, [isCollapsed, mounted]);

  if (!mounted) return null;

  const logoSrc = theme === 'dark' ? '/apoema-light.png' : '/apoema-dark.png';
  const brandIcon = theme === 'dark' ? '/brand-light.png' : '/brand-dark.png';

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 208 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed hidden h-screen z-50 border-r bg-white shadow-sm dark:bg-zinc-900 md:flex "
    >
      <div className="flex size-full flex-col relative">
        {/* Botão de colapsar/expandir */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group absolute -right-3 top-4 z-20 rounded-full bg-white p-1 shadow-md dark:bg-zinc-800"
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          title={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          <Icon
            icon={isCollapsed ? 'lucide:chevrons-right' : 'lucide:chevrons-left'}
            width={20}
            height={20}
            className="text-zinc-700 dark:text-zinc-300"
          />
        </motion.button>

        {/* Topo - Logo */}
        <Link
          href="/dashboard"
          className="h-16 border-b border-zinc-200 dark:border-zinc-700 px-4 flex items-center"
        >
          <div
            className={`flex items-center transition-all duration-300 ${
              isCollapsed ? 'justify-center w-full' : 'space-x-3'
            }`}
          >
            <Image src={brandIcon} alt="Brand" width={32} height={32} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image src={logoSrc} alt="Logo Apoema" width={90} height={90} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>

        {/* Menu */}
        <div className="flex flex-1 flex-col gap-4  px-2 py-6">
          {SIDENAV_ITEMS.filter((item) => !item.requiresAdmin || role === 'admin').map(
            (item, idx) => (
              <MenuItem key={idx} item={item} isCollapsed={isCollapsed} />
            ),
          )}
        </div>

        {/* Rodapé - Tema + Usuário */}
        <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-700">
          <div
            className={`flex items-center ${
              isCollapsed ? 'flex-col justify-center gap-3' : 'justify-between'
            }`}
          >
            {/* Avatar + Nome */}
            <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col' : ''}`}>
              <Image
                src={avatar ?? '/assets/images/avatar.png'}
                alt="Avatar"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    key="user-name"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </span>
                    <Link
                      href="/settings/profile"
                      className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
                    >
                      Ver perfil
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botões de ações */}
            <div
              className={`flex ${
                isCollapsed
                  ? 'flex-row justify-center w-full gap-4 mt-2'
                  : 'flex-col items-end gap-2'
              }`}
            >
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
                title="Alternar tema"
              >
                <Icon
                  icon={theme === 'dark' ? 'lucide:sun' : 'lucide:moon'}
                  width={20}
                  height={20}
                />
              </button>

              <button
                className="text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
                onClick={async () => await signOutUser()}
                title="Sair"
              >
                <Icon icon="lucide:log-out" width={20} height={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;

// -------------------------------
// MenuItem permanece como antes
// -------------------------------

const MenuItem = ({ item, isCollapsed }: { item: SideNavItem; isCollapsed: boolean }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const isActive = pathname.startsWith(item.path);
  const ref = useRef<HTMLDivElement | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isCollapsed && subMenuOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setSubmenuPosition({
        top: rect.top,
        left: rect.right,
      });
    }
  }, [isCollapsed, subMenuOpen]);

  const toggleSubMenu = () => setSubMenuOpen(!subMenuOpen);
  const showFloatingMenu = isCollapsed && item.submenu;

  return (
    <div
      ref={ref}
      className="relative group"
      onMouseEnter={() => showFloatingMenu && setSubMenuOpen(true)}
      onMouseLeave={() => showFloatingMenu && setSubMenuOpen(false)}
    >
      {item.submenu ? (
        <button
          onClick={!isCollapsed ? toggleSubMenu : undefined}
          className={`flex w-full items-center rounded-lg px-3 py-2 transition-all text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 ${
            isCollapsed ? 'justify-center' : 'justify-between gap-3'
          } ${isActive ? 'bg-zinc-100 font-semibold dark:bg-zinc-800' : ''}`}
          title={isCollapsed ? item.title : ''}
        >
          <div className={`${isCollapsed ? '' : 'flex items-center gap-3'}`}>
            {item.icon}
            {!isCollapsed && <span>{item.title}</span>}
          </div>

          {!isCollapsed && item.submenu && (
            <motion.div animate={{ rotate: subMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <Icon icon="lucide:chevron-down" width="18" height="18" />
            </motion.div>
          )}
        </button>
      ) : (
        <Link
          href={item.path}
          className={`flex w-full px-3 py-2 rounded-lg transition-all text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
            isCollapsed ? 'justify-center items-center' : 'items-center justify-start gap-3'
          } ${
            isActive
              ? 'bg-zinc-100 font-semibold dark:bg-zinc-800'
              : 'text-zinc-700 dark:text-zinc-100'
          }`}
          title={isCollapsed ? item.title : ''}
        >
          {item.icon}
          {!isCollapsed && <span>{item.title}</span>}
        </Link>
      )}

      {!isCollapsed && item.submenu && subMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="ml-8 mt-2 flex flex-col gap-2 border-l border-zinc-200 pl-4 dark:border-zinc-700"
        >
          {item.subMenuItems?.map((subItem, idx) => (
            <Link
              key={idx}
              href={subItem.path}
              className={`text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white ${
                pathname === subItem.path ? 'font-medium text-black dark:text-white' : ''
              }`}
            >
              {subItem.title}
            </Link>
          ))}
        </motion.div>
      )}

      {isCollapsed && subMenuOpen && (
        <div
          className="fixed z-[9999] w-48 rounded-md border bg-white shadow-lg dark:bg-zinc-800"
          style={{
            top: `${submenuPosition.top}px`,
            left: `${submenuPosition.left}px`,
          }}
        >
          <div className="flex flex-col py-2">
            {item.subMenuItems?.map((subItem, idx) => (
              <Link
                key={idx}
                href={subItem.path}
                className={`px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-sky-600 rounded-sm ${
                  pathname === subItem.path ? 'font-semibold' : ''
                }`}
              >
                {subItem.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-0 h-full w-1 rounded-r bg-brand-100"
        />
      )}
    </div>
  );
};
