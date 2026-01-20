import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { FinancialMetricsResponse } from '@/services/api/financial';
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
    gap: 15,
    marginBottom: 15,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  metricCardBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  metricCardOrange: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  metricCardGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  metricCardRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 6,
  },
  metricLabelBlue: {
    color: '#1e40af',
  },
  metricLabelOrange: {
    color: '#9a3412',
  },
  metricLabelGreen: {
    color: '#166534',
  },
  metricLabelRed: {
    color: '#991b1b',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  metricValueBlue: {
    color: '#1e3a8a',
  },
  metricValueOrange: {
    color: '#7c2d12',
  },
  metricValueGreen: {
    color: '#14532d',
  },
  metricValueRed: {
    color: '#7f1d1d',
  },
  metricDescription: {
    fontSize: 7,
    color: '#64748b',
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
  col1: { width: '20%' },
  col2: { width: '40%' },
  col3: { width: '20%' },
  col4: { width: '20%' },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#e2e8f0',
  },
  rankingItemEven: {
    backgroundColor: '#f8fafc',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankingPosition: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingPositionText: {
    fontSize: 8,
    fontWeight: 700,
    color: '#1e40af',
  },
  rankingCategory: {
    fontSize: 9,
    fontWeight: 600,
    color: '#1e293b',
  },
  rankingRight: {
    alignItems: 'flex-end',
  },
  rankingValue: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1e293b',
  },
  rankingPercentage: {
    fontSize: 7,
    color: '#64748b',
  },
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

interface FinancialPDFReportProps {
  data: FinancialMetricsResponse;
  dateRange: { from?: Date; to?: Date };
  category?: string;
  search?: string;
}

export const FinancialPDFReport = ({
  data,
  dateRange,
  category,
  search,
}: FinancialPDFReportProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const periodText = dateRange.from && dateRange.to
    ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    : 'Período não especificado';

  const isProfit = data.summary.totalProfit >= 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório Financeiro</Text>
          <Text style={styles.subtitle}>
            Sistema de Gestão - Saúde Rio Doce
          </Text>
          <Text style={styles.periodInfo}>Período: {periodText}</Text>
          {category && (
            <Text style={styles.periodInfo}>Categoria: {category}</Text>
          )}
          {search && (
            <Text style={styles.periodInfo}>Filtro aplicado: {search}</Text>
          )}
          <Text style={styles.periodInfo}>
            Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
        </View>

        {/* Métricas Principais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricCardBlue]}>
              <Text style={[styles.metricLabel, styles.metricLabelBlue]}>
                Faturamento Total
              </Text>
              <Text style={[styles.metricValue, styles.metricValueBlue]}>
                {formatCurrency(data.summary.totalRevenue)}
              </Text>
              <Text style={styles.metricDescription}>
                Receita total do período
              </Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardOrange]}>
              <Text style={[styles.metricLabel, styles.metricLabelOrange]}>
                Despesas Totais
              </Text>
              <Text style={[styles.metricValue, styles.metricValueOrange]}>
                {formatCurrency(data.summary.totalExpenses)}
              </Text>
              <Text style={styles.metricDescription}>
                Gastos totais do período
              </Text>
            </View>

            <View style={[
              styles.metricCard,
              isProfit ? styles.metricCardGreen : styles.metricCardRed
            ]}>
              <Text style={[
                styles.metricLabel,
                isProfit ? styles.metricLabelGreen : styles.metricLabelRed
              ]}>
                Lucro Total
              </Text>
              <Text style={[
                styles.metricValue,
                isProfit ? styles.metricValueGreen : styles.metricValueRed
              ]}>
                {formatCurrency(data.summary.totalProfit)}
              </Text>
              <Text style={styles.metricDescription}>
                {isProfit ? 'Resultado positivo' : 'Resultado negativo'}
              </Text>
            </View>
          </View>
        </View>

        {/* Ranking de Categorias */}
        {data.categoryRanking.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Ranking de Despesas por Categoria (Top 10)
            </Text>
            {data.categoryRanking.slice(0, 10).map((item, index) => (
              <View
                key={item.category}
                style={[
                  styles.rankingItem,
                  ...(index % 2 === 0 ? [styles.rankingItemEven] : []),
                ]}
              >
                <View style={styles.rankingLeft}>
                  <View style={styles.rankingPosition}>
                    <Text style={styles.rankingPositionText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.rankingCategory}>{item.category}</Text>
                </View>
                <View style={styles.rankingRight}>
                  <Text style={styles.rankingValue}>
                    {formatCurrency(item.totalValue)}
                  </Text>
                  <Text style={styles.rankingPercentage}>
                    {item.percentage.toFixed(1)}% ({item.count} {item.count === 1 ? 'despesa' : 'despesas'})
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tabela de Despesas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Despesas Detalhadas ({data.expenses.length} despesas)
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>
                Data
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col2]}>
                Pagamento
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                Categoria
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                Valor
              </Text>
            </View>

            {data.expenses.map((expense, index) => (
              <View
                key={expense.id}
                style={[
                  styles.tableRow,
                  ...(index % 2 === 0 ? [styles.tableRowEven] : []),
                ]}
              >
                <Text style={[styles.tableCell, styles.col1]}>
                  {format(new Date(expense.date), 'dd/MM/yyyy')}
                </Text>
                <Text style={[styles.tableCell, styles.col2]}>
                  {expense.payment}
                </Text>
                <Text style={[styles.tableCell, styles.col3]}>
                  {expense.category}
                </Text>
                <Text style={[styles.tableCell, styles.col4]}>
                  {formatCurrency(expense.value)}
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
