import { prisma } from '../lib/prisma';

/**
 * Interface para a resposta da API de atendimentos
 */
interface AppointmentAPIResponse {
  rows: {
    hii_cod_atendimento: string;
    cod_atendimento: string;
    hid_status: string;
    status: string;
    status_obs: string;
    txt_usuario_responsavel: string;
    paciente: string;
    medico: string;
    dat_atendimento: string;
    hora_atendimento: string;
    dat_criacao: string;
    convenio: string;
    botoes_acoes: string;
    cod_pag_medico_reg: string | null;
    vlr_exames: string;
    fnd_vlr_exames: string;
    vlr_pago: string;
    fnd_vlr_pago: string;
    exames: string;
    pagamentos_realizados: string;
    obs_pagto: string;
    statusAtend: string;
  }[];
  total?: number;
  page?: number;
}

/**
 * Configuração da API
 */
const API_CONFIG = {
  url: 'https://ww3.s2web.com.br/lp_riodoce/modules/atendimentos/atendimentos_visualizacao.php',
  headers: {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://ww3.s2web.com.br',
    'Referer': 'https://ww3.s2web.com.br/lp_riodoce/index.php?m=atendimentos&a=index',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'Cookie': 'dotproject=hllhp910t3ar325ms9m3tq7el6; PHPSESSID=kd2rmta1sup8elfvpcsr04nrq4',
  },
  sourceSystem: 's2web',
  rowsPerPage: 300,
};

/**
 * Cache de médicos, pacientes e usuários
 */
let doctorsCache: Map<string, string> | null = null;
let patientsCache: Map<string, string> | null = null;
let usersCache: Map<string, string> | null = null;

/**
 * Carrega todos os médicos em cache
 */
async function loadDoctorsCache(): Promise<Map<string, string>> {
  if (doctorsCache) {
    return doctorsCache;
  }

  console.log('👨‍⚕️ Carregando médicos em cache...');
  
  const doctors = await prisma.doctor.findMany({
    where: {
      sourceSystem: API_CONFIG.sourceSystem,
    },
    select: {
      id: true,
      name: true,
    },
  });

  doctorsCache = new Map(
    doctors.map((d) => [d.name.toUpperCase(), d.id])
  );

  console.log(`   ✓ ${doctorsCache.size} médicos carregados\n`);
  
  return doctorsCache;
}

/**
 * Carrega todos os pacientes em cache
 */
async function loadPatientsCache(): Promise<Map<string, string>> {
  if (patientsCache) {
    return patientsCache;
  }

  console.log('🏥 Carregando pacientes em cache...');
  
  const patients = await prisma.patient.findMany({
    where: {
      sourceSystem: API_CONFIG.sourceSystem,
    },
    select: {
      id: true,
      fullName: true,
    },
  });

  patientsCache = new Map(
    patients.map((p) => [p.fullName.toUpperCase(), p.id])
  );

  console.log(`   ✓ ${patientsCache.size} pacientes carregados\n`);
  
  return patientsCache;
}

/**
 * Carrega todos os usuários em cache
 */
async function loadUsersCache(): Promise<Map<string, string>> {
  if (usersCache) {
    return usersCache;
  }

  console.log('👤 Carregando usuários em cache...');
  
  const users = await prisma.user.findMany({
    where: {
      active: true,
    },
    select: {
      id: true,
      name: true,
    },
  });

  usersCache = new Map(
    users.map((u) => [normalizeString(u.name || ''), u.id])
  );

  console.log(`   ✓ ${usersCache.size} usuários carregados\n`);
  
  return usersCache;
}

/**
 * Normaliza string para comparação flexível (remove acentos, espaços extras, converte para uppercase)
 */
function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim()
    .toUpperCase();
}

/**
 * Busca usuário responsável por nome (busca flexível com normalização)
 */
function findResponsibleUser(responsibleName: string, usersCache: Map<string, string>): string | null {
  if (!responsibleName || responsibleName.trim() === '') {
    return null;
  }

  const normalizedSearch = normalizeString(responsibleName);
  
  // Tentativa 1: Match exato
  if (usersCache.has(normalizedSearch)) {
    return usersCache.get(normalizedSearch) || null;
  }

  // Tentativa 2: Match parcial (nome do usuário contém o texto buscado)
  for (const [userName, userId] of usersCache.entries()) {
    if (userName.includes(normalizedSearch) || normalizedSearch.includes(userName)) {
      return userId;
    }
  }

  return null;
}

