'use client';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table/table';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DoctorMetrics } from '@/services/api/doctors';

interface DoctorsTableRowProps {
  doctor: DoctorMetrics;
}

export const DoctorsTableRow = ({ doctor }: DoctorsTableRowProps) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/doctors/${doctor.doctorId}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Pega a primeira especialidade ou mostra 'N/A'
  const primarySpecialty = doctor.specialties[0]?.name || 'N/A';

  return (
    <Table.Row>
      <Table.Col className="font-medium">{doctor.name}</Table.Col>
      <Table.Col className="font-medium">{primarySpecialty}</Table.Col>
      <Table.Col className="font-medium">
        {formatCurrency(doctor.totalRevenue)}
      </Table.Col>
      <Table.Col className="font-medium">{doctor.appointmentCount}</Table.Col>
      <Table.Col className="font-medium">
        {formatCurrency(doctor.averageTicket)}
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
