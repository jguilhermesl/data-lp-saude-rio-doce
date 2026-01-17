import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { DoctorMetrics, DoctorMetricsSummary } from '@/services/api/doctors';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Registrar fontes (opcional, mas melhora a aparência)
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 3,
    borderBottomStyle: 'solid',
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 3,
  },
  periodInfo: {
    fontSize: 10,
    color: '#475569',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#334155',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  metricCard: {
    width: '18%',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: 500,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
  },
  metricDescription: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 3,
  },
  highlightsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  highlightCard: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  highlightCardGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  highlightCardBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  highlightCardPurple: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  highlightTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 6,
  },
  highlightTitleGreen: {
    color: '#166534',
  },
  highlightTitleBlue: {
    color: '#1e40af',
  },
  highlightTitlePurple: {
    color: '#6b21a8',
  },
  highlightName: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: 500,
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  highlightValueGreen: {
    color: '#15803d',
  },
  highlightValueBlue: {
    color: '#1d4ed8',
  },
  highlightValuePurple: {
    color: '#7c3aed',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: '#cbd5e1',
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8,
    color: '#334155',
  },
  tableCellBold: {
    fontWeight: 700,
    color: '#1e293b',
  },
  col1: { width: '22%' },
  col2: { width: '18%' },
  col3: { width: '15%' },
  col4: { width: '12%' },
  col5: { width: '15%' },
  col6: { width: '18%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#64748b',
  },
  pageNumber: {
    fontSize: 8,
    color: '#64748b',
  },
});

interface DoctorsPDFReportProps {
  summary: DoctorMetricsSummary;
  doctors: DoctorMetrics[];
  dateRange: { from?: Date; to?: Date };
  search?: string;
}

export const DoctorsPDFReport = ({
  summary,
  doctors,
  dateRange,
  search,
}: DoctorsPDFReportProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const periodText = dateRange.from && dateRange.to
    ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    : 'Período não especificado';

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Médicos</Text>
          <Text style={styles.subtitle}>
            Sistema de Gestão - Saúde Rio Doce
          </Text>
          <Text style={styles.periodInfo}>Período: {periodText}</Text>
          {search && (
            <Text style={styles.periodInfo}>Filtro aplicado: {search}</Text>
          )}
          <Text style={styles.periodInfo}>
            Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
        </View>

        {/* Métricas Gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visão Geral - Métricas do Período</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total de Médicos</Text>
              <Text style={styles.metricValue}>{summary.totalDoctors}</Text>
              <Text style={styles.metricDescription}>
                Médicos cadastrados
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Faturamento Médio</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(summary.avgRevenue)}
              </Text>
              <Text style={styles.metricDescription}>
                Por médico no período
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Atendimentos Médios</Text>
              <Text style={styles.metricValue}>
                {Math.round(summary.avgAppointments)}
              </Text>
              <Text style={styles.metricDescription}>
                Por médico no período
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Ticket Médio</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(summary.avgTicket)}
              </Text>
              <Text style={styles.metricDescription}>
                Valor por consulta
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Taxa de Retorno</Text>
              <Text style={styles.metricValue}>
                {formatPercentage(summary.avgReturnRate)}
              </Text>
              <Text style={styles.metricDescription}>
                Pacientes que retornam
              </Text>
            </View>
          </View>
        </View>

        {/* Destaques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destaques do Período</Text>
          <View style={styles.highlightsGrid}>
            {summary.topByRevenue && (
              <View style={[styles.highlightCard, styles.highlightCardGreen]}>
                <Text style={[styles.highlightTitle, styles.highlightTitleGreen]}>
                  Maior Faturamento
                </Text>
                <Text style={styles.highlightName}>
                  {summary.topByRevenue.name}
                </Text>
                <Text style={[styles.highlightValue, styles.highlightValueGreen]}>
                  {formatCurrency(summary.topByRevenue.totalRevenue)}
                </Text>
              </View>
            )}

            {summary.topByAppointments && (
              <View style={[styles.highlightCard, styles.highlightCardBlue]}>
                <Text style={[styles.highlightTitle, styles.highlightTitleBlue]}>
                  Mais Atendimentos
                </Text>
                <Text style={styles.highlightName}>
                  {summary.topByAppointments.name}
                </Text>
                <Text style={[styles.highlightValue, styles.highlightValueBlue]}>
                  {summary.topByAppointments.appointmentCount} atendimentos
                </Text>
              </View>
            )}

            {summary.topByReturnRate && (
              <View style={[styles.highlightCard, styles.highlightCardPurple]}>
                <Text style={[styles.highlightTitle, styles.highlightTitlePurple]}>
                  Maior Taxa de Retorno
                </Text>
                <Text style={styles.highlightName}>
                  {summary.topByReturnRate.name}
                </Text>
                <Text style={[styles.highlightValue, styles.highlightValuePurple]}>
                  {formatPercentage(summary.topByReturnRate.returnRate)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabela de Médicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Detalhamento por Médico ({doctors.length} médicos)
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>
                Médico
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col2]}>
                Especialidade
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                Faturamento
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                Atendimentos
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col5]}>
                Ticket Médio
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col6]}>
                Taxa de Retorno
              </Text>
            </View>

            {doctors.map((doctor, index) => (
              <View
                key={doctor.doctorId}
                style={[
                  styles.tableRow,
                  ...(index % 2 === 0 ? [styles.tableRowEven] : []),
                ]}
              >
                <Text style={[styles.tableCell, styles.col1]}>
                  {doctor.name}
                </Text>
                <Text style={[styles.tableCell, styles.col2]}>
                  {doctor.specialties.map((s) => s.name).join(', ') || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.col3]}>
                  {formatCurrency(doctor.totalRevenue)}
                </Text>
                <Text style={[styles.tableCell, styles.col4]}>
                  {doctor.appointmentCount}
                </Text>
                <Text style={[styles.tableCell, styles.col5]}>
                  {formatCurrency(doctor.averageTicket)}
                </Text>
                <Text style={[styles.tableCell, styles.col6]}>
                  {formatPercentage(doctor.returnRate)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Relatório gerado automaticamente pelo Sistema de Gestão
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
