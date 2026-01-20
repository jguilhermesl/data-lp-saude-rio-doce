import { expenseDAO } from '../DAO/expense';

/**
 * Script para limpar todas as despesas do banco de dados
 */
async function clearExpenses() {
  console.log('🗑️  Iniciando limpeza de despesas...\n');
  
  try {
    // Contar despesas antes de limpar
    const countBefore = await expenseDAO.count();
    console.log(`   📊 Total de despesas no banco: ${countBefore}\n`);
    
    if (countBefore === 0) {
      console.log('   ℹ️  Não há despesas para limpar.\n');
      return;
    }
    
    // Deletar todas as despesas
    console.log('   🧹 Removendo todas as despesas...\n');
    const result = await expenseDAO.deleteMany({});
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ LIMPEZA CONCLUÍDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   • Despesas removidas: ${result.count}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    throw error;
  }
}

// Executar o script
clearExpenses()
  .then(() => {
    console.log('🎉 Limpeza concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Limpeza finalizada com erro:', error);
    process.exit(1);
  });
