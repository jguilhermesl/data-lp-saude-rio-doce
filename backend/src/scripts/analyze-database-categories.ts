import { prisma } from '../lib/prisma';

/**
 * Interface para contagem de categorias
 */
interface CategoryCount {
  category: string;
  count: number;
}

/**
 * Analisa as categorias que estão no banco de dados
 */
async function analyzeDatabaseCategories() {
  console.log('🚀 Iniciando análise de categorias do banco de dados...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    // Buscar todas as despesas agrupadas por categoria
    const categoryGroups = await prisma.expense.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    });
    
    if (categoryGroups.length === 0) {
      console.log('⚠️  Nenhuma categoria encontrada no banco de dados.\n');
      return;
    }
    
    // Converter para formato de exibição
    const sortedCategories: CategoryCount[] = categoryGroups.map(group => ({
      category: group.category,
      count: group._count.category,
    }));
    
    // Calcular total de registros
    const totalRecords = sortedCategories.reduce((sum, item) => sum + item.count, 0);
    
    // Mostrar resultados
    console.log('📊 CATEGORIAS NO BANCO DE DADOS:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    sortedCategories.forEach((item, index) => {
      const percentage = ((item.count / totalRecords) * 100).toFixed(1);
      console.log(`${(index + 1).toString().padStart(3)}. ${item.category.padEnd(30)} → ${item.count.toString().padStart(4)} registros (${percentage}%)`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ RESUMO DA ANÁLISE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   • Total de categorias únicas: ${categoryGroups.length}`);
    console.log(`   • Total de registros: ${totalRecords}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
analyzeDatabaseCategories()
  .then(() => {
    console.log('🎉 Análise concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Análise finalizada com erro:', error);
    process.exit(1);
  });
