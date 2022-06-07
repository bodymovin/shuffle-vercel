import { Prisma, PurchaseStatus } from '@prisma/client';
import { db } from './db.server';

export type CartItem = {
  id?: string
  userId: string
  productId: string
  status: PurchaseStatus
}

export const createCartItem = async (cartItem: CartItem): Promise<CartItem> => (
  db.cart.create({
    data: cartItem,
  })
);

export const getCartByUser = async (
  userId: string,
  statuses: PurchaseStatus[] = [],
): Promise<CartItem[]> => {
  const condition: Prisma.CartWhereInput = {
    userId,
  };
  if (statuses.length) {
    condition.status = {
      in: statuses,
    };
  }
  const cart = await db.cart.findMany({
    where: condition,
  });
  return cart;
};

export const getCartItemById = async (id: string): Promise<CartItem | null> => {
  const cart = await db.cart.findUnique({
    where: {
      id,
    },
  });
  return cart;
};

export const updateCartItem = async (cartItem: CartItem): Promise<CartItem | null> => {
  const cart = await db.cart.update({
    data: cartItem,
    where: {
      id: cartItem.id,
    },
  });
  return cart;
};
