import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Cuerpo de POST /eventos: el contrato que consume ms-distribucion desde
 * AuditoriaClient.registrar (src/clients/auditoria.client.ts).
 *
 * Copia local a proposito: no se importa nada del otro servicio (regla 2 de
 * CLAUDE.md).
 */
export class CrearEventoDto {
  /**
   * Socio al que se le atribuye el intento.
   *
   * Sin @IsUUID a proposito: un socio rechazado puede mandar un id invalido y
   * ese intento tambien se registra. Solo se exige que no venga vacio.
   */
  @IsString()
  @IsNotEmpty()
  socioId!: string;

  /** Operacion que se intento. */
  @IsString()
  @IsNotEmpty()
  accion!: string;

  /** Recurso sobre el que se intento la accion. */
  @IsString()
  @IsNotEmpty()
  recurso!: string;

  /** Desenlace del intento. */
  @IsString()
  @IsNotEmpty()
  resultado!: string;

  /** Contexto libre del rechazo. */
  @IsOptional()
  @IsString()
  detalle?: string;

  /** Momento del intento, en ISO 8601. */
  @IsISO8601()
  fecha!: string;
}
