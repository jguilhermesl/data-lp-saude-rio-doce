'use client';

import { Table } from '@/components/ui/table/table';
import { ProceduresTableRow } from './procedures-table-row';
import { Procedure } from '@/services/api/procedures';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProceduresListProps {
  procedures?: Procedure[];
  isLoading: boolean;
  isError: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export const ProceduresList = ({
  procedures,
  isLoading,
  isError,
  pagination,
  onPageChange,
}: ProceduresListProps) => {
  const headers = [
    'Nome do procedimento',
    'Preço padrão',
    'Nº de atendimentos',
    '',
  ];

  if (isLoading) {
    return (
      <div className="border rounded-md p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Não foi possível carregar a lista de procedimentos.
        </p>
      </div>
    );
  }

  if (!procedures || procedures.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">Nenhum procedimento encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table headers={headers}>
          {procedures.map((procedure) => {
            return (
              <ProceduresTableRow key={procedure.id} procedure={procedure} />
            );
          })}
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            até{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            de <span className="font-medium">{pagination.total}</span>{' '}
            resultados
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
