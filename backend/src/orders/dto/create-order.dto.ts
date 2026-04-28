import { IsArray, IsNumber, IsString, IsOptional, IsEnum, ValidateNested, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../schemas/order.schema';

class OrderItemDto {
  @IsString()
  product: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  totalItem?: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsNumber()
  totalOrder?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerNotes?: string;
}
