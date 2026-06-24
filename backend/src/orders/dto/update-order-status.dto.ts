import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'Estado debe ser: pendiente, en_proceso, enviado, entregado, cancelado',
  })
  status: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
