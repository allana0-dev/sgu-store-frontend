import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { GuestCheckoutDto } from './dto/guest-checkout.dto';

const GUEST_CHECKOUT_EMAIL = 'guest-checkout@sgu.local';
const GUEST_CHECKOUT_PASSWORD_HASH =
  '$2a$10$BGEgaTNhccq2OCdmTJc3qu6RUKLdmlPim2mH8KM9JheX3lKTTAuku';

type CheckoutItemInput = {
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  unitPrice: number;
  quantity: number;
};

type OrderWriter = Pick<PrismaService, 'order'>;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return this.formatCart(items);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const existing = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          productName: dto.productName,
          productImageUrl: dto.productImageUrl,
          unitPrice: dto.unitPrice,
          quantity: existing.quantity + dto.quantity,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          userId,
          productId: dto.productId,
          productName: dto.productName,
          productImageUrl: dto.productImageUrl,
          unitPrice: dto.unitPrice,
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    if (quantity === 0) {
      await this.prisma.cartItem.deleteMany({
        where: { userId, productId },
      });
      return this.getCart(userId);
    }

    await this.prisma.cartItem.updateMany({
      where: { userId, productId },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    await this.prisma.cartItem.deleteMany({
      where: { userId, productId },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return this.getCart(userId);
  }

  async checkout(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({ where: { userId } });
    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await this.createOrderOnClient(tx, userId, cartItems);
      await tx.cartItem.deleteMany({ where: { userId } });
      return createdOrder;
    });

    return {
      order,
      cart: this.formatCart([]),
    };
  }

  async guestCheckout(dto: GuestCheckoutDto) {
    const guestUserId = await this.getGuestCheckoutUserId();
    const order = await this.createOrderOnClient(this.prisma, guestUserId, dto.items);

    return {
      order,
      receiptEmail: dto.email,
    };
  }

  private async createOrderOnClient(client: OrderWriter, userId: string, items: CheckoutItemInput[]) {
    if (items.length === 0) {
      throw new BadRequestException('Cannot checkout with an empty cart.');
    }

    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return client.order.create({
      data: {
        userId,
        subtotal,
        totalItems,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImageUrl: item.productImageUrl,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.unitPrice * item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  private async getGuestCheckoutUserId() {
    const guestUser = await this.prisma.user.upsert({
      where: { email: GUEST_CHECKOUT_EMAIL },
      update: {},
      create: {
        email: GUEST_CHECKOUT_EMAIL,
        passwordHash: GUEST_CHECKOUT_PASSWORD_HASH,
      },
      select: { id: true },
    });

    return guestUser.id;
  }

  private formatCart(
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      productImageUrl: string | null;
      unitPrice: number;
      quantity: number;
    }>,
  ) {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      summary: {
        subtotal,
        totalItems,
      },
    };
  }
}
