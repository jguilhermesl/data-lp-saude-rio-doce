import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  Settings,
  Calendar,
} from "lucide-react";

// Configuração dos itens da sidebar
export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/home",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  {
    label: "Médicos",
    href: "/doctors",
    icon: Package,
    adminOnly: false,
  },
  {
    label: "Atendimentos",
    href: "/appointments",
    icon: Calendar,
    adminOnly: false,
  },
  {
    label: "Categorias",
    href: "/company/categories",
    icon: FolderTree,
    adminOnly: false,
  },
  {
    label: "Usuários",
    href: "/company/users",
    icon: Users,
    adminOnly: true, // Apenas admin pode acessar
  },
  {
    label: "Configurações",
    href: "/company/settings",
    icon: Settings,
    adminOnly: true, // Apenas admin pode acessar
  },
];
