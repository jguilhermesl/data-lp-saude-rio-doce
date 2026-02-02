import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ClipboardList,
  Calendar,
  DollarSign,
  Headset,
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
    label: "Procedimentos",
    href: "/procedures",
    icon: ClipboardList,
    adminOnly: false,
  },
  {
    label: "Atendimentos",
    href: "/appointments",
    icon: Calendar,
    adminOnly: false,
  },
  {
    label: "Pacientes",
    href: "/patient",
    icon: FolderTree,
    adminOnly: false,
  },
  {
    label: "Usuários",
    href: "/users",
    icon: Users,
    adminOnly: true, // Apenas admin pode acessar
  },
  {
    label: "Financeiro",
    href: "/financial",
    icon: DollarSign,
    adminOnly: true,
  },
  {
    label: "Pós-Venda",
    href: "/after-sales",
    icon: Headset,
    adminOnly: false,
  },
];
