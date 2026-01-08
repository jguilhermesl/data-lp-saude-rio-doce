'use client';
import { PrivateLayout } from '@/components/private-layout';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  DollarSign,
  Activity,
  TrendingUp,
  Building2,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';

interface ProcedureDetailsTemplateProps {
  procedureId: string;
}

interface ProcedureDetails {
  id: string;
  name: string;
  specialty?: string;
  metrics: {
    totalRevenue: number;
    totalAppointments: number;
    averageTicket: number;
  };
  distributionByInsurance: Array<{
    name: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  distributionByDoctor: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  relatedAppointments: Array<{
    id: string;
    patientName: string;
    appointmentValue: number;
    dateTime: string;
    paidValue: number;
  }>;
}

export const ProcedureDetailsTemplate = ({
  procedureId,
}: ProcedureDetailsTemplateProps) => {
  const router = useRouter();
  const [procedure, setProcedure] = useState<ProcedureDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API call
    // Example: fetch(`/api/procedures/${procedureId}`).then(res => res.json())

    // Mock data for demonstration
    setTimeout(() => {
      setProcedure({
        id: procedureId,
        name: 'Eletrocardiograma',
        specialty: 'Cardiologia',
        metrics: {
          totalRevenue: 84000,
          totalAppointments: 280,
          averageTicket: 300,
        },
        distributionByInsurance: [
          {
            name: 'Unimed',
            count: 120,
            revenue: 36000,
            percentage: 42.86,
          },
          {
            name: 'Bradesco Saúde',
            count: 80,
            revenue: 24000,
            percentage: 28.57,
          },
          {
            name: 'Amil',
            count: 50,
            revenue: 15000,
            percentage: 17.86,
          },
          {
            name: 'Particular',
            count: 30,
            revenue: 9000,
            percentage: 10.71,
          },
        ],
        distributionByDoctor: [
          {
            name: 'Dr. Rafael Silva',
            count: 150,
            revenue: 45000,
          },
          {
            name: 'Dra. Maria Santos',
            count: 80,
            revenue: 24000,
          },
          {
            name: 'Dr. João Oliveira',
            count: 50,
            revenue: 15000,
          },
        ],
        relatedAppointments: [
          {
            id: '1',
            patientName: 'João Silva',
            appointmentValue: 300,
            dateTime: '2025-01-05 14:30',
            paidValue: 300,
          },
          {
            id: '2',
            patientName: 'Maria Oliveira',
            appointmentValue: 300,
            dateTime: '2025-01-05 15:00',
            paidValue: 300,
          },
          {
            id: '3',
            patientName: 'Pedro Santos',
            appointmentValue: 300,
            dateTime: '2025-01-04 10:00',
            paidValue: 270,
          },
          {
            id: '4',
            patientName: 'Ana Costa',
            appointmentValue: 300,
            dateTime: '2025-01-04 11:30',
            paidValue: 300,
          },
          {
            id: '5',
            patientName: 'Carlos Ferreira',
            appointmentValue: 300,
            dateTime: '2025-01-03 16:00',
            paidValue: 300,
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, [procedureId]);

  if (loading) {
    return (
      <PrivateLayout
        title="Detalhes do Procedimento"
        description="Carregando..."
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (!procedure) {
    return (
      <PrivateLayout
        title="Detalhes do Procedimento"
        description="Procedimento não encontrado"
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Procedimento não encontrado</p>
          <Button onClick={() => router.push('/procedures')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de procedimentos
          </Button>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout
      title={procedure.name}
      description={procedure.specialty || 'Procedimento'}
    >
      <div className="flex flex-col gap-6">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/procedures')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Faturamento no Período
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(procedure.metrics.totalRevenue)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Quantidade Realizada
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {procedure.metrics.totalAppointments}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Ticket Médio
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(procedure.metrics.averageTicket)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Distribution sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distribution by Insurance */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                Distribuição por Convênio
              </h3>
            </div>
            <div className="space-y-4">
              {procedure.distributionByInsurance.map((insurance) => (
                <div
                  key={insurance.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {insurance.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {insurance.count} atendimentos (
                      {insurance.percentage.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(insurance.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution by Doctor */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                Distribuição por Médico
              </h3>
            </div>
            <div className="space-y-4">
              {procedure.distributionByDoctor.map((doctor, index) => (
                <div
                  key={doctor.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center h-8 w-8 bg-gray-200 rounded-full text-sm font-semibold text-gray-700">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {doctor.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {doctor.count} atendimentos
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(doctor.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Atendimentos Vinculados ao Procedimento
          </h3>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Paciente</TableHead>
                  <TableHead>Data e Hora</TableHead>
                  <TableHead>Valor do Atendimento</TableHead>
                  <TableHead>Valor Pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedure.relatedAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.patientName}
                    </TableCell>
                    <TableCell>
                      {new Date(appointment.dateTime).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(appointment.appointmentValue)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(appointment.paidValue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};
