'use client';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PatientsTableRowProps {
  patient: {
    id: string;
    name: string;
    cpf: string;
    lpBenefitsStatus: string;
    totalSpent: number;
    appointmentsCount: number;
    lastAppointmentDate: Date;
  };
}

export const PatientsTableRow = ({ patient }: PatientsTableRowProps) => {
  const router = useRouter();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'Ativo'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const handleViewDetails = () => {
    router.push(`/patient/${patient.id}`);
  };

  return (
    <Table.Row>
      <Table.Col className="font-medium">{patient.name}</Table.Col>
      <Table.Col className="font-mono">{patient.cpf}</Table.Col>
      <Table.Col>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
            patient.lpBenefitsStatus
          )}`}
        >
          {patient.lpBenefitsStatus}
        </span>
      </Table.Col>
      <Table.Col className="font-medium">
        {formatCurrency(patient.totalSpent)}
      </Table.Col>
      <Table.Col className="font-medium">{patient.appointmentsCount}</Table.Col>
      <Table.Col className="font-medium">
        {formatDate(patient.lastAppointmentDate)}
      </Table.Col>
      <Table.Col>
        <Button variant="ghost" size="sm" onClick={handleViewDetails}>
          <Eye className="mr-2 h-3 w-3" />
          Ver detalhes
        </Button>
      </Table.Col>
    </Table.Row>
  );
};
