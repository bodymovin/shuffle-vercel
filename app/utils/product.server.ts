import type { ProductType } from '@prisma/client';
import { db } from './db.server';

export type ProductItem = {
  id: string
  itemId: string
  itemType: string
  priceId: string
}

export const getProductsByIds = async (ids: string[]): Promise<ProductItem[]> => (
  db.product.findMany({
    where: {
      id: { in: ids },
    },
  })
);

export const getProductById = async (id: string): Promise<ProductItem | null> => (
  db.product.findUnique({
    where: {
      id,
    },
  })
);

export const getProductByItemIdAndType = async (id: string, type: ProductType = 'story'): Promise<ProductItem | null> => (
  db.product.findFirst({
    where: {
      itemId: id,
      itemType: type,
    },
  })
);

export const getAllProducts = async (): Promise<ProductItem[]> => (
  db.product.findMany({})
);
