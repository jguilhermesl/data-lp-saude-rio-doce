import { Table } from '@/components/ui/table';
import { AppointmentsTableRow } from './appointments-table-row';
import { Appointment } from '@/services/api/appointments';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AppointmentsListProps {
  appointments: Appointment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: Error | null;
  onPageChange: (page: number) => void;
}

export const AppointmentsList = ({
  appointments,
  pagination,
  isLoading,
  error,
  onPageChange,
}: AppointmentsListProps) => {
  const headers = [
    'Data',
    'Hora',
    'Procedimento(s)',
    'Paciente',
    'Médico',
    'Convênio',
    'Valor Pago',
    // 'Ações',
  ];

  if (isLoading) {
    return (
      <div className="border rounded-md overflow-x-auto">
        <div className="p-8 text-center">
          <p className="text-gray-500">Carregando atendimentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-md overflow-x-auto">
        <div className="p-8 text-center">
          <p className="text-red-500">Erro ao carregar atendimentos: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="border rounded-md overflow-x-auto">
        <div className="p-8 text-center">
          <p className="text-gray-500">Nenhum atendimento encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-x-auto">
        <Table headers={headers}>
          {appointments.map((appointment) => {
            return (
              <AppointmentsTableRow
                key={appointment.id}
                appointment={appointment}
              />
            );
          })}
        </Table>
      </div>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} atendimentos
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Mostrar primeira, última e páginas próximas à atual
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  );
                })
                .map((page, index, array) => {
                  // Adicionar "..." entre páginas não consecutivas
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2">...</span>}
                      <Button
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
