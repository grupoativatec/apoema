import { Icon } from "@iconify/react";

import { SideNavItem } from "./types";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Home",
    path: "/",
    icon: <Icon icon="lucide:home" width="24" height="24" />,
  },
  {
    title: "LI",
    path: "/li",
    icon: <Icon icon="lucide:file-cog" width="24" height="24" />,
    submenu: true,
    subMenuItems: [
      { title: "Processos", path: "/li/processos" },
      { title: "Controle de li", path: "/li/controledeli" },
    ],
  },
  // {
  //   title: "Etiquetas",
  //   path: "/etiquetas/controle",
  //   icon: <Icon icon="lucide:tag" width="24" height="24" />,
  // },
  {
    title: "Certificados",
    path: "/certificados",
    icon: <Icon icon="lucide:shield-check" width="24" height="24" />,
    submenu: true,
    subMenuItems: [
      { title: "Digitais", path: "/certificados" },
      { title: "Certificações", path: "/certificacoes/controlecertificados" },
    ],
  },
  {
    title: "Configurações",
    path: "/settings",
    icon: <Icon icon="lucide:settings" width="24" height="24" />,
    submenu: true,
    subMenuItems: [
      { title: "Usuarios", path: "/settings/users" },
      { title: "Perfil", path: "/settings/profile" },
    ],
  },
];
