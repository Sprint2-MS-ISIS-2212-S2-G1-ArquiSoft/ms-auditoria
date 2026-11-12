import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ListarEventosQueryDto {
  /**
   * Filtra por socio. Sin @IsUUID, igual que en CrearEventoDto: hay que poder
   * buscar los eventos de un socio cuyo id no es uuid.
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  socioId?: string;

  /** Filtra por desenlace del intento (ej. 'RECHAZADO'). */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  resultado?: string;
}
