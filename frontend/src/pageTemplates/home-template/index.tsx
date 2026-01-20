"use client";

import { useState } from "react";
import { PrivateLayout } from "@/components/private-layout";
import { DateRangePicker } from "@/components/date-range-picker";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { OverviewTab } from "@/components/dashboard-tabs/overview-tab";
import { PatientsTab } from "@/components/dashboard-tabs/patients-tab";
import { ExpensesTab } from "@/components/dashboard-tabs/expenses-tab";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { BarChart3, Users, Receipt } from "lucide-react";

type TabType = "overview" | "patients" | "expenses";

export const HomeTemplate = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 2)));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Formatar datas para API
  const formattedStartDate = format(startDate, "yyyy-MM-dd");
  const formattedEndDate = format(endDate, "yyyy-MM-dd");

  // Buscar dados
  const { data: dashboardData, isLoading } = useDashboardMetrics({
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  });

  const tabs = [
    {
      id: "overview" as TabType,
      label: "Visão Geral",
      icon: BarChart3,
    },
    {
      id: "patients" as TabType,
      label: "Pacientes",
      icon: Users,
    },
    {
      id: "expenses" as TabType,
      label: "Despesas",
      icon: Receipt,
    },
  ];

  return (
    <PrivateLayout
      title="Dashboard Executiva"
      description="Visão completa do seu negócio com insights acionáveis"
    >
      <div className="flex flex-col gap-6">
        {/* Filtro de Período */}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />

        {/* Sistema de Abas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 p-2" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all
                      ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando dados...</p>
                </div>
              </div>
            ) : !dashboardData ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Nenhum dado disponível para o período selecionado</p>
                  <p className="text-gray-400 text-sm">Tente selecionar outro período</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "overview" && <OverviewTab data={dashboardData} />}
                {activeTab === "patients" && <PatientsTab data={dashboardData} />}
                {activeTab === "expenses" && <ExpensesTab data={dashboardData.expenses} />}
              </>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};
