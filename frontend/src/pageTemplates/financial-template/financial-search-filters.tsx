'use client';

interface FinancialSearchFiltersProps {
  category: string;
  onCategoryChange: (category: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const CATEGORIES = [
  'MÉDICO',
  'TERCEIROS',
  'MARKETING',
  'INSUMOS',
  'FUNCIONÁRIO',
  'ESTORNO',
  'TROCO',
  'FAXINA',
  'LABORATÓRIO',
  'SEGURANÇA',
  'CONTADOR',
  'EMPRÉSTIMO',
  'SISTEMA',
  'IMPOSTO',
  'ALUGUEL',
  'ENERGIA',
  'ROYALTIES',
  'INTERNET',
  'MAQUINÁRIO',
  'CONSÓRCIO',
  'SEGURO',
  'CONSULTORIA',
  'LIXO',
  'TARIFA',
  'OUTROS',
];

export const FinancialSearchFilters = ({
  category,
  onCategoryChange,
  search,
  onSearchChange,
}: FinancialSearchFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Filtro de Categoria */}
      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-sm font-medium text-gray-700">
          Categoria
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-[10px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de Busca */}
      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-sm font-medium text-gray-700">
          Buscar
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome ou categoria..."
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};
