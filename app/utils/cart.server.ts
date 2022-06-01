import { PurchaseStatus } from '@prisma/client';
import { db } from './db.server';

export type CartItem = {
  userId: string
  productId: string
  id: string
  status: PurchaseStatus
}

export const getCartByUser = async (userId: string): Promise<CartItem[]> => {
  const cart = await db.cart.findMany({
    where: {
      userId,
    },
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
