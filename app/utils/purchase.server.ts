import { getCartItemById, updateCartItem } from './cart.server';
import { db } from './db.server';
import { getProductById } from './product.server';
import * as userStory from './user-story.server';

type PurchaseStatus = 'pending' | 'cancelled' | 'complete' | 'processing'

export type PurchaseItem = {
  id?: string
  userId: string
  intentId: string
  cartItems: string
  status: PurchaseStatus
}

export const createPurchase = async (purchase: PurchaseItem): Promise<PurchaseItem> => (
  db.purchase.create({
    data: purchase,
  })
);

export const updatePurchase = async (purchase: PurchaseItem): Promise<unknown> => (
  db.purchase.update({
    data: purchase,
    where: {
      id: purchase.id,
    },
  })
);

const assignCartItemToUser = async (cartItemId: string) => {
  const cartItem = await getCartItemById(cartItemId);
  if (cartItem) {
    const product = await getProductById(cartItem.productId);
    if (product) {
      // TODO: handle product type
      const storyId = product.itemId;
      const { userId } = cartItem;
      // TODO: handle unique constraint
      const userStoryEntity = await userStory.create(userId, storyId);
      if (userStoryEntity) {
        cartItem.status = 'complete';
        await updateCartItem(cartItem);
      }
    }
  }
};

export const resolvePurchaseByIntentId = async (intentId: string) => {
  const purchase = await db.purchase.findFirst({
    where: {
      intentId,
    },
  });
  if (purchase) {
    const cartItemsList = purchase.cartItems.split(',');
    const promises = cartItemsList.map(assignCartItemToUser);
    await Promise.all(promises);
    purchase.status = 'complete';
    await db.purchase.update({
      data: purchase,
      where: {
        id: purchase.id,
      },
    });
  }
};

export const getPurchase = async (id: string) => db.purchase.findUnique({
  where: {
    id,
  },
});
