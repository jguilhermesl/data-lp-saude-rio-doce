'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { DoctorMetrics, DoctorMetricsSummary } from '@/services/api/doctors';
import { DoctorsPDFReport } from './doctors-pdf-report';
import { exportDoctorsToExcel } from './doctors-excel-export';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface DoctorsExportButtonsProps {
  summary?: DoctorMetricsSummary;
  doctors: DoctorMetrics[];
  dateRange: { from?: Date; to?: Date };
  search?: string;
  isLoading: boolean;
}

export const DoctorsExportButtons = ({
  summary,
  doctors,
  dateRange,
  search,
  isLoading,
}: DoctorsExportButtonsProps) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportPDF = async () => {
    if (!summary || doctors.length === 0 || isLoading) return;

    try {
      setIsExportingPDF(true);

      // Gerar o PDF
      const blob = await pdf(
        <DoctorsPDFReport
          summary={summary}
          doctors={doctors}
          dateRange={dateRange}
          search={search}
        />
      ).toBlob();

      // Criar URL temporária e fazer download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      link.download = `relatorio-medicos_${timestamp}.pdf`;
      
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
    if (doctors.length === 0 || isLoading) return;

    try {
      setIsExportingExcel(true);
      exportDoctorsToExcel(doctors);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao gerar o arquivo Excel. Tente novamente.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const hasData = doctors.length > 0 && !isLoading && summary;

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
            : 'Exportar dados da tabela em Excel'
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
