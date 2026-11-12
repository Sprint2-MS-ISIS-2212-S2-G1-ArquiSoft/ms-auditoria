import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { Evento } from './entities/evento.entity';

/**
 * Dominio de Auditoria: registro inmutable de eventos de seguridad.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Evento])],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
