import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEmail, ValidateNested } from 'class-validator';
import { AddCartItemDto } from './add-cart-item.dto';

export class GuestCheckoutDto {
  @IsEmail()
  email!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AddCartItemDto)
  items!: AddCartItemDto[];
}
