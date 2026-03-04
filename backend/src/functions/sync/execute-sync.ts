import { Request, Response } from 'express';
import { importSpecialties } from '@/scripts/import-specialties';
import { importDoctors } from '@/scripts/import-doctors';
import { importPatients } from '@/scripts/import-patients';
import { importProcedures } from '@/scripts/import-procedures';
import { importDoctorSpecialties } from '@/scripts/import-doctor-specialties';
import { importAppointments } from '@/scripts/import-appointments';
import { importAppointmentProcedures } from '@/scripts/import-appointment-procedures';

/**
 * Interface para resultado de execução
 */
interface ExecutionResult {
  scriptName: string;
  success: boolean;
  duration: number;
  error?: string;
  output?: string;
}

/**
 * Executa uma função de importação capturando o console.log
 */
async function executeImportFunction(
  importFunction: () => Promise<void>,
  scriptName: string
): Promise<ExecutionResult> {
  const startTime = Date.now();
  let output = '';
  let errorOutput = '';

  // Capturar console.log e console.error
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  try {
    // Redirecionar console.log
    console.log = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      output += message + '\n';
      originalLog(...args); // Manter log original também
    };

    // Redirecionar console.error
    console.error = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      errorOutput += message + '\n';
      originalError(...args); // Manter log original também
    };

    // Redirecionar console.warn
    console.warn = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      output += message + '\n';
      originalWarn(...args); // Manter log original também
    };

    // Executar a função
    await importFunction();

    const duration = Date.now() - startTime;

    return {
      scriptName,
      success: true,
      duration,
      output,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    return {
      scriptName,
      success: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
      output: errorOutput || output,
    };
  } finally {
    // Restaurar console original
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  }
}

/**
 * Formata duração em tempo legível
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Executa a sincronização completa de dados
 */
export async function executeSync(req: Request, res: Response) {
  const startTime = Date.now();
  const results: ExecutionResult[] = [];
  let hasErrors = false;

  try {
    console.log('🚀 Iniciando sincronização completa de dados...\n');

    // ============================================
    // FASE 1: Importações Base (Sequencial)
    // ============================================
    console.log('📋 FASE 1: Importações Base\n');

    const phase1Functions = [
      { fn: importSpecialties, name: 'import-specialties' },
      { fn: importDoctors, name: 'import-doctors' },
      { fn: importPatients, name: 'import-patients' },
      { fn: importProcedures, name: 'import-procedures' },
    ];

    // Executar sequencialmente para evitar problemas de conexão
    for (const { fn, name } of phase1Functions) {
      console.log(`\n━━━━ Executando: ${name} ━━━━\n`);
      const result = await executeImportFunction(fn, name);
      results.push(result);

      if (!result.success) {
        hasErrors = true;
        console.error(`\n❌ Erro em ${name}, abortando fases seguintes.\n`);
        throw new Error(`Erro na Fase 1: ${name}`);
      }

      console.log(`\n✅ ${name} concluído em ${formatDuration(result.duration)}\n`);
    }

    // ============================================
    // FASE 2: Relacionamento Médico-Especialidade
    // ============================================
    console.log('\n📋 FASE 2: Relacionamento Médico-Especialidade\n');
    console.log('\n━━━━ Executando: import-doctor-specialties ━━━━\n');
    
    const phase2Result = await executeImportFunction(importDoctorSpecialties, 'import-doctor-specialties');
    results.push(phase2Result);

    if (!phase2Result.success) {
      hasErrors = true;
      console.warn('\n⚠️  Erro na Fase 2, continuando com Fase 3...\n');
    } else {
      console.log(`\n✅ import-doctor-specialties concluído em ${formatDuration(phase2Result.duration)}\n`);
    }

    // ============================================
    // FASE 3: Atendimentos
    // ============================================
    console.log('\n📋 FASE 3: Atendimentos\n');
    console.log('\n━━━━ Executando: import-appointments ━━━━\n');
    
    // Quando executado via HTTP, importar apenas dados do ano atual (2026)
    const currentYear = new Date().getFullYear();
    const phase3Result = await executeImportFunction(
      () => importAppointments({ 
        startDate: `01/01/${currentYear}`,
        endDate: `31/12/${currentYear + 10}` // 10 anos à frente para garantir
      }), 
      'import-appointments'
    );
    results.push(phase3Result);

    if (!phase3Result.success) {
      hasErrors = true;
      console.warn('\n⚠️  Erro na Fase 3, continuando com Fase 4...\n');
    } else {
      console.log(`\n✅ import-appointments concluído em ${formatDuration(phase3Result.duration)}\n`);
    }

    // ============================================
    // FASE 4: Relacionamentos Appointment-Procedimentos
    // ============================================
    console.log('\n📋 FASE 4: Relacionamentos Appointment-Procedimentos\n');
    console.log('\n━━━━ Executando: import-appointment-procedures ━━━━\n');
    
    const phase4Result = await executeImportFunction(importAppointmentProcedures, 'import-appointment-procedures');
    results.push(phase4Result);

    if (!phase4Result.success) {
      hasErrors = true;
      console.warn('\n⚠️  Erro na Fase 4\n');
    } else {
      console.log(`\n✅ import-appointment-procedures concluído em ${formatDuration(phase4Result.duration)}\n`);
    }

    // ============================================
    // RESPOSTA
    // ============================================
    const totalDuration = Date.now() - startTime;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SINCRONIZAÇÃO COMPLETA FINALIZADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Tempo total: ${formatDuration(totalDuration)}`);
    console.log(`📊 Scripts executados: ${results.length}`);
    console.log(`✅ Sucessos: ${results.filter(r => r.success).length}`);
    console.log(`❌ Falhas: ${results.filter(r => !r.success).length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const response = {
      success: !hasErrors,
      message: hasErrors
        ? 'Sincronização concluída com erros'
        : 'Sincronização concluída com sucesso',
      statistics: {
        totalScripts: results.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        totalDuration: formatDuration(totalDuration),
        totalDurationMs: totalDuration,
      },
      scripts: results.map(result => ({
        name: result.scriptName,
        success: result.success,
        duration: formatDuration(result.duration),
        durationMs: result.duration,
        error: result.error,
      })),
    };

    return res.status(hasErrors ? 500 : 200).json(response);
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('💥 ERRO FATAL NA SINCRONIZAÇÃO');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`❌ ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return res.status(500).json({
      success: false,
      message: 'Erro fatal durante a sincronização',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      statistics: {
        totalScripts: results.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        totalDuration: formatDuration(totalDuration),
        totalDurationMs: totalDuration,
      },
      scripts: results.map(result => ({
        name: result.scriptName,
        success: result.success,
        duration: formatDuration(result.duration),
        durationMs: result.duration,
        error: result.error,
      })),
    });
  }
}
