'use client';
import { PrivateLayout } from '@/components/private-layout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, DollarSign, Users, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientDetailsTemplateProps {
  patientId: string;
}

interface PatientAppointment {
  id: string;
  dateTime: Date;
  doctorName: string;
  procedures: string[];
  insurance: string;
  totalValue: number;
  paidValue: number;
  paymentMethod: string;
}

interface PatientDetails {
  id: string;
  name: string;
  cpf: string;
  lpBenefitsStatus: string;
  totalSpent: number;
  appointmentsCount: number;
  lastAppointmentDate: Date | null;
  appointments: PatientAppointment[];
}

export const PatientDetailsTemplate = ({
  patientId,
}: PatientDetailsTemplateProps) => {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API call
    // Example: fetch(`/api/patients/${patientId}`).then(res => res.json())

    // Mock data for demonstration
    setTimeout(() => {
      setPatient({
        id: patientId,
        name: 'Maria da Silva',
        cpf: '123.456.789-00',
        lpBenefitsStatus: 'Ativo',
        totalSpent: 5850,
        appointmentsCount: 12,
        lastAppointmentDate: new Date(2025, 0, 15),
        appointments: [
          {
            id: 'apt-1',
            dateTime: new Date(2025, 0, 15, 14, 30),
            doctorName: 'Dr. Rafael Silva',
            procedures: ['Consulta Cardiológica', 'Eletrocardiograma'],
            insurance: 'Unimed',
            totalValue: 350,
            paidValue: 280,
            paymentMethod: 'Cartão de Crédito',
          },
          {
            id: 'apt-2',
            dateTime: new Date(2025, 0, 10, 10, 0),
            doctorName: 'Dra. Ana Costa',
            procedures: ['Consulta de Rotina'],
            insurance: 'Particular',
            totalValue: 250,
            paidValue: 250,
            paymentMethod: 'Dinheiro',
          },
          {
            id: 'apt-3',
            dateTime: new Date(2024, 11, 20, 15, 45),
            doctorName: 'Dr. Carlos Mendes',
            procedures: ['Exame de Sangue', 'Hemograma Completo'],
            insurance: 'Amil',
            totalValue: 180,
            paidValue: 150,
            paymentMethod: 'Débito',
          },
          {
            id: 'apt-4',
            dateTime: new Date(2024, 11, 5, 9, 0),
            doctorName: 'Dr. Rafael Silva',
            procedures: ['Ecocardiograma'],
            insurance: 'Unimed',
            totalValue: 450,
            paidValue: 360,
            paymentMethod: 'Cartão de Crédito',
          },
          {
            id: 'apt-5',
            dateTime: new Date(2024, 10, 22, 16, 30),
            doctorName: 'Dra. Paula Rodrigues',
            procedures: ['Consulta Ortopédica', 'Raio-X'],
            insurance: 'Particular',
            totalValue: 380,
            paidValue: 380,
            paymentMethod: 'PIX',
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, [patientId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (date: Date) => {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'Ativo'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <PrivateLayout title="Detalhes do Paciente" description="Carregando...">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (!patient) {
    return (
      <PrivateLayout
        title="Detalhes do Paciente"
        description="Paciente não encontrado"
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Paciente não encontrado</p>
          <Button onClick={() => router.push('/patient')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de pacientes
          </Button>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout title={patient.name} description={`CPF: ${patient.cpf}`}>
      <div className="flex flex-col gap-6">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/patient')}
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
                  LP Benefícios
                </h3>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                      patient.lpBenefitsStatus
                    )}`}
                  >
                    {patient.lpBenefitsStatus}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Total Gasto no Período
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(patient.totalSpent)}
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
                  Número de Atendimentos
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {patient.appointmentsCount}
                </p>
                {patient.lastAppointmentDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Último: {formatDate(patient.lastAppointmentDate)}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Atendimentos do Paciente
          </h3>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data / Hora</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Procedimento(s)</TableHead>
                  <TableHead>Convênio</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Valor Pago</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.appointments.length > 0 ? (
                  patient.appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {formatDateTime(appointment.dateTime)}
                      </TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {appointment.procedures.map((procedure, index) => (
                            <span key={index} className="text-sm text-gray-700">
                              {procedure}
                              {index < appointment.procedures.length - 1 &&
                                ', '}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{appointment.insurance}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(appointment.totalValue)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(appointment.paidValue)}
                      </TableCell>
                      <TableCell>{appointment.paymentMethod}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Nenhum atendimento registrado
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};
