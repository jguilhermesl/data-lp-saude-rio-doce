import { prisma } from '../lib/prisma';

/**
 * Configuração do script
 */
const SOURCE_SYSTEM = 's2web';

/**
 * Cache de procedimentos (nome -> id)
 */
let proceduresCache: Map<string, string> | null = null;

/**
 * Carrega todos os procedimentos em cache
 */
async function loadProceduresCache(): Promise<Map<string, string>> {
  if (proceduresCache) {
    return proceduresCache;
  }

  console.log('📥 Carregando procedimentos em cache...');
  
  const procedures = await prisma.procedure.findMany({
    where: {
      sourceSystem: SOURCE_SYSTEM,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  proceduresCache = new Map();
  
  // Adicionar por nome (normalizado)
  procedures.forEach((p) => {
    const normalizedName = p.name.trim().toUpperCase();
    proceduresCache!.set(normalizedName, p.id);
    
    // Adicionar também pela sigla/código se existir
    if (p.code) {
      const normalizedCode = p.code.trim().toUpperCase();
      proceduresCache!.set(normalizedCode, p.id);
    }
  });

  console.log(`   ✓ ${procedures.length} procedimentos carregados`);
  console.log(`   ✓ ${proceduresCache.size} entradas no cache (incluindo códigos)\n`);
  
  return proceduresCache;
}

/**
 * Busca procedimento pelo nome ou código
 */
function findProcedureByName(name: string, cache: Map<string, string>): string | null {
  const normalized = name.trim().toUpperCase();
  return cache.get(normalized) || null;
}

/**
 * Remove relacionamentos duplicados existentes
 */
async function cleanupDuplicates() {
  console.log('🧹 Verificando relacionamentos duplicados...');
  
  const duplicates = await prisma.$queryRaw<Array<{ appointmentId: string; procedureId: string; count: bigint }>>`
    SELECT "appointmentId", "procedureId", COUNT(*) as count
    FROM "appointment_procedures"
    GROUP BY "appointmentId", "procedureId"
    HAVING COUNT(*) > 1
  `;

  if (duplicates.length === 0) {
    console.log('   ✓ Nenhum relacionamento duplicado encontrado\n');
    return;
  }

  console.log(`   ⚠️  Encontrados ${duplicates.length} relacionamentos duplicados`);
  
  for (const dup of duplicates) {
    // Manter apenas o primeiro registro, deletar os demais
    const records = await prisma.appointmentProcedure.findMany({
      where: {
        appointmentId: dup.appointmentId,
        procedureId: dup.procedureId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Deletar todos exceto o primeiro
    for (let i = 1; i < records.length; i++) {
      await prisma.appointmentProcedure.delete({
        where: { id: records[i].id },
      });
    }
  }

  console.log(`   ✓ Duplicatas removidas\n`);
}

/**
 * Script principal de importação de relacionamentos appointment_procedures
 */
export async function importAppointmentProcedures() {
  console.log('🚀 Iniciando importação de relacionamentos appointment_procedures...\n');

  try {
    // Limpar duplicatas primeiro
    await cleanupDuplicates();

    // Carregar cache de procedimentos
    const proceduresCache = await loadProceduresCache();

    // Buscar todos os appointments com examsRaw não nulo
    console.log('📋 Buscando appointments com exames...');
    
    const appointments = await prisma.appointment.findMany({
      where: {
        examsRaw: {
          not: null,
        },
        sourceSystem: SOURCE_SYSTEM,
      },
      select: {
        id: true,
        externalId: true,
        examsRaw: true,
      },
    });

    console.log(`   ✓ ${appointments.length} appointments encontrados\n`);

    if (appointments.length === 0) {
      console.log('⚠️  Nenhum appointment com examsRaw encontrado.');
      return;
    }

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let proceduresNotFound = new Set<string>();

    console.log('🔄 Processando relacionamentos...\n');

    // Processar em lotes para melhor performance
    const BATCH_SIZE = 100;
    for (let i = 0; i < appointments.length; i += BATCH_SIZE) {
      const batch = appointments.slice(i, i + BATCH_SIZE);
      
      const results = await Promise.allSettled(
        batch.map(async (appointment) => {
          if (!appointment.examsRaw) {
            return { skipped: true, reason: 'examsRaw null' };
          }

          // Separar procedimentos por vírgula (pode haver múltiplos)
          const examNames = appointment.examsRaw
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);

          const results = {
            appointmentId: appointment.externalId,
            created: [] as string[],
            existing: [] as string[],
            notFound: [] as string[],
          };

          // Processar cada procedimento
          for (const examName of examNames) {
            const procedureId = findProcedureByName(examName, proceduresCache);

            if (!procedureId) {
              proceduresNotFound.add(examName);
              results.notFound.push(examName);
              continue;
            }

            // Verificar se o relacionamento já existe
            const existing = await prisma.appointmentProcedure.findUnique({
              where: {
                appointmentId_procedureId: {
                  appointmentId: appointment.id,
                  procedureId: procedureId,
                },
              },
            });

            if (existing) {
              results.existing.push(examName);
              continue;
            }

            // Criar o relacionamento
            try {
              await prisma.appointmentProcedure.create({
                data: {
                  appointmentId: appointment.id,
                  procedureId: procedureId,
                  quantity: 1,
                },
              });
              results.created.push(examName);
            } catch (error) {
              // Pode ocorrer erro de duplicata em caso de concorrência
              results.existing.push(examName);
            }
          }

          return results;
        })
      );

      // Processar resultados do lote
      results.forEach((promiseResult) => {
        if (promiseResult.status === 'fulfilled') {
          const value = promiseResult.value;
          
          if ('skipped' in value && value.skipped) {
            totalSkipped++;
            return;
          }

          // Processar resultados do appointment
          if ('created' in value) {
            // Contar e exibir procedimentos criados
            value.created.forEach((examName) => {
              totalCreated++;
              console.log(`   ✓ Appointment ${value.appointmentId}: ${examName}`);
            });

            // Contar e exibir procedimentos já existentes
            value.existing.forEach((examName) => {
              totalUpdated++;
              console.log(`   ↻ Appointment ${value.appointmentId}: ${examName} (já existe)`);
            });

            // Contar e exibir procedimentos não encontrados
            value.notFound.forEach((examName) => {
              totalSkipped++;
              console.log(`   ⚠️  Appointment ${value.appointmentId}: ${examName} - não encontrado`);
            });
          }
        } else {
          console.error(`   ✗ Erro:`, promiseResult.reason);
        }
      });

      console.log(`\n   Progresso: ${Math.min(i + BATCH_SIZE, appointments.length)}/${appointments.length}\n`);
    }

    // Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORTAÇÃO CONCLUÍDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Estatísticas:`);
    console.log(`   • Total de appointments processados: ${appointments.length}`);
    console.log(`   • Relacionamentos criados: ${totalCreated}`);
    console.log(`   • Relacionamentos já existentes: ${totalUpdated}`);
    console.log(`   • Pulados (procedimento não encontrado): ${totalSkipped}`);
    console.log(`   • Total processado: ${totalCreated + totalUpdated + totalSkipped}`);

    if (proceduresNotFound.size > 0) {
      console.log(`\n⚠️  Procedimentos não encontrados (${proceduresNotFound.size}):`);
      const sorted = Array.from(proceduresNotFound).sort();
      sorted.slice(0, 20).forEach((name) => {
        console.log(`   • ${name}`);
      });
      if (proceduresNotFound.size > 20) {
        console.log(`   ... e mais ${proceduresNotFound.size - 20}`);
      }
      console.log(`\n💡 Dica: Estes exames podem estar com nomes diferentes na tabela de procedimentos.`);
      console.log('   Verifique o cadastro de procedimentos ou adicione aliases/códigos.');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Erro fatal durante a importação:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script apenas se for chamado diretamente
if (require.main === module) {
  importAppointmentProcedures()
    .then(() => {
      console.log('🎉 Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script finalizado com erro:', error);
      process.exit(1);
    });
}
