import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddCartItemDto {
  @IsString()
  productId!: string;

  @IsString()
  productName!: string;

  @IsOptional()
  @IsString()
  productImageUrl?: string;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}
