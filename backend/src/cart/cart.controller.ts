import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { GuestCheckoutDto } from './dto/guest-checkout.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getCart(@CurrentUser() user: AuthUser) {
    return this.cartService.getCart(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items')
  addItem(@CurrentUser() user: AuthUser, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:productId')
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(user.userId, productId, dto.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('items/:productId')
  removeItem(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.cartService.removeItem(user.userId, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  clearCart(@CurrentUser() user: AuthUser) {
    return this.cartService.clearCart(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@CurrentUser() user: AuthUser) {
    return this.cartService.checkout(user.userId);
  }

  @Post('guest-checkout')
  guestCheckout(@Body() dto: GuestCheckoutDto) {
    return this.cartService.guestCheckout(dto);
  }
}