/**
 * Converte data BR (dd/mm/yyyy) para Date object válido
 */
function parseBRDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;
  
  const [day, month, year] = parts;
  
  const parsedDay = parseInt(day, 10);
  const parsedMonth = parseInt(month, 10);
  const parsedYear = parseInt(year, 10);
  
  // Validar se são números válidos
  if (isNaN(parsedDay) || isNaN(parsedMonth) || isNaN(parsedYear)) {
    return null;
  }
  
  // Validar ranges básicos
  if (parsedDay < 1 || parsedDay > 31 || parsedMonth < 1 || parsedMonth > 12 || parsedYear < 1900) {
    return null;
  }
  
  // Criar data usando o construtor com parâmetros (month é 0-indexed)
  const date = new Date(parsedYear, parsedMonth - 1, parsedDay, 0, 0, 0, 0);
  
  // Validar se a data criada corresponde aos valores fornecidos
  // Isso evita datas inválidas como 31/02/2024
  if (
    date.getFullYear() !== parsedYear ||
    date.getMonth() !== parsedMonth - 1 ||
    date.getDate() !== parsedDay
  ) {
    return null;
  }
  
  return date;
}

/**
 * Converte valor que sempre vem em centavos para decimal
 * A API sempre retorna valores em centavos (sem separadores decimais)
 * Exemplos: "11500" -> 115.00 | "13500" -> 135.00 | "113550" -> 1135.50
 */
function parseDecimal(value: string): number | null {
  if (!value || value === '0' || value === '0,00' || value === '0.00') {
    return null;
  }
  
  // Remove qualquer ponto ou vírgula que possa existir
  const cleanValue = value.replace(/[.,]/g, '');
  
  // Converte para número inteiro e divide por 100 (centavos -> reais)
  const parsed = parseInt(cleanValue, 10);
  
  return isNaN(parsed) ? null : parsed / 100;
}

/**
 * Extrai o status do HTML retornado pela API
 * Exemplo: "<span class=\"btn btn-info btn-sm\"><strong>PRÉ-PAGO</strong></span>" -> "PRÉ-PAGO"
 */
function extractStatus(statusHtml: string): string | null {
  if (!statusHtml || statusHtml.trim() === '') {
    return null;
  }
  
  // Regex para extrair o texto entre as tags <strong> ou qualquer texto visível
  const strongMatch = statusHtml.match(/<strong>(.*?)<\/strong>/i);
  if (strongMatch && strongMatch[1]) {
    return strongMatch[1].trim();
  }
  
  // Fallback: remover todas as tags HTML e pegar o texto
  const textOnly = statusHtml.replace(/<[^>]*>/g, '').trim();
  return textOnly || null;
}

/**
 * Busca atendimentos de uma página específica da API
 */
async function fetchAppointmentsPage(page: number, startDate: string, endDate: string): Promise<AppointmentAPIResponse | null> {
  const body = new URLSearchParams({
    cod_usuario: '164',
    token: '80d61f7e77bc15d9216b53dbe2769eea',
    medicos: '',
    convenios: '',
    nome_ou_num_atend: '',
    ini: startDate, // formato: dd/mm/yyyy
    ter: endDate,
    status: '',
    pendencia_financ: '',
    usuario: '',
    page: page.toString(),
    rows: API_CONFIG.rowsPerPage.toString(),
  });

  try {
    const response = await fetch(API_CONFIG.url, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }
    throw error;
  }
}

/**
 * Script principal de importação de atendimentos
 */
