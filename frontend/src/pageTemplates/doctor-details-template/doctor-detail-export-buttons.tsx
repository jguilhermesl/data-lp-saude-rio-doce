'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { DoctorDetailPDFReport } from './doctor-detail-pdf-report';
import { exportDoctorDetailToExcel } from './doctor-detail-excel-export';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface Procedure {
  id: string;
  name: string;
  code?: string;
  quantity?: number;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  examValue?: number;
  paidValue?: number;
  paymentDone: boolean;
  insuranceName?: string;
  patient: {
    id: string;
    fullName: string;
    cpf?: string;
  } | null;
  procedures: Procedure[];
}

interface ProcedureStats {
  name: string;
  code?: string;
  count: number;
  revenue: number;
}

interface DoctorDetailExportButtonsProps {
  doctor: {
    id: string;
    name: string;
    crm?: string;
    specialties: Array<{
      id: string;
      name: string;
    }>;
  };
  metrics: {
    totalRevenue: number;
    totalAppointments: number;
    averageTicket: number;
  };
  appointments: Appointment[];
  proceduresByRevenue: ProcedureStats[];
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  isLoading: boolean;
}

export const DoctorDetailExportButtons = ({
  doctor,
  metrics,
  appointments,
  proceduresByRevenue,
  period,
  isLoading,
}: DoctorDetailExportButtonsProps) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportPDF = async () => {
    if (!doctor || isLoading) return;

    try {
      setIsExportingPDF(true);

      // Gerar o PDF
      const blob = await pdf(
        <DoctorDetailPDFReport
          doctor={doctor}
          metrics={metrics}
          appointments={appointments}
          proceduresByRevenue={proceduresByRevenue}
          period={period}
        />
      ).toBlob();

      // Criar URL temporária e fazer download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const doctorNameSlug = doctor.name.replace(/\s+/g, '-').toLowerCase();
      link.download = `relatorio-medico-${doctorNameSlug}_${timestamp}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Liberar memória
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao gerar o relatório PDF. Tente novamente.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = () => {
    if (!doctor || isLoading) return;

    try {
      setIsExportingExcel(true);
      exportDoctorDetailToExcel({
        doctorName: doctor.name,
        crm: doctor.crm,
        appointments,
        totalRevenue: metrics.totalRevenue,
        totalAppointments: metrics.totalAppointments,
        averageTicket: metrics.averageTicket,
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao gerar o arquivo Excel. Tente novamente.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const hasData = !isLoading && doctor && appointments.length > 0;

  return (
    <div className="flex gap-3">
      {/* Botão Exportar PDF */}
      <button
        onClick={handleExportPDF}
        disabled={!hasData || isExportingPDF}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200
          ${
            hasData && !isExportingPDF
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
        title={
          !hasData
            ? 'Nenhum dado disponível para exportar'
            : 'Exportar relatório completo em PDF'
        }
      >
        <FileDown className="w-4 h-4" />
        {isExportingPDF ? (
          <>
            <span className="animate-pulse">Gerando PDF...</span>
          </>
        ) : (
          'Exportar Relatório'
        )}
      </button>

      {/* Botão Exportar Excel */}
      <button
        onClick={handleExportExcel}
        disabled={!hasData || isExportingExcel}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200
          ${
            hasData && !isExportingExcel
              ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm hover:shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
        title={
          !hasData
            ? 'Nenhum dado disponível para exportar'
            : 'Exportar dados em Excel'
        }
      >
        <FileSpreadsheet className="w-4 h-4" />
        {isExportingExcel ? (
          <>
            <span className="animate-pulse">Gerando Excel...</span>
          </>
        ) : (
          'Exportar Excel'
        )}
      </button>
    </div>
  );
};
