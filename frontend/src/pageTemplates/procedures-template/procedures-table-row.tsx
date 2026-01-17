'use client';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Procedure } from '@/services/api/procedures';

interface ProceduresTableRowProps {
  procedure: Procedure;
}

export const ProceduresTableRow = ({ procedure }: ProceduresTableRowProps) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/procedures/${procedure.id}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Table.Row>
      <Table.Col className="font-medium">{procedure.name}</Table.Col>
      <Table.Col className="font-medium">
        {formatCurrency(procedure.defaultPrice)}
      </Table.Col>
      <Table.Col className="font-medium">
        {procedure._count.appointmentProcedures}
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
