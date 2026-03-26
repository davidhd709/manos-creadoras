import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'Estado debe ser: pendiente, en_proceso, enviado, entregado, cancelado',
  })
  status: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
