import { db } from './db.server';

type ProductItem = {
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