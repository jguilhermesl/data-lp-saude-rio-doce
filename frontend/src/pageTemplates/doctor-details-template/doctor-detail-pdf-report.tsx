import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Registrar fontes
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
  doctorInfo: {
    fontSize: 11,
    color: '#475569',
    marginTop: 5,
  },
  periodInfo: {
    fontSize: 10,
    color: '#475569',
    marginTop: 3,
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
    gap: 15,
    marginBottom: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: 500,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e293b',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#bfdbfe',
  },
  infoLabel: {
    fontSize: 9,
    color: '#1e40af',
    marginBottom: 4,
    fontWeight: 600,
  },
  infoValue: {
    fontSize: 11,
    color: '#1e293b',
  },
  specialtyBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 9,
    color: '#1e40af',
    fontWeight: 500,
  },
  procedureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
  },
  procedureRank: {
    width: 24,
    height: 24,
    backgroundColor: '#cbd5e1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  procedureRankText: {
    fontSize: 9,
    fontWeight: 700,
    color: '#475569',
  },
  procedureInfo: {
    flex: 1,
  },
  procedureName: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 2,
  },
  procedureCount: {
    fontSize: 8,
    color: '#64748b',
  },
  procedureRevenue: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e293b',
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
  statusPaid: {
    color: '#15803d',
    fontWeight: 600,
  },
  statusPending: {
    color: '#dc2626',
    fontWeight: 600,
  },
  col1: { width: '10%' },
  col2: { width: '8%' },
  col3: { width: '18%' },
  col4: { width: '15%' },
  col5: { width: '22%' },
  col6: { width: '10%' },
  col7: { width: '10%' },
  col8: { width: '7%' },
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

interface DoctorDetailPDFReportProps {
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
}

export const DoctorDetailPDFReport = ({
  doctor,
  metrics,
  appointments,
  proceduresByRevenue,
  period,
}: DoctorDetailPDFReportProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const periodText =
    period.startDate && period.endDate
      ? `${formatDate(period.startDate)} - ${formatDate(period.endDate)}`
      : 'Período não especificado';

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório do Médico</Text>
          <Text style={styles.subtitle}>
            Sistema de Gestão - Saúde Rio Doce
          </Text>
          <Text style={styles.doctorInfo}>
            {doctor.name} - {doctor.crm || 'CRM não informado'}
          </Text>
          <Text style={styles.periodInfo}>Período: {periodText}</Text>
          <Text style={styles.periodInfo}>
            Gerado em:{' '}
            {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
        </View>

        {/* Métricas Principais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas do Período</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Faturamento Total</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(metrics.totalRevenue)}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total de Atendimentos</Text>
              <Text style={styles.metricValue}>{metrics.totalAppointments}</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Ticket Médio</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(metrics.averageTicket)}
              </Text>
            </View>
          </View>
        </View>

        {/* Informações do Médico */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Médico</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Nome Completo</Text>
              <Text style={styles.infoValue}>{doctor.name}</Text>
            </View>

            {doctor.crm && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>CRM</Text>
                <Text style={styles.infoValue}>{doctor.crm}</Text>
              </View>
            )}
          </View>

          {doctor.specialties.length > 0 && (
            <View>
              <Text style={styles.infoLabel}>Especialidades</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
                {doctor.specialties.map((specialty) => (
                  <View key={specialty.id} style={styles.specialtyBadge}>
                    <Text style={styles.specialtyText}>{specialty.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Procedimentos Mais Realizados */}
        {proceduresByRevenue.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Top 5 Procedimentos por Faturamento
            </Text>
            {proceduresByRevenue.slice(0, 5).map((procedure, index) => (
              <View key={index} style={styles.procedureItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={styles.procedureRank}>
                    <Text style={styles.procedureRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.procedureInfo}>
                    <Text style={styles.procedureName}>{procedure.name}</Text>
                    <Text style={styles.procedureCount}>
                      {procedure.count} atendimento{procedure.count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <Text style={styles.procedureRevenue}>
                  {formatCurrency(procedure.revenue)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tabela de Atendimentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Lista de Atendimentos ({appointments.length})
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>
                Data
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col2]}>
                Horário
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                Paciente
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                Convênio
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col5]}>
                Procedimentos
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col6]}>
                Valor Exame
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col7]}>
                Valor Pago
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col8]}>
                Status
              </Text>
            </View>

            {appointments.map((appointment, index) => (
              <View
                key={appointment.id}
                style={[
                  styles.tableRow,
                  ...(index % 2 === 0 ? [styles.tableRowEven] : []),
                ]}
              >
                <Text style={[styles.tableCell, styles.col1]}>
                  {formatDate(appointment.appointmentDate)}
                </Text>
                <Text style={[styles.tableCell, styles.col2]}>
                  {appointment.appointmentTime || '-'}
                </Text>
                <Text style={[styles.tableCell, styles.col3]}>
                  {appointment.patient?.fullName || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.col4]}>
                  {appointment.insuranceName || 'Particular'}
                </Text>
                <Text style={[styles.tableCell, styles.col5]}>
                  {appointment.procedures.map((p) => p.name).join(', ') || '-'}
                </Text>
                <Text style={[styles.tableCell, styles.col6]}>
                  {appointment.examValue
                    ? formatCurrency(appointment.examValue)
                    : '-'}
                </Text>
                <Text style={[styles.tableCell, styles.col7]}>
                  {appointment.paidValue
                    ? formatCurrency(appointment.paidValue)
                    : '-'}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.col8,
                    appointment.paymentDone
                      ? styles.statusPaid
                      : styles.statusPending,
                  ]}
                >
                  {appointment.paymentDone ? 'Pago' : 'Pendente'}
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
