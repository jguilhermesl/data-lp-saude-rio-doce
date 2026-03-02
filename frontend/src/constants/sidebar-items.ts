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
import { UserRole } from "@/@types/UserRole";

// Configuração dos itens da sidebar
export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  allowedRoles?: UserRole[]; // Roles permitidos para acessar esta rota
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/home",
    icon: LayoutDashboard,
    adminOnly: false,
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER], // POS_VENDA não tem acesso
  },
  {
    label: "Médicos",
    href: "/doctors",
    icon: Package,
    adminOnly: false,
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER], // POS_VENDA não tem acesso
  },
  {
    label: "Procedimentos",
    href: "/procedures",
    icon: ClipboardList,
    adminOnly: false,
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER], // POS_VENDA não tem acesso
  },
  {
    label: "Atendimentos",
    href: "/appointments",
    icon: Calendar,
    adminOnly: false,
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER], // POS_VENDA não tem acesso
  },
  {
    label: "Pacientes",
    href: "/patient",
    icon: FolderTree,
    adminOnly: false,
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER, UserRole.POS_VENDA], // POS_VENDA TEM acesso
  },
  {
    label: "Usuários",
    href: "/users",
    icon: Users,
    adminOnly: true,
    allowedRoles: [UserRole.ADMIN], // Apenas admin pode acessar
  },
  {
    label: "Financeiro",
    href: "/financial",
    icon: DollarSign,
    adminOnly: true,
    allowedRoles: [UserRole.ADMIN], // Apenas admin pode acessar
  },
  {
    label: "Pós-Venda",
    href: "/after-sales",
    icon: Headset,
    adminOnly: false,
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER, UserRole.POS_VENDA], // POS_VENDA TEM acesso
  },
];
