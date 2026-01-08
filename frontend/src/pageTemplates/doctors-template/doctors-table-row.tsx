'use client';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table/table';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DoctorsTableRowProps {
  doctor: {
    id: string;
    externalId: string;
    name: string;
    status?: string;
    revenue?: number;
  };
}

export const DoctorsTableRow = ({ doctor }: DoctorsTableRowProps) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/doctors/${doctor.id}`);
  };

  return (
    <Table.Row>
      <Table.Col className="font-medium">{doctor.name}</Table.Col>
      <Table.Col className="font-medium">Cardiologista</Table.Col>
      <Table.Col className="font-medium">
        {doctor.revenue
          ? new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(doctor.revenue)
          : 'R$ 0,00'}
      </Table.Col>
      <Table.Col className="font-medium">123</Table.Col>
      <Table.Col className="font-medium">R$ 34,00</Table.Col>
      <Table.Col>
        <Button variant="ghost" size="sm" onClick={handleViewDetails}>
          <Eye className="mr-2 h-3 w-3" />
          Ver detalhes
        </Button>
      </Table.Col>
    </Table.Row>
  );
};
