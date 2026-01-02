'use client';
import { PrivateLayout } from '@/components/private-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DoctorDetailsTemplateProps {
  doctorId: string;
}

interface DoctorDetails {
  id: string;
  name: string;
  crm: string;
  specialties: string[];
  contacts: {
    phone?: string;
    email?: string;
  };
  metrics: {
    totalRevenue: number;
    totalAppointments: number;
    averageTicket: number;
  };
  topProcedures: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
}

export const DoctorDetailsTemplate = ({
  doctorId,
}: DoctorDetailsTemplateProps) => {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API call
    // Example: fetch(`/api/doctors/${doctorId}`).then(res => res.json())

    // Mock data for demonstration
    setTimeout(() => {
      setDoctor({
        id: doctorId,
        name: 'Dr. Rafael Silva',
        crm: 'CRM/RJ 12345',
        specialties: ['Cardiologia', 'Clínica Geral'],
        contacts: {
          phone: '(21) 98765-4321',
          email: 'rafael.silva@example.com',
        },
        metrics: {
          totalRevenue: 125000,
          totalAppointments: 450,
          averageTicket: 277.78,
        },
        topProcedures: [
          {
            name: 'Eletrocardiograma',
            count: 120,
            revenue: 36000,
          },
          {
            name: 'Ecocardiograma',
            count: 80,
            revenue: 48000,
          },
          {
            name: 'Consulta de Rotina',
            count: 250,
            revenue: 25000,
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, [doctorId]);

  if (loading) {
    return (
      <PrivateLayout title="Detalhes do Médico" description="Carregando...">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (!doctor) {
    return (
      <PrivateLayout
        title="Detalhes do Médico"
        description="Médico não encontrado"
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Médico não encontrado</p>
          <Button onClick={() => router.push('/doctors')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de médicos
          </Button>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout
      title={doctor.name}
      description={`${doctor.crm} - ${doctor.specialties.join(', ')}`}
    >
      <div className="flex flex-col gap-6">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/doctors')}
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
                  Faturamento Total
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(doctor.metrics.totalRevenue)}
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
                  Total de Atendimentos
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {doctor.metrics.totalAppointments}
                </p>
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
                  Ticket Médio
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(doctor.metrics.averageTicket)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Information and Top Procedures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctor Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Médico
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nome Completo
                </label>
                <p className="text-base text-gray-900 mt-1">{doctor.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CRM</label>
                <p className="text-base text-gray-900 mt-1">{doctor.crm}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Especialidades
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {doctor.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Contatos
                </label>
                <div className="mt-1 space-y-1">
                  {doctor.contacts.phone && (
                    <p className="text-base text-gray-900">
                      Telefone: {doctor.contacts.phone}
                    </p>
                  )}
                  {doctor.contacts.email && (
                    <p className="text-base text-gray-900">
                      Email: {doctor.contacts.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Top Procedures */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Principais Procedimentos
            </h3>
            <div className="space-y-4">
              {doctor.topProcedures.map((procedure, index) => (
                <div
                  key={procedure.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center h-8 w-8 bg-gray-200 rounded-full text-sm font-semibold text-gray-700">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {procedure.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {procedure.count} atendimentos
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(procedure.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};
