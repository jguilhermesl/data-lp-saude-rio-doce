import { Request, Response } from 'express';
import { spawn } from 'child_process';
import { join } from 'path';

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
 * Executa um script de importação
 */
function executeImportScript(scriptPath: string, scriptName: string): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const child = spawn('tsx', [scriptPath], {
      cwd: join(__dirname, '../..'),
      stdio: 'pipe',
    });

    let output = '';
    let errorOutput = '';

    // Capturar stdout
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
    });

    // Capturar stderr
    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
    });

    // Quando o processo terminar
    child.on('close', (code) => {
      const duration = Date.now() - startTime;

      if (code === 0) {
        resolve({
          scriptName,
          success: true,
          duration,
          output,
        });
      } else {
        resolve({
          scriptName,
          success: false,
          duration,
          error: errorOutput || `Exit code: ${code}`,
          output,
        });
      }
    });
  });
}

/**
 * Executa um único script
 */
async function executeSequential(script: { path: string; name: string }): Promise<ExecutionResult> {
  return executeImportScript(script.path, script.name);
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
    // ============================================
    // FASE 1: Importações Base (Sequencial)
    // ============================================
    const phase1Scripts = [
      { path: 'src/scripts/import-specialties.ts', name: 'import-specialties' },
      { path: 'src/scripts/import-doctors.ts', name: 'import-doctors' },
      { path: 'src/scripts/import-patients.ts', name: 'import-patients' },
      { path: 'src/scripts/import-procedures.ts', name: 'import-procedures' },
    ];

    // Executar sequencialmente para evitar problemas de conexão
    for (const script of phase1Scripts) {
      const result = await executeSequential(script);
      results.push(result);
      
      if (!result.success) {
        hasErrors = true;
        break; // Abortar fases seguintes se houver erro
      }
    }

    // ============================================
    // FASE 2: Relacionamento Médico-Especialidade
    // ============================================
    if (!hasErrors) {
      const phase2Result = await executeSequential({
        path: 'src/scripts/import-doctor-specialties.ts',
        name: 'import-doctor-specialties',
      });
      results.push(phase2Result);

      if (!phase2Result.success) {
        hasErrors = true;
      }
    }

    // ============================================
    // FASE 3: Atendimentos
    // ============================================
    if (!hasErrors) {
      const phase3Result = await executeSequential({
        path: 'src/scripts/import-appointments.ts',
        name: 'import-appointments',
      });
      results.push(phase3Result);

      if (!phase3Result.success) {
        hasErrors = true;
      }
    }

    // ============================================
    // FASE 4: Relacionamentos Appointment-Procedimentos
    // ============================================
    if (!hasErrors) {
      const phase4Result = await executeSequential({
        path: 'src/scripts/import-appointment-procedures.ts',
        name: 'import-appointment-procedures',
      });
      results.push(phase4Result);

      if (!phase4Result.success) {
        hasErrors = true;
      }
    }

    // ============================================
    // RESPOSTA
    // ============================================
    const totalDuration = Date.now() - startTime;
    
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
