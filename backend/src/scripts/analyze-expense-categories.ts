import * as XLSX from 'xlsx';
import path from 'path';

/**
 * Caminho para o arquivo Excel
 */
const EXCEL_FILE_PATH = path.join(__dirname, 'LP SAUDE - ATUALIZADO.xlsx');
const SHEET_NAME = 'BASE DE DADOS';

/**
 * Constantes para as colunas da planilha
 */
const COLUMNS = {
  PAYMENT: 'G',   // Coluna G - nome
  VALUE: 'H',     // Coluna H - valor em R$
  MONTH: 'I',     // Coluna I - mês
  DATE: 'J',      // Coluna J - data
  CATEGORY: 'K',  // Coluna K - categoria
};

/**
 * Interface para contagem de categorias
 */
interface CategoryCount {
  category: string;
  count: number;
}

/**
 * Analisa as categorias da planilha
 */
function analyzeCategoriesFromExcel(): Map<string, number> {
  console.log('📖 Lendo arquivo Excel...');
  console.log(`   Caminho: ${EXCEL_FILE_PATH}\n`);
  
  // Ler o arquivo Excel
  const workbook = XLSX.readFile(EXCEL_FILE_PATH);
  
  // Verificar se a aba existe
  if (!workbook.SheetNames.includes(SHEET_NAME)) {
    throw new Error(`Aba "${SHEET_NAME}" não encontrada no arquivo Excel!`);
  }
  
  console.log(`   ✓ Aba "${SHEET_NAME}" encontrada\n`);
  
  // Obter a aba
  const worksheet = workbook.Sheets[SHEET_NAME];
  
  // Map para contar categorias
  const categoryCounts = new Map<string, number>();
  
  // Processar as linhas (começando da linha 4)
  let rowIndex = 4;
  let emptyRowsCount = 0;
  const MAX_EMPTY_ROWS = 10;
  let totalRows = 0;
  
  console.log('🔍 Analisando categorias...\n');
  
  while (emptyRowsCount < MAX_EMPTY_ROWS) {
    const categoryCell = `${COLUMNS.CATEGORY}${rowIndex}`;
    const category = worksheet[categoryCell]?.v;
    
    // Verificar se a linha tem dados
    const paymentCell = `${COLUMNS.PAYMENT}${rowIndex}`;
    const payment = worksheet[paymentCell]?.v;
    
    if (!payment && !category) {
      emptyRowsCount++;
      rowIndex++;
      continue;
    }
    
    emptyRowsCount = 0;
    
    if (category) {
      const categoryStr = category.toString().trim();
      const currentCount = categoryCounts.get(categoryStr) || 0;
      categoryCounts.set(categoryStr, currentCount + 1);
      totalRows++;
    }
    
    rowIndex++;
  }
  
  console.log(`   ✓ Total de ${totalRows} registros analisados\n`);
  
  return categoryCounts;
}

/**
 * Script principal
 */
async function analyzeCategories() {
  console.log('🚀 Iniciando análise de categorias...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const categoryCounts = analyzeCategoriesFromExcel();
    
    if (categoryCounts.size === 0) {
      console.log('⚠️  Nenhuma categoria encontrada na planilha.\n');
      return;
    }
    
    // Converter Map para array e ordenar por contagem (decrescente)
    const sortedCategories: CategoryCount[] = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
    
    // Calcular total de registros
    const totalRecords = sortedCategories.reduce((sum, item) => sum + item.count, 0);
    
    // Mostrar resultados
    console.log('📊 CATEGORIAS ENCONTRADAS:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    sortedCategories.forEach((item, index) => {
      const percentage = ((item.count / totalRecords) * 100).toFixed(1);
      console.log(`${(index + 1).toString().padStart(3)}. ${item.category.padEnd(30)} → ${item.count.toString().padStart(4)} registros (${percentage}%)`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ RESUMO DA ANÁLISE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   • Total de categorias únicas: ${categoryCounts.size}`);
    console.log(`   • Total de registros: ${totalRecords}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
    throw error;
  }
}

// Executar o script
analyzeCategories()
  .then(() => {
    console.log('🎉 Análise concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Análise finalizada com erro:', error);
    process.exit(1);
  });
