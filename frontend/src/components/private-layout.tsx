"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Heading } from "./ui/heading";
import { Paragraph } from "./ui/paragraph";
import { cn } from "@/lib/utils";
import { SIDEBAR_ITEMS } from "@/constants/sidebar-items";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface IPrivateLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  actionsComponent?: ReactNode;
}

export const PrivateLayout = ({
  children,
  title,
  description,
  actionsComponent,
}: IPrivateLayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { handleSignOut } = useAuth();
  const { isAdmin, user } = useCurrentUser();

  // Função para extrair primeiro e último nome
  const getFirstAndLastName = (fullName: string | undefined) => {
    if (!fullName) return '';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0];
    return `${names[0]} ${names[names.length - 1]}`;
  };

  // Filtra os itens da sidebar baseado se o usuário é admin
  const visibleItems = SIDEBAR_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const handleLogout = () => {
    handleSignOut();
  };

  // Fecha o menu mobile quando a rota muda
  useEffect(() => {
    setIsMobileMenuOpen(false); // eslint-disable-line
  }, [pathname]);

  // Previne scroll do body quando o menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-20"
        )}
      >
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200">
          {isExpanded ? (
            <Link href="/home">
              <Heading className="text-green-600 text-2xl">easy.sale</Heading>
            </Link>
          ) : (
            <Link href="/home" className="w-full flex justify-center">
              <Heading className="text-green-600 text-2xl">E</Heading>
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-green-50 text-green-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100",
                      !isExpanded && "justify-center"
                    )}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && (
                      <span className="text-sm">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer da Sidebar */}
        <div className="border-t border-gray-200 p-3 space-y-1">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 w-full",
              !isExpanded && "justify-center"
            )}
            title={!isExpanded ? "Sair" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="text-sm">Sair</span>}
          </button>

          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 w-full",
              !isExpanded && "justify-center"
            )}
            title={isExpanded ? "Retrair" : "Expandir"}
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span className="text-sm">Retrair</span>
              </>
            ) : (
              <ChevronRight className="w-5 h-5 shrink-0" />
            )}
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header da Sidebar Mobile */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200">
          <Link href="/home">
            <Heading className="text-green-600 text-2xl">easy.sale</Heading>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items Mobile */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-green-50 text-green-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer da Sidebar Mobile */}
        <div className="border-t border-gray-200 p-3 space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-20 w-full border-b border-gray-200 bg-white items-center px-4 md:px-8 justify-between">
          <div className="flex items-center gap-4">
            {/* Menu Hamburguer - Apenas Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <Heading className="text-xl md:text-2xl">{title}</Heading>
              <Paragraph className="text-xs md:text-sm text-gray-600 hidden sm:block">
                {description}
              </Paragraph>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {actionsComponent}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium hidden sm:inline">
                  {getFirstAndLastName(user?.name)}
                </span>
                <span className="px-2 md:px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Admin
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
