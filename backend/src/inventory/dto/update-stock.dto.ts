import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MovementType } from '../schemas/inventory.schema';

export class UpdateStockDto {
  @IsEnum(MovementType, { message: 'Tipo debe ser: entrada, salida, ajuste' })
  type: MovementType;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
