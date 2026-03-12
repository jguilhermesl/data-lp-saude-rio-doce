import { Request, Response } from "express";
import { importSpecialties } from "@/scripts/import-specialties";
import { importDoctors } from "@/scripts/import-doctors";
import { importPatients } from "@/scripts/import-patients";
import { importProcedures } from "@/scripts/import-procedures";
import { importDoctorSpecialties } from "@/scripts/import-doctor-specialties";
import { importAppointments } from "@/scripts/import-appointments";
import { importAppointmentProcedures } from "@/scripts/import-appointment-procedures";
import {
  subMonths,
  startOfMonth,
  endOfYear,
  format as formatDate,
} from "date-fns";

interface ExecutionResult {
  scriptName: string;
  success: boolean;
  duration: number;
  error?: string;
  output?: string;
}

// Helper para formatar a data conforme o script espera (DD/MM/YYYY)
const formatDateSync = (date: Date) => formatDate(date, "dd/MM/yyyy");

/**
 * Lógica Central de Sincronização
 * Pode ser chamada tanto pelo Controller (Express) quanto pelo Script (CLI)
 */
export async function runSyncAllLogic() {
  const startTime = Date.now();
  const results: ExecutionResult[] = [];

  // Datas: Mês anterior até o fim do ano atual
  const now = new Date();
  const startDate = formatDateSync(startOfMonth(subMonths(now, 1)));
  const endDate = formatDateSync(endOfYear(now));

  console.log(` Período de sincronização: ${startDate} até ${endDate}\n`);

  // --- FASE 1: Importações Base (PARALELO para melhor performance) ---
  console.log(" FASE 1: Importações Base (Paralelo)\n");
  const phase1Functions = [
    { fn: importSpecialties, name: "import-specialties" },
    { fn: importDoctors, name: "import-doctors" },
    { fn: importPatients, name: "import-patients" },
    { fn: importProcedures, name: "import-procedures" },
  ];

  for (const p of phase1Functions) {
    console.log(`▶ Iniciando fase: ${p.name}`);
    const res = await executeImportFunction(p.fn, p.name);
    results.push(res);

    if (!res.success) {
      console.error(
        `❌ Falha crítica em ${p.name}. Interrompendo sincronização.`,
      );
      throw new Error(`Falha crítica na Fase 1 (${p.name}). Abortando.`);
    }
  }

  // --- FASE 2: Relacionamentos ---
  console.log("\n FASE 2: Relacionamentos Médico-Especialidade\n");
  results.push(
    await executeImportFunction(
      importDoctorSpecialties,
      "import-doctor-specialties",
    ),
  );

  // --- FASE 3: Atendimentos (Com as datas calculadas) ---
  console.log("\n FASE 3: Atendimentos\n");
  results.push(
    await executeImportFunction(
      () => importAppointments({ startDate, endDate }),
      "import-appointments",
    ),
  );

  // --- FASE 4: Vinculação de Procedimentos ---
  console.log("\n FASE 4: Vinculação Atendimento-Procedimento\n");
  results.push(
    await executeImportFunction(
      importAppointmentProcedures,
      "import-appointment-procedures",
    ),
  );

  return {
    results,
    totalDuration: Date.now() - startTime,
    hasErrors: results.some((r) => !r.success),
  };
}

/**
 * Controller para Rota HTTP (/sync/all)
 */
export async function executeSync(req: Request, res: Response) {
  try {
    const { results, totalDuration, hasErrors } = await runSyncAllLogic();

    return res.status(hasErrors ? 500 : 200).json({
      success: !hasErrors,
      duration: formatDuration(totalDuration),
      scripts: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro fatal no Sync All",
    });
  }
}

// --- Funções Auxiliares (Mantidas do seu código original) ---

async function executeImportFunction(
  importFunction: () => Promise<void>,
  scriptName: string,
): Promise<ExecutionResult> {
  const start = Date.now();
  try {
    await importFunction();
    return { scriptName, success: true, duration: Date.now() - start };
  } catch (err) {
    return {
      scriptName,
      success: false,
      duration: Date.now() - start,
      error: String(err),
    };
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return seconds > 60
    ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    : `${seconds}s`;
}
