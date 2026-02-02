import * as XLSX from 'xlsx';
import { expenseDAO } from '../DAO/expense';
import path from 'path';

/**
 * Interface para os dados de despesa da planilha
 */
interface ExpenseRowData {
  payment: string;
  value: number;
  date: Date;
  category: string;
}

/**
 * Caminho para o arquivo Excel
 */
const EXCEL_FILE_PATH = path.join(__dirname, 'expenses.xlsx');
const SHEET_NAME = 'BASE DE DADOS';

/**
 * Constantes para as colunas da planilha
 */
const COLUMNS = {
  PAYMENT: 'G',   // Coluna G - nome
  VALUE: 'H',     // Coluna H - valor em R$
  DATE: 'J',      // Coluna J - data
  CATEGORY: 'K',  // Coluna K - categoria
};

/**
 * Mapeamento para padronização de categorias
 * Todas as categorias serão convertidas para MAIÚSCULAS
 */
const CATEGORY_MAPPING: Record<string, string> = {
  // Médico
  'Médico': 'MÉDICO',
  'MÉDICO': 'MÉDICO',
  
  // Terceiros
  'Terceiros': 'TERCEIROS',
  
  // Marketing
  'Marketing': 'MARKETING',
  
  // Insumos
  'insumos': 'INSUMOS',
  'Suprimentos': 'INSUMOS',
  
  // Outros
  'OUTROS': 'OUTROS',
  'Outros': 'OUTROS',
  
  // Funcionário
  'Funcionário': 'FUNCIONÁRIO',
  'FUNCIONARIO': 'FUNCIONÁRIO',
  
  // Estorno
  'Estorno': 'ESTORNO',
  'ESTORNO': 'ESTORNO',
  
  // Troco
  'TROCO': 'TROCO',
  'Troco': 'TROCO',
  
  // Faxina
  'FAXINA': 'FAXINA',
  
  // Laboratório
  'Laboratorio': 'LABORATÓRIO',
  'LABORATORIO': 'LABORATÓRIO',
  
  // Contador
  'CONTADOR': 'CONTADOR',
  
  // Imposto
  'IMPOSTO': 'IMPOSTO',
  
  // Empréstimo
  'EMPRESTIMO': 'EMPRÉSTIMO',
  
  // Energia
  'ENERGIA': 'ENERGIA',
  
  // Internet
  'INTERNET': 'INTERNET',
  
  // Sistema (inclui Fast IA)
  'SISTEMA': 'SISTEMA',
  'FAST IA': 'SISTEMA',
  'FAST': 'SISTEMA',
  
  // Aluguel
  'Aluguel': 'ALUGUEL',
  'ALUGUEL': 'ALUGUEL',
  
  // Royalties
  'Royalties': 'ROYALTIES',
  'ROYALTIES': 'ROYALTIES',
  
  // Segurança (inclui vigilante)
  'SEGURANÇA': 'SEGURANÇA',
  'SEGURANCA': 'SEGURANÇA',
  'VIGILANTE': 'SEGURANÇA',
  
  // Consórcio
  'CONSORCIO': 'CONSÓRCIO',
  
  // Maquinário
  'MAQUINARIO': 'MAQUINÁRIO',
  'MÁQUINA': 'MAQUINÁRIO',
  
  // Seguro
  'SEGURO': 'SEGURO',
  
  // Consultoria
  'CONSULTORIA': 'CONSULTORIA',
  
  // Lixo
  'LIXO': 'LIXO',
  
  // Tarifa PIX
  'TARIFA PIX': 'TARIFA',
  
  // Casos específicos que vão para OUTROS
  'MISAEL': 'OUTROS',
  'BRASCON': 'OUTROS',
};

/**
 * Normaliza a categoria conforme o mapeamento
 */
function normalizeCategory(category: string): string {
  const trimmed = category.trim();
  
  // Se existe no mapeamento, usa o valor mapeado
  if (CATEGORY_MAPPING[trimmed]) {
    return CATEGORY_MAPPING[trimmed];
  }
  
  // Caso contrário, converte para maiúsculas
  return trimmed.toUpperCase();
}

/**
 * Lê e processa o arquivo Excel
 */
