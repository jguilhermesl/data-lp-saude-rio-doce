import { prisma } from '../lib/prisma';

/**
 * Interface para a resposta da API de especialidades do médico
 */
interface DoctorSpecialtyAPIResponse {
  rows: {
    hii_cod_med_especialidade: string;
    hii_id_medico: string;
    hii_id_especialidade: string;
    txt_especialidade: string;
    faixa_inicio: string;
    faixa_termino: string;
  }[];
  total?: number;
  page?: number;
}

/**
 * Configuração da API
 */
const API_CONFIG = {
  url: 'https://ww3.s2web.com.br/lp_riodoce/modules/medicos/especializacao_visualizacao.php',
  headers: {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://ww3.s2web.com.br',
    'Referer': 'https://ww3.s2web.com.br/lp_riodoce/index.php?m=medicos',
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
  rowsPerPage: 50,
  concurrencyLimit: 5, // Limite de requisições paralelas
};

/**
 * Cache de especialidades (externalId -> id)
 */
let specialtiesCache: Map<string, string> | null = null;

/**
 * Carrega todas as especialidades em cache
 */
async function loadSpecialtiesCache(): Promise<Map<string, string>> {
  if (specialtiesCache) {
    return specialtiesCache;
  }

  console.log('📥 Carregando especialidades em cache...');
  
  const specialties = await prisma.specialty.findMany({
    where: {
      sourceSystem: API_CONFIG.sourceSystem,
    },
    select: {
      id: true,
      externalId: true,
    },
  });

  specialtiesCache = new Map(
    specialties.map((s) => [s.externalId, s.id])
  );

  console.log(`   ✓ ${specialtiesCache.size} especialidades carregadas\n`);
  
  return specialtiesCache;
}

/**
 * Busca especialidades de um médico específico
 */
async function fetchDoctorSpecialties(
  doctorExternalId: string
): Promise<DoctorSpecialtyAPIResponse | null> {
  const body = new URLSearchParams({
    cod_usuario: '164',
    token: '449abd89ca62f8a9a71d6ef5741a0434',
    cod_medico: doctorExternalId,
    page: '1',
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
 * Processa um lote de médicos
 */
async function processDoctorsBatch(
  doctors: Array<{ id: string; externalId: string; name: string }>,
  specialtiesCache: Map<string, string>
): Promise<{
  totalRelationships: number;
  totalErrors: number;
  specialtiesNotFound: Set<string>;
}> {
  let totalRelationships = 0;
  let totalErrors = 0;
  const specialtiesNotFound = new Set<string>();

  const results = await Promise.allSettled(
    doctors.map(async (doctor) => {
      const data = await fetchDoctorSpecialties(doctor.externalId);

      if (!data || !data.rows || data.rows.length === 0) {
        return { doctor, relationships: 0 };
      }

      // Processar especialidades do médico
      const relationshipResults = await Promise.allSettled(
        data.rows.map(async (specialty) => {
          const specialtyId = specialtiesCache.get(specialty.hii_id_especialidade);

          if (!specialtyId) {
            specialtiesNotFound.add(
              `${specialty.txt_especialidade} (ID: ${specialty.hii_id_especialidade})`
            );
            return null;
          }

          // Criar relacionamento (upsert para evitar duplicatas)
          await prisma.doctorSpecialty.upsert({
            where: {
              doctorId_specialtyId: {
                doctorId: doctor.id,
                specialtyId: specialtyId,
              },
            },
            update: {},
            create: {
              doctorId: doctor.id,
              specialtyId: specialtyId,
            },
          });

          return specialty.txt_especialidade;
        })
      );

      const successfulRelationships = relationshipResults.filter(
        (r) => r.status === 'fulfilled' && r.value !== null
      ).length;

      return { doctor, relationships: successfulRelationships };
    })
  );

  // Processar resultados
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { doctor, relationships } = result.value;
      totalRelationships += relationships;
      if (relationships > 0) {
        console.log(`   ✓ ${doctor.name}: ${relationships} especialidade(s)`);
      } else {
        console.log(`   ○ ${doctor.name}: sem especialidades`);
      }
    } else {
      totalErrors++;
      console.error(`   ✗ Erro ao processar médico:`, result.reason);
    }
  });

  return { totalRelationships, totalErrors, specialtiesNotFound };
}

/**
 * Divide array em lotes
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Script principal
 */
export async function importDoctorSpecialties() {
  console.log('🚀 Iniciando importação de especialidades dos médicos...\n');

  let totalRelationships = 0;
  let totalErrors = 0;
  const specialtiesNotFound = new Set<string>();

  try {
    // Carregar cache de especialidades
    const specialtiesCache = await loadSpecialtiesCache();

    // Buscar todos os médicos do banco
    console.log('👨‍⚕️ Buscando médicos do banco de dados...');
    const doctors = await prisma.doctor.findMany({
      where: {
        sourceSystem: API_CONFIG.sourceSystem,
      },
      select: {
        id: true,
        externalId: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`   ✓ ${doctors.length} médicos encontrados\n`);

    if (doctors.length === 0) {
      console.log('⚠️  Nenhum médico encontrado no banco de dados.');
      console.log('💡 Execute primeiro: npm run import:doctors\n');
      return;
    }

    // Dividir médicos em lotes para processar em paralelo (com limite)
    const batches = chunkArray(doctors, API_CONFIG.concurrencyLimit);

    console.log(`📦 Processando ${batches.length} lote(s) de ${API_CONFIG.concurrencyLimit} médicos...\n`);

    for (let i = 0; i < batches.length; i++) {
      console.log(`📄 Lote ${i + 1}/${batches.length}...`);

      const result = await processDoctorsBatch(batches[i], specialtiesCache);

      totalRelationships += result.totalRelationships;
      totalErrors += result.totalErrors;
      result.specialtiesNotFound.forEach((s) => specialtiesNotFound.add(s));

      console.log(''); // Linha em branco

      // Delay entre lotes
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORTAÇÃO CONCLUÍDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Estatísticas:`);
    console.log(`   • Total de médicos processados: ${doctors.length}`);
    console.log(`   • Relacionamentos criados: ${totalRelationships}`);
    if (totalErrors > 0) {
      console.log(`   • Erros: ${totalErrors}`);
    }

    if (specialtiesNotFound.size > 0) {
      console.log(`\n⚠️  Especialidades não encontradas no banco (${specialtiesNotFound.size}):`);
      specialtiesNotFound.forEach((name) => {
        console.log(`   • ${name}`);
      });
      console.log('\n💡 Dica: Execute primeiro o script de importação de especialidades:');
      console.log('   npm run import:specialties');
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
  importDoctorSpecialties()
    .then(() => {
      console.log('🎉 Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script finalizado com erro:', error);
      process.exit(1);
    });
}
