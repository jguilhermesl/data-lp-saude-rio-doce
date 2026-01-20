import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { patientDAO } from '@/DAO/patient';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 100)),
  search: z.string().optional(),
  minSpent: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxSpent: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  lastAppointmentStartDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  lastAppointmentEndDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

export const getPatientsMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate, page, limit, search, minSpent, maxSpent, lastAppointmentStartDate, lastAppointmentEndDate } = querySchema.parse(req.query);

    // Construir filtros para busca de pacientes
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
        { mobilePhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Buscar métricas em paralelo
    const [segmentation, patientsAtRisk, returnRateData] = await Promise.all([
      patientDAO.getPatientSegmentation(startDate, endDate),
      patientDAO.getPatientsAtRisk(3),
      patientDAO.getReturnRate(startDate, endDate),
    ]);

    // Calcular métricas de segmentação
    const totalPatients = segmentation.length;
    const recurringPatientsCount = segmentation.filter((p) => p.isRecurring).length;

    // Top 20 pacientes VIP baseados em total gasto (paidValue) em appointments no período
    const vipPatientsData = await prisma.$queryRaw<
      Array<{
        patientId: string;
        fullName: string;
        cpf: string | null;
        totalSpent: any;
        appointmentCount: any;
        lastAppointmentDate: Date | null;
      }>
    >`
      SELECT 
        p.id as "patientId",
        p."fullName",
        p.cpf,
        COALESCE(SUM(a."paidValue"), 0) as "totalSpent",
        COUNT(a.id) as "appointmentCount",
        MAX(a."appointmentDate") as "lastAppointmentDate"
      FROM patients p
      INNER JOIN appointments a ON a."patientId" = p.id
      WHERE a."appointmentDate" >= ${startDate}
        AND a."appointmentDate" <= ${endDate}
      GROUP BY p.id, p."fullName", p.cpf
      ORDER BY "totalSpent" DESC
      LIMIT 20
    `;

    const vipPatientsFormatted = vipPatientsData.map((vip) => ({
      patientId: vip.patientId,
      fullName: vip.fullName,
      cpf: vip.cpf,
      totalSpent: Number(vip.totalSpent || 0),
      appointmentCount: Number(vip.appointmentCount || 0),
      lastAppointmentDate: vip.lastAppointmentDate,
    }));

    // Pacientes em risco de churn
    const churnRate = returnRateData.totalPatients > 0 ? (patientsAtRisk.length / returnRateData.totalPatients) * 100 : 0;

    // Taxa de retorno
    const returnRate = returnRateData.returnRate;

    // Distribuição por faixa de LTV
    const ltvRanges = {
      low: segmentation.filter((p) => p.totalSpent < 500).length,
      medium: segmentation.filter((p) => p.totalSpent >= 500 && p.totalSpent < 2000).length,
      high: segmentation.filter((p) => p.totalSpent >= 2000).length,
    };

    // Buscar listagem de pacientes com métricas - com filtros aplicados
    let patientsWithMetrics;
    
    // Build query parts
    let baseSelect = `
      SELECT 
        p.id,
        p."fullName",
        p.cpf,
        p."mobilePhone",
        p."homePhone",
        COALESCE(SUM(a."paidValue"), 0) as "totalSpent",
        COUNT(a.id) as "appointmentCount",
        MAX(a."appointmentDate") as "lastAppointmentDate"
      FROM patients p
      LEFT JOIN appointments a ON a."patientId" = p.id
        AND a."appointmentDate" >= $1
        AND a."appointmentDate" <= $2
    `;
    
    const queryParams: any[] = [startDate, endDate];
    let paramIndex = 3;
    
    // Add WHERE clause for search
    if (search) {
      baseSelect += ` WHERE (p."fullName" ILIKE $${paramIndex} OR p.cpf ILIKE $${paramIndex} OR p."mobilePhone" ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    baseSelect += ` GROUP BY p.id, p."fullName", p.cpf, p."mobilePhone", p."homePhone"`;
    
    // Add HAVING clause for spent filters
    const havingConditions: string[] = [];
    if (minSpent !== undefined) {
      havingConditions.push(`COALESCE(SUM(a."paidValue"), 0) >= $${paramIndex}`);
      queryParams.push(minSpent);
      paramIndex++;
    }
    if (maxSpent !== undefined) {
      havingConditions.push(`COALESCE(SUM(a."paidValue"), 0) <= $${paramIndex}`);
      queryParams.push(maxSpent);
      paramIndex++;
    }
    if (havingConditions.length > 0) {
      baseSelect += ` HAVING ${havingConditions.join(' AND ')}`;
    }
    
    // Check if we need subquery for last appointment date filters
    if (lastAppointmentStartDate || lastAppointmentEndDate) {
      let subqueryWhere: string[] = [];
      
      if (lastAppointmentStartDate) {
        subqueryWhere.push(`subq."lastAppointmentDate" >= $${paramIndex}`);
        queryParams.push(lastAppointmentStartDate);
        paramIndex++;
      }
      
      if (lastAppointmentEndDate) {
        subqueryWhere.push(`subq."lastAppointmentDate" <= $${paramIndex}`);
        queryParams.push(lastAppointmentEndDate);
        paramIndex++;
      }
      
      const finalQuery = `
        SELECT * FROM (${baseSelect}) subq
        WHERE ${subqueryWhere.join(' AND ')}
        ORDER BY subq."lastAppointmentDate" DESC NULLS LAST
        LIMIT $${paramIndex}
        OFFSET $${paramIndex + 1}
      `;
      
      queryParams.push(limit, skip);
      
      patientsWithMetrics = await prisma.$queryRawUnsafe<Array<{
        id: string;
        fullName: string;
        cpf: string | null;
        mobilePhone: string | null;
        homePhone: string | null;
        totalSpent: any;
        appointmentCount: any;
        lastAppointmentDate: Date | null;
      }>>(finalQuery, ...queryParams);
    } else {
      const finalQuery = `
        ${baseSelect}
        ORDER BY "lastAppointmentDate" DESC NULLS LAST
        LIMIT $${paramIndex}
        OFFSET $${paramIndex + 1}
      `;
      
      queryParams.push(limit, skip);
      
      patientsWithMetrics = await prisma.$queryRawUnsafe<Array<{
        id: string;
        fullName: string;
        cpf: string | null;
        mobilePhone: string | null;
        homePhone: string | null;
        totalSpent: any;
        appointmentCount: any;
        lastAppointmentDate: Date | null;
      }>>(finalQuery, ...queryParams);
    }

    // Contar total de pacientes para paginação - aplicando os mesmos filtros
    let countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT 
          p.id
        FROM patients p
        LEFT JOIN appointments a ON a."patientId" = p.id
          AND a."appointmentDate" >= $1
          AND a."appointmentDate" <= $2
    `;
    
    const countParams: any[] = [startDate, endDate];
    let countParamIndex = 3;
    
    // Add WHERE clause for search
    if (search) {
      countQuery += ` WHERE (p."fullName" ILIKE $${countParamIndex} OR p.cpf ILIKE $${countParamIndex} OR p."mobilePhone" ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    
    countQuery += ` GROUP BY p.id`;
    
    // Add HAVING clause for spent filters
    const countHavingConditions: string[] = [];
    if (minSpent !== undefined) {
      countHavingConditions.push(`COALESCE(SUM(a."paidValue"), 0) >= $${countParamIndex}`);
      countParams.push(minSpent);
      countParamIndex++;
    }
    if (maxSpent !== undefined) {
      countHavingConditions.push(`COALESCE(SUM(a."paidValue"), 0) <= $${countParamIndex}`);
      countParams.push(maxSpent);
      countParamIndex++;
    }
    if (countHavingConditions.length > 0) {
      countQuery += ` HAVING ${countHavingConditions.join(' AND ')}`;
    }
    
    // If we have last appointment date filters, wrap in another subquery
    if (lastAppointmentStartDate || lastAppointmentEndDate) {
      let countSubqueryWhere: string[] = [];
      
      if (lastAppointmentStartDate) {
        countSubqueryWhere.push(`subq."lastAppointmentDate" >= $${countParamIndex}`);
        countParams.push(lastAppointmentStartDate);
        countParamIndex++;
      }
      
      if (lastAppointmentEndDate) {
        countSubqueryWhere.push(`subq."lastAppointmentDate" <= $${countParamIndex}`);
        countParams.push(lastAppointmentEndDate);
        countParamIndex++;
      }
      
      countQuery = `
        SELECT COUNT(*) as total FROM (
          SELECT subq.id FROM (
            SELECT 
              p.id,
              MAX(a."appointmentDate") as "lastAppointmentDate"
            FROM patients p
            LEFT JOIN appointments a ON a."patientId" = p.id
              AND a."appointmentDate" >= $1
              AND a."appointmentDate" <= $2
      `;
      
      if (search) {
        countQuery += ` WHERE (p."fullName" ILIKE $3 OR p.cpf ILIKE $3 OR p."mobilePhone" ILIKE $3)`;
      }
      
      countQuery += ` GROUP BY p.id`;
      
      if (countHavingConditions.length > 0) {
        countQuery += ` HAVING ${countHavingConditions.join(' AND ')}`;
      }
      
      countQuery += `) subq WHERE ${countSubqueryWhere.join(' AND ')}`;
    }
    
    countQuery += `) as filtered_patients`;
    
    const countResult = await prisma.$queryRawUnsafe<Array<{ total: bigint }>>(countQuery, ...countParams);
    const totalPatientsCount = Number(countResult[0]?.total || 0);

    // Formatar dados dos pacientes
    const patients = patientsWithMetrics.map((patient) => ({
      id: patient.id,
      fullName: patient.fullName,
      cpf: patient.cpf,
      phone: patient.mobilePhone || patient.homePhone,
      totalSpent: Number(patient.totalSpent || 0),
      appointmentCount: Number(patient.appointmentCount || 0),
      lastAppointmentDate: patient.lastAppointmentDate,
    }));

    // Calcular taxa de retorno baseada em TODOS os pacientes filtrados (não só da página)
    // Buscar appointmentCount de todos os pacientes filtrados
    let returnRateQuery = `
      SELECT COUNT(*) as total_with_return FROM (
        SELECT 
          p.id,
          COUNT(a.id) as "appointmentCount"
        FROM patients p
        LEFT JOIN appointments a ON a."patientId" = p.id
          AND a."appointmentDate" >= $1
          AND a."appointmentDate" <= $2
    `;
    
    const returnRateParams: any[] = [startDate, endDate];
    let returnRateParamIndex = 3;
    
    if (search) {
      returnRateQuery += ` WHERE (p."fullName" ILIKE $${returnRateParamIndex} OR p.cpf ILIKE $${returnRateParamIndex} OR p."mobilePhone" ILIKE $${returnRateParamIndex})`;
      returnRateParams.push(`%${search}%`);
      returnRateParamIndex++;
    }
    
    returnRateQuery += ` GROUP BY p.id`;
    
    const returnRateHavingConditions: string[] = [];
    if (minSpent !== undefined) {
      returnRateHavingConditions.push(`COALESCE(SUM(a."paidValue"), 0) >= $${returnRateParamIndex}`);
      returnRateParams.push(minSpent);
      returnRateParamIndex++;
    }
    if (maxSpent !== undefined) {
      returnRateHavingConditions.push(`COALESCE(SUM(a."paidValue"), 0) <= $${returnRateParamIndex}`);
      returnRateParams.push(maxSpent);
      returnRateParamIndex++;
    }
    if (returnRateHavingConditions.length > 0) {
      returnRateQuery += ` HAVING ${returnRateHavingConditions.join(' AND ')}`;
    }
    
    // Filtrar por appointmentCount > 1 (pacientes que retornaram)
    returnRateQuery += `) subq WHERE subq."appointmentCount" > 1`;
    
    // Se há filtro de data do último atendimento, precisa refazer a query
    if (lastAppointmentStartDate || lastAppointmentEndDate) {
      returnRateQuery = `
        SELECT COUNT(*) as total_with_return FROM (
          SELECT subq.id, subq."appointmentCount" FROM (
            SELECT 
              p.id,
              COUNT(a.id) as "appointmentCount",
              MAX(a."appointmentDate") as "lastAppointmentDate"
            FROM patients p
            LEFT JOIN appointments a ON a."patientId" = p.id
              AND a."appointmentDate" >= $1
              AND a."appointmentDate" <= $2
      `;
      
      if (search) {
        returnRateQuery += ` WHERE (p."fullName" ILIKE $3 OR p.cpf ILIKE $3 OR p."mobilePhone" ILIKE $3)`;
      }
      
      returnRateQuery += ` GROUP BY p.id`;
      
      if (returnRateHavingConditions.length > 0) {
        returnRateQuery += ` HAVING ${returnRateHavingConditions.join(' AND ')}`;
      }
      
      returnRateQuery += `) subq WHERE subq."appointmentCount" > 1`;
      
      if (lastAppointmentStartDate) {
        returnRateQuery += ` AND subq."lastAppointmentDate" >= $${returnRateParamIndex}`;
        returnRateParams.push(lastAppointmentStartDate);
        returnRateParamIndex++;
      }
      
      if (lastAppointmentEndDate) {
        returnRateQuery += ` AND subq."lastAppointmentDate" <= $${returnRateParamIndex}`;
        returnRateParams.push(lastAppointmentEndDate);
        returnRateParamIndex++;
      }
      
      returnRateQuery += `) final_subq`;
    }
    
    const returnRateResult = await prisma.$queryRawUnsafe<Array<{ total_with_return: bigint }>>(returnRateQuery, ...returnRateParams);
    const filteredPatientsWithReturn = Number(returnRateResult[0]?.total_with_return || 0);
    const filteredReturnRate = totalPatientsCount > 0 ? (filteredPatientsWithReturn / totalPatientsCount) * 100 : 0;

    // Resposta
    const response = {
      summary: {
        totalPatients: totalPatientsCount, // Total de pacientes filtrados
        recurringPatients: recurringPatientsCount,
        returnRate: filteredReturnRate, // Taxa de retorno dos pacientes filtrados
        vipPatientsCount: vipPatientsFormatted.length,
        patientsAtRiskCount: patientsAtRisk.length,
        churnRate,
      },
      segmentation: {
        recurringPatients: recurringPatientsCount,
        vipPatients: vipPatientsFormatted.length,
        atRisk: patientsAtRisk.length,
      },
      ltvDistribution: ltvRanges,
      vipPatients: vipPatientsFormatted,
      patientsAtRisk: patientsAtRisk.slice(0, 10), // Top 10 em risco
      patients: patients,
      pagination: {
        page,
        limit,
        total: totalPatientsCount,
        totalPages: Math.ceil(totalPatientsCount / limit),
      },
      period: {
        startDate,
        endDate,
      },
    };

    return res.status(200).send({ data: response });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};
