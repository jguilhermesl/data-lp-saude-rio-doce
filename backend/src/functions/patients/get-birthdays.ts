import { Request, Response } from 'express';
import { z } from 'zod';
import { handleErrors } from '@/utils/handle-errors';
import * as cheerio from 'cheerio';
import { patientDAO } from '@/DAO/patient';

const getBirthdaysSchema = z.object({
  date: z.string().optional(), // formato: YYYY-MM-DD
});

interface BirthdayPerson {
  externalId: string;
  day: string;
  name: string;
  birthDate: string;
  age: string;
  lastAppointment: string;
  daysSinceLastAppointment: string;
  email: string;
  phone: string;
}

/**
 * Busca aniversariantes da API externa e relaciona com pacientes no banco
 */
export async function getBirthdays(req: Request, res: Response) {
  try {
    const { date } = getBirthdaysSchema.parse(req.query);
    
    // Usar data fornecida ou data atual
    // Se data foi fornecida como string (YYYY-MM-DD), extrair dia e mês diretamente
    let month: number;
    let day: number;
    
    if (date) {
      // Parse manual para evitar problemas de timezone
      const [year, monthStr, dayStr] = date.split('-');
      month = parseInt(monthStr, 10);
      day = parseInt(dayStr, 10);
    } else {
      // Usar data atual no timezone local
      const now = new Date();
      month = now.getMonth() + 1; // getMonth() retorna 0-11
      day = now.getDate();
    }
    
    const targetDate = date ? new Date(date + 'T00:00:00') : new Date();

    // Buscar dados da API externa
    const response = await fetch('https://ww3.s2web.com.br/lp_riodoce/modules/pacientes/niver_listagem.php', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://ww3.s2web.com.br',
        'Referer': 'https://ww3.s2web.com.br/lp_riodoce/index.php?m=pacientes&a=niver',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: new URLSearchParams({
        mes_nascimento: month.toString(),
        dia_inicio: '',
        mes_inicio: '',
        dia_termino: '',
        mes_termino: '',
        excel: '0',
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar aniversariantes: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse do HTML usando cheerio
    const $ = cheerio.load(html);
    const birthdays: BirthdayPerson[] = [];

    $('tbody tr').each((_index: number, element: any) => {
      const tds = $(element).find('td');
      
      if (tds.length >= 10) {
        const externalId = $(tds[0]).text().trim();
        const birthDay = $(tds[1]).text().trim();
        const name = $(tds[2]).text().trim();
        const birthDate = $(tds[3]).text().trim();
        const age = $(tds[4]).text().trim();
        const lastAppointment = $(tds[5]).text().trim();
        const daysSinceLastAppointment = $(tds[6]).text().trim();
        const email = $(tds[7]).find('a').attr('href')?.replace('mailto:', '') || '';
        const phone = $(tds[8]).text().trim();

        birthdays.push({
          externalId,
          day: birthDay,
          name,
          birthDate,
          age,
          lastAppointment,
          daysSinceLastAppointment,
          email,
          phone,
        });
      }
    });

    // Filtrar apenas os aniversariantes do dia específico
    const filteredBirthdays = birthdays.filter((birthday) => {
      return birthday.day === day.toString();
    });

    // Relacionar com pacientes no banco de dados
    const enrichedBirthdays = await Promise.all(
      filteredBirthdays.map(async (birthday) => {
        // Primeiro, tentar buscar pelo externalId
        let patient = await patientDAO.findOne({
          externalId: birthday.externalId,
          sourceSystem: 'lp_riodoce',
        });

        // Se não encontrou pelo externalId, buscar pelo telefone
        if (!patient && birthday.phone) {
          const cleanPhone = birthday.phone.replace(/\D/g, '');
          
          // Buscar por mobilePhone ou homePhone
          patient = await patientDAO.findOne({
            OR: [
              { mobilePhone: { contains: cleanPhone } },
              { homePhone: { contains: cleanPhone } },
            ],
          });
        }

        return {
          ...birthday,
          patientId: patient?.id || null,
          patientData: patient ? {
            id: patient.id,
            fullName: patient.fullName,
            cpf: patient.cpf,
            mobilePhone: patient.mobilePhone,
            homePhone: patient.homePhone,
          } : null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        day,
        month,
        total: enrichedBirthdays.length,
        birthdays: enrichedBirthdays,
      },
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
}
