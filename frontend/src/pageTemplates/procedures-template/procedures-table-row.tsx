'use client';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProceduresTableRowProps {
  procedure: {
    id: string;
    name: string;
    specialty?: string;
    revenue?: number;
    appointments?: number;
    averageTicket?: number;
  };
}

export const ProceduresTableRow = ({ procedure }: ProceduresTableRowProps) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/procedures/${procedure.id}`);
  };

  return (
    <Table.Row>
      <Table.Col className="font-medium">{procedure.name}</Table.Col>
      <Table.Col className="font-medium">
        {procedure.specialty || 'N/A'}
      </Table.Col>
      <Table.Col className="font-medium">
        {procedure.revenue
          ? new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(procedure.revenue)
          : 'R$ 0,00'}
      </Table.Col>
      <Table.Col className="font-medium">
        {procedure.appointments || 0}
      </Table.Col>
      <Table.Col className="font-medium">
        {procedure.averageTicket
          ? new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(procedure.averageTicket)
          : 'R$ 0,00'}
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
