import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemInput {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  variantId?: string; // اختياري — بلا variant محدد = بلا stock decrement (منتج بسيط بلا variants)

  @Min(1)
  quantity!: number;
}

class CustomerInput {
  @IsPhoneNumber('MA') // انظر docs/03-database-schema.md — التيليفون المعرف الأساسي لـCOD
  phone!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CustomerInput)
  customer!: CustomerInput;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items!: OrderItemInput[];

  // إجباري — انظر docs/03-database-schema.md § idempotency_key
  // كيتولد فالـfrontend عند فتح صفحة checkout، بلا تكرار حتى لو المستخدم كبس "أكد" مرتين
  @IsString()
  idempotencyKey!: string;
}
