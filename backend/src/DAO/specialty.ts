import { prisma } from '../lib/prisma';
import { Prisma, Specialty } from '@prisma/client';

/**
 * SpecialtyDAO - Data Access Object para operações relacionadas a especialidades
 */
export class SpecialtyDAO {
  // ========== CRUD BÁSICO ==========

  /**
   * Busca uma única especialidade
   */
  async findOne(
    where: Prisma.SpecialtyWhereInput,
    include?: Prisma.SpecialtyInclude
  ): Promise<Specialty | null> {
    try {
      return await prisma.specialty.findFirst({ where, include });
    } catch (error) {
      console.error('Error in SpecialtyDAO.findOne:', error);
      throw error;
    }
  }

  /**
   * Busca múltiplas especialidades
   */
  async findMany(
    where?: Prisma.SpecialtyWhereInput,
    include?: Prisma.SpecialtyInclude,
    orderBy?: Prisma.SpecialtyOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<Specialty[]> {
    try {
      return await prisma.specialty.findMany({
        where,
        include,
        orderBy,
        skip,
        take,
      });
    } catch (error) {
      console.error('Error in SpecialtyDAO.findMany:', error);
      throw error;
    }
  }

  /**
   * Busca especialidade por ID
   */
  async findById(id: string, include?: Prisma.SpecialtyInclude): Promise<Specialty | null> {
    return this.findOne({ id }, include);
  }

  /**
   * Conta o número de especialidades
   */
  async count(where?: Prisma.SpecialtyWhereInput): Promise<number> {
    try {
      return await prisma.specialty.count({ where });
    } catch (error) {
      console.error('Error in SpecialtyDAO.count:', error);
      throw error;
    }
  }

  /**
   * Busca especialidades com médicos associados
   */
  async findWithDoctors() {
    try {
      return await prisma.specialty.findMany({
        include: {
          doctorSpecialties: {
            include: {
              doctor: {
                select: {
                  id: true,
                  name: true,
                  crm: true,
                },
              },
            },
          },
          _count: {
            select: {
              doctorSpecialties: true,
              appointments: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Error in SpecialtyDAO.findWithDoctors:', error);
      throw error;
    }
  }

  /**
   * Busca especialidades de um médico específico
   */
  async findByDoctorId(doctorId: string) {
    try {
      const doctorSpecialties = await prisma.doctorSpecialty.findMany({
        where: { doctorId },
        include: {
          specialty: true,
        },
      });

      return doctorSpecialties.map((ds) => ds.specialty);
    } catch (error) {
      console.error('Error in SpecialtyDAO.findByDoctorId:', error);
      throw error;
    }
  }
}

export const specialtyDAO = new SpecialtyDAO();
