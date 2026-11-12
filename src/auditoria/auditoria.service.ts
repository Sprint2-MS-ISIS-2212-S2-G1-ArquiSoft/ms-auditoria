import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CrearEventoDto } from './dtos/crear-evento.dto';
import { Evento } from './entities/evento.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
  ) {}

  /**
   * Registra un evento de seguridad. Unica escritura del servicio: el registro
   * es inmutable, asi que no hay actualizar ni borrar.
   */
  async registrar(dto: CrearEventoDto): Promise<{ id: string }> {
    const evento = await this.eventoRepository.save(
      this.eventoRepository.create({
        socioId: dto.socioId,
        accion: dto.accion,
        recurso: dto.recurso,
        resultado: dto.resultado,
        detalle: dto.detalle ?? null,
        fecha: new Date(dto.fecha),
      }),
    );
    return { id: evento.id };
  }

  /** Ordena por registradoEn (hora del servidor), del mas reciente al mas viejo. */
  async listarEventos(socioId?: string, resultado?: string): Promise<Evento[]> {
    const where: FindOptionsWhere<Evento> = {};
    if (socioId) {
      where.socioId = socioId;
    }
    if (resultado) {
      where.resultado = resultado;
    }
    return this.eventoRepository.find({
      where,
      order: { registradoEn: 'DESC' },
    });
  }

  async getEvento(idEvento: string): Promise<Evento> {
    // La columna id es uuid: consultar con un id mal formado revienta en
    // Postgres, asi que un id invalido se trata como inexistente (404).
    if (!isUUID(idEvento)) {
      throw new NotFoundException(
        `Evento de auditoria con id ${idEvento} no encontrado`,
      );
    }
    const evento = await this.eventoRepository.findOne({
      where: { id: idEvento },
    });
    if (!evento) {
      throw new NotFoundException(
        `Evento de auditoria con id ${idEvento} no encontrado`,
      );
    }
    return evento;
  }
}