async function importAppointments() {
  console.log('🚀 Iniciando importação de atendimentos...\n');

  // IMPORTANTE: Defina o período de datas para importação
  const START_DATE = '01/01/2024'; // dd/mm/yyyy
  const END_DATE = '31/12/2026';   // dd/mm/yyyy
  
  console.log(`📅 Período: ${START_DATE} até ${END_DATE}\n`);

  let page = 1;
  let hasMore = true;
  let totalImported = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  let doctorsNotFound = new Set<string>();
  let patientsNotFound = new Set<string>();
  let usersNotFound = new Set<string>();
  let usersLinked = 0;

  try {
    // Carregar caches
    const doctorsCache = await loadDoctorsCache();
    const patientsCache = await loadPatientsCache();
    const usersCache = await loadUsersCache();

    while (hasMore) {
      console.log(`📄 Buscando página ${page}...`);

      const data = await fetchAppointmentsPage(page, START_DATE, END_DATE);

      if (!data || !data.rows || data.rows.length === 0) {
        console.log('✅ Não há mais páginas para processar.\n');
        hasMore = false;
        break;
      }

      console.log(`   ➡️  Encontrados ${data.rows.length} atendimentos nesta página`);

      // Processar todos os atendimentos em paralelo
      const results = await Promise.allSettled(
        data.rows.map(async (appointment) => {
          // Buscar médico, paciente e usuário responsável
          const doctorId = doctorsCache.get(appointment.medico.toUpperCase()) || null;
          const patientId = patientsCache.get(appointment.paciente.toUpperCase()) || null;
          const responsibleUserId = findResponsibleUser(appointment.txt_usuario_responsavel, usersCache);

          if (!doctorId) {
            doctorsNotFound.add(appointment.medico);
          }

          if (!patientId) {
            patientsNotFound.add(appointment.paciente);
          }

          if (!responsibleUserId && appointment.txt_usuario_responsavel) {
            usersNotFound.add(appointment.txt_usuario_responsavel);
          }

          // Converter datas e valores
          let appointmentDate = parseBRDate(appointment.dat_atendimento);
          const createdDate = parseBRDate(appointment.dat_criacao);
          let usedFallbackDate = false;
          
          // Se a data do atendimento for inválida, tentar usar a data de criação
          if (!appointmentDate) {
            appointmentDate = createdDate;
            usedFallbackDate = true;
          }

          // Se ambas as datas forem inválidas, pular este registro
          if (!appointmentDate) {
            return { 
              appointment, 
              skipped: true, 
              reason: `Ambas as datas inválidas - dat_atendimento: "${appointment.dat_atendimento}", dat_criacao: "${appointment.dat_criacao}"` 
            };
          }

          const examValue = parseDecimal(appointment.vlr_exames);
          const paidValue = parseDecimal(appointment.vlr_pago);
          const paymentDone = appointment.hid_status === 'F'; // F = Fechado
          const status = extractStatus(appointment.statusAtend);

          // Preparar dados para upsert
          const appointmentData = {
            appointmentDate,
            appointmentTime: appointment.hora_atendimento || null,
            createdDate,
            insuranceName: appointment.convenio || null,
            examValue,
            paidValue,
            paymentDone,
            status,
            examsRaw: appointment.exames || null,
            syncedAt: new Date(),
            rawPayload: appointment,
          };

          const result = await prisma.appointment.upsert({
            where: {
              externalId_sourceSystem: {
                externalId: appointment.hii_cod_atendimento,
                sourceSystem: API_CONFIG.sourceSystem,
              },
            },
            update: {
              ...appointmentData,
              ...(patientId && { patientId }),
              ...(doctorId && { doctorId }),
              ...(responsibleUserId && { responsibleUserId }),
            },
            create: {
              externalId: appointment.hii_cod_atendimento,
              sourceSystem: API_CONFIG.sourceSystem,
              ...appointmentData,
              ...(patientId && { patientId }),
              ...(doctorId && { doctorId }),
              ...(responsibleUserId && { responsibleUserId }),
            },
          });

          return { 
            appointment, 
            result, 
            skipped: false, 
            missingRelations: !doctorId || !patientId,
            hasResponsibleUser: !!responsibleUserId,
            usedFallbackDate
          };
        })
      );

      // Processar resultados
      let skipped = 0;
      let withMissingRelations = 0;
      let pageCreated = 0;
      let pageUpdated = 0;
      let usedFallback = 0;
      
      results.forEach((promiseResult) => {
        if (promiseResult.status === 'fulfilled') {
          const { appointment, skipped: wasSkipped, result, missingRelations, hasResponsibleUser, reason, usedFallbackDate } = promiseResult.value;
          
          if (wasSkipped) {
            skipped++;
            // Log de erro detalhado para atendimentos pulados
            console.error(`   ❌ ERRO - Atendimento pulado:`);
            console.error(`      ID: ${appointment.hii_cod_atendimento}`);
            console.error(`      Paciente: ${appointment.paciente}`);
            console.error(`      Motivo: ${reason}\n`);
            return;
          }

          if (result) {
            const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
            if (isNew) {
              totalImported++;
              pageCreated++;
            } else {
              totalUpdated++;
              pageUpdated++;
            }

            if (hasResponsibleUser) {
              usersLinked++;
            }

            if (usedFallbackDate) {
              usedFallback++;
              // Log de warning para data de fallback usada
              console.warn(`   ⚠️  ATENÇÃO - Usado dat_criacao como fallback:`);
              console.warn(`      ID: ${appointment.hii_cod_atendimento}`);
              console.warn(`      Paciente: ${appointment.paciente}`);
              console.warn(`      dat_atendimento inválida: "${appointment.dat_atendimento}"`);
              console.warn(`      dat_criacao usada: "${appointment.dat_criacao}"\n`);
            }

            if (missingRelations) {
              withMissingRelations++;
              // Log de warning para relacionamentos faltantes
              console.warn(`   ⚠️  ATENÇÃO - Atendimento sem relacionamento completo:`);
              console.warn(`      ID: ${appointment.hii_cod_atendimento}`);
              console.warn(`      Paciente: ${appointment.paciente} ${!patientsCache.has(appointment.paciente.toUpperCase()) ? '(NÃO ENCONTRADO)' : '(OK)'}`);
              console.warn(`      Médico: ${appointment.medico} ${!doctorsCache.has(appointment.medico.toUpperCase()) ? '(NÃO ENCONTRADO)' : '(OK)'}`);
              console.warn(`      Data: ${appointment.dat_atendimento}\n`);
            }
          }
        } else {
          totalErrors++;
          // Log de erro detalhado
          console.error(`   ❌ ERRO - Falha ao processar atendimento:`);
          console.error(`      Mensagem: ${promiseResult.reason?.message || promiseResult.reason}`);
          if (promiseResult.reason?.stack) {
            console.error(`      Stack: ${promiseResult.reason.stack}\n`);
          } else {
            console.error('');
          }
        }
      });

      // Resumo da página
      console.log(`   ✅ Processados: ${pageCreated} criados, ${pageUpdated} atualizados`);
      if (usedFallback > 0) {
        console.log(`   ⚠️  ${usedFallback} usaram dat_criacao como fallback (veja detalhes acima)`);
      }
      if (skipped > 0) {
        console.log(`   ⚠️  ${skipped} atendimento(s) pulado(s) (veja detalhes acima)`);
      }
      if (withMissingRelations > 0) {
        console.log(`   ⚠️  ${withMissingRelations} sem relacionamento completo (veja detalhes acima)`);
      }

      console.log('');
      page++;

      // Delay otimizado entre requisições (500ms → 100ms)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORTAÇÃO CONCLUÍDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Estatísticas:`);
    console.log(`   • Total de páginas processadas: ${page - 1}`);
    console.log(`   • Atendimentos criados: ${totalImported}`);
    console.log(`   • Atendimentos atualizados: ${totalUpdated}`);
    console.log(`   • Total processado: ${totalImported + totalUpdated}`);
    console.log(`   • Usuários responsáveis vinculados: ${usersLinked}`);
    if (totalErrors > 0) {
      console.log(`   • Erros: ${totalErrors}`);
    }

    // Seção de erros e problemas encontrados
    if (doctorsNotFound.size > 0 || patientsNotFound.size > 0 || usersNotFound.size > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  PROBLEMAS ENCONTRADOS - ATENÇÃO');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    if (doctorsNotFound.size > 0) {
      console.log(`\n❌ Médicos não encontrados (${doctorsNotFound.size}):`);
      console.log('   Estes médicos precisam ser importados primeiro:');
      Array.from(doctorsNotFound).forEach((name) => {
        console.log(`   • ${name}`);
      });
    }

    if (patientsNotFound.size > 0) {
      console.log(`\n❌ Pacientes não encontrados (${patientsNotFound.size}):`);
      console.log('   Estes pacientes precisam ser importados primeiro:');
      Array.from(patientsNotFound).forEach((name) => {
        console.log(`   • ${name}`);
      });
    }

    if (usersNotFound.size > 0) {
      console.log(`\n❌ Usuários responsáveis não encontrados (${usersNotFound.size}):`);
      console.log('   Estes usuários não foram encontrados no sistema:');
      Array.from(usersNotFound).forEach((name) => {
        console.log(`   • ${name}`);
      });
    }

    if (doctorsNotFound.size > 0 || patientsNotFound.size > 0 || usersNotFound.size > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Erro fatal durante a importação:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
importAppointments()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script finalizado com erro:', error);
    process.exit(1);
  });
