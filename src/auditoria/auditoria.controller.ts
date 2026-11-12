import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { CrearEventoDto } from './dtos/crear-evento.dto';
import { ListarEventosQueryDto } from './dtos/listar-eventos.query.dto';
import { Evento } from './entities/evento.entity';

/**
 * No hay @Put, @Patch ni @Delete: el registro es inmutable y esas rutas no
 * existen, asi que Nest responde 404 por si solo.
 */
@Controller()
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  /** Contrato que consume ms-distribucion (Validador socio). 201 por defecto. */
  @Post('eventos')
  registrar(@Body() dto: CrearEventoDto): Promise<{ id: string }> {
    return this.auditoriaService.registrar(dto);
  }

  @Get('eventos')
  listarEventos(@Query() query: ListarEventosQueryDto): Promise<Evento[]> {
    return this.auditoriaService.listarEventos(query.socioId, query.resultado);
  }

  /** Sin ParseUUIDPipe a proposito: el 404 lo decide el servicio. */
  @Get('eventos/:id')
  getEvento(@Param('id') id: string): Promise<Evento> {
    return this.auditoriaService.getEvento(id);
  }
}
