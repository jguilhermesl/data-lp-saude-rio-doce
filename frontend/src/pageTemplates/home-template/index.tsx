"use client"
import { PrivateLayout } from "@/components/private-layout";

export const HomeTemplate = () => {

  // TODO: Substituir por lógica real de autenticação
  // Exemplo: const isAdmin = user?.role === 'admin';
  const isAdmin = true; // Defina como true para ver as rotas de admin

  return (
    <PrivateLayout
      title="Dashboard"
      description="Gerencie seus produtos e categorias"
      isAdmin={isAdmin} // Passa a flag de admin para controlar visibilidade das rotas
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cards de estatísticas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total de Produtos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Categorias</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Usuários</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};