function readExpensesFromExcel(): ExpenseRowData[] {
  console.log('📖 Lendo arquivo Excel...');
  console.log(`   Caminho: ${EXCEL_FILE_PATH}`);
  
  // Ler o arquivo Excel
  const workbook = XLSX.readFile(EXCEL_FILE_PATH);
  
  // Verificar se a aba existe
  if (!workbook.SheetNames.includes(SHEET_NAME)) {
    throw new Error(`Aba "${SHEET_NAME}" não encontrada no arquivo Excel!`);
  }
  
  console.log(`   ✓ Aba "${SHEET_NAME}" encontrada`);
  
  // Obter a aba
  const worksheet = workbook.Sheets[SHEET_NAME];
  
  // Processar as linhas (começando da linha 4, índice 3)
  const expenses: ExpenseRowData[] = [];
  let rowIndex = 4; // Dados começam na linha 4
  let emptyRowsCount = 0;
  const MAX_EMPTY_ROWS = 10; // Parar após 10 linhas vazias consecutivas
  
  while (emptyRowsCount < MAX_EMPTY_ROWS) {
    // Construir os endereços das células
    const paymentCell = `${COLUMNS.PAYMENT}${rowIndex}`;
    const valueCell = `${COLUMNS.VALUE}${rowIndex}`;
    const dateCell = `${COLUMNS.DATE}${rowIndex}`;
    const categoryCell = `${COLUMNS.CATEGORY}${rowIndex}`;
    
    // Obter os valores das células
    const payment = worksheet[paymentCell]?.v;
    const value = worksheet[valueCell]?.v;
    const date = worksheet[dateCell]?.v;
    const category = worksheet[categoryCell]?.v;
    
    // Se a linha estiver completamente vazia, incrementar contador
    if (!payment && !value && !date && !category) {
      emptyRowsCount++;
      rowIndex++;
      continue;
    }
    
    // Resetar contador de linhas vazias
    emptyRowsCount = 0;
    
    // Validar se todos os campos essenciais estão presentes
    if (!payment || value === undefined || !date || !category) {
      console.log(`   ⚠️  Linha ${rowIndex} incompleta, pulando...`);
      rowIndex++;
      continue;
    }
    
    // Processar o valor (remover formatação se necessário)
    let numericValue: number;
    if (typeof value === 'string') {
      // Remover R$, espaços e trocar vírgula por ponto
      numericValue = parseFloat(value.replace(/[R$\s]/g, '').replace(',', '.'));
    } else {
      numericValue = value;
    }
    
    // Processar a data
    let parsedDate: Date;
    if (typeof date === 'number') {
      // Excel armazena datas como números (dias desde 1900-01-01)
      // Converte o número serial do Excel para data JavaScript
      const excelEpoch = new Date(1899, 11, 30); // 30 de dezembro de 1899
      parsedDate = new Date(excelEpoch.getTime() + date * 86400000);
    } else if (date instanceof Date) {
      parsedDate = date;
    } else if (typeof date === 'string') {
      // Tentar parsear a string
      parsedDate = new Date(date);
    } else {
      console.log(`   ⚠️  Linha ${rowIndex}: formato de data inválido, pulando...`);
      rowIndex++;
      continue;
    }
    
    // Adicionar à lista de despesas (com categoria normalizada)
    expenses.push({
      payment: payment.toString().trim(),
      value: numericValue,
      date: parsedDate,
      category: normalizeCategory(category.toString()),
    });
    
    rowIndex++;
  }
  
  console.log(`   ✓ Total de ${expenses.length} despesas encontradas\n`);
  
  return expenses;
}

/**
 * Script principal de importação de despesas
 */
async function importExpenses() {
  console.log('🚀 Iniciando importação de despesas...\n');
  
  let totalImported = 0;
  let totalErrors = 0;
  
  try {
    // Ler despesas da planilha
    const expenses = readExpensesFromExcel();
    
    if (expenses.length === 0) {
      console.log('⚠️  Nenhuma despesa encontrada na planilha.');
      return;
    }
    
    console.log('💾 Importando despesas para o banco de dados...\n');
    
    // Processar cada despesa individualmente
    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];
      const rowNumber = i + 4; // Número da linha na planilha (começa em 4)
      
      try {
        await expenseDAO.createOne({
          payment: expense.payment,
          value: expense.value,
          date: expense.date,
          category: expense.category,
        });
        
        totalImported++;
        console.log(`   ✓ [${totalImported}/${expenses.length}] ${expense.payment} - R$ ${expense.value.toFixed(2)} (${expense.category})`);
      } catch (error) {
        totalErrors++;
        console.error(`   ✗ Erro ao importar linha ${rowNumber} (${expense.payment}):`, error instanceof Error ? error.message : error);
      }
    }
    
    // Resumo final
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORTAÇÃO CONCLUÍDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Estatísticas:`);
    console.log(`   • Total de despesas na planilha: ${expenses.length}`);
    console.log(`   • Despesas importadas com sucesso: ${totalImported}`);
    if (totalErrors > 0) {
      console.log(`   • Erros: ${totalErrors}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Erro fatal durante a importação:', error);
    throw error;
  }
}

// Executar o script
importExpenses()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script finalizado com erro:', error);
    process.exit(1);
  });
