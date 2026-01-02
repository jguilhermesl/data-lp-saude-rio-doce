'use client';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
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
    <TableRow>
      <TableCell className="font-mono">
        {doctor.externalId || doctor.id}
      </TableCell>
      <TableCell className="font-medium">{doctor.name}</TableCell>
      <TableCell className="font-medium">Cardiologista</TableCell>
      <TableCell className="font-medium">
        {doctor.revenue
          ? new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(doctor.revenue)
          : 'R$ 0,00'}
      </TableCell>
      <TableCell className="font-medium">123</TableCell>
      <TableCell className="font-medium">R$ 34,00</TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={handleViewDetails}>
          <Eye className="mr-2 h-3 w-3" />
          Ver detalhes
        </Button>
      </TableCell>
    </TableRow>
  );
};
