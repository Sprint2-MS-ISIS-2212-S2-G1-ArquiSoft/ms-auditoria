import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Evento de seguridad registrado por Auditoria.
 *
 * La tabla es append-only: solo se insertan filas. No hay endpoints de
 * actualizacion ni de borrado, y la entidad no expone columnas de version ni
 * de fecha de modificacion porque una fila nunca cambia.
 *
 * socioId es una columna de id suelta, no una relacion: el socio vive en otro
 * microservicio (regla 3 de CLAUDE.md). Tampoco es uuid a proposito, ver abajo.
 */
@Entity('eventos_auditoria')
export class Evento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Socio al que se le atribuye el intento.
   *
   * Es varchar y no uuid: el socio cuyo acceso se rechaza puede haber mandado
   * un id con cualquier forma, y ese intento tambien se registra. Validarlo
   * como uuid perderia justo los eventos mas interesantes.
   *
   * El indice se nombra explicitamente para que coincida con el que crea
   * database/init.sql y synchronize no agregue un duplicado.
   */
  @Index('idx_eventos_auditoria_socio')
  @Column()
  socioId!: string;

  /** Operacion que se intento (ej. 'GET /cotizaciones'). */
  @Column()
  accion!: string;

  /** Recurso sobre el que se intento la accion. */
  @Column()
  recurso!: string;

  /** Desenlace del intento (ej. 'RECHAZADO'). */
  @Column()
  resultado!: string;

  /** Contexto libre del rechazo: scope faltante, cuota excedida, etc. */
  @Column({ type: 'varchar', nullable: true })
  detalle!: string | null;

  /** Momento del intento segun quien lo reporta. */
  @Column({ type: 'timestamp' })
  fecha!: Date;

  /**
   * Momento en que Auditoria recibio el evento, puesto por el servidor.
   *
   * Es la columna que ordena las lecturas: `fecha` la controla quien llama y
   * puede venir desordenada o mentir, `registradoEn` no.
   */
  @CreateDateColumn()
  registradoEn!: Date;
}
