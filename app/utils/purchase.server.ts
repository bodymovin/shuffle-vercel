import { getCartItemById, updateCartItem } from './cart.server';
import { db } from './db.server';
import { getProductById } from './product.server';

type PurchaseStatus = 'pending' | 'cancelled' | 'complete'

type PurchaseItem = {
  userId: string
  intentId: string
  cartItems: string
  status: PurchaseStatus
}

export const createPurchase = async (purchase: PurchaseItem): Promise<unknown> => (
  db.purchase.create({
    data: purchase,
  })
);

const assignCartItemToUser = async (cartItemId: string) => {
  const cartItem = await getCartItemById(cartItemId);
  if (cartItem) {
    const product = await getProductById(cartItem.productId);
    if (product) {
      console.log('assignCartItemToUser::productExists');
      // TODO: handle product type
      const storyId = product.itemId;
      const { userId } = cartItem;
      // TODO: handle unique constraint
      const userStory = await db.userStory.create({
        data: {
          userId,
          storyId,
        },
      });
      if (userStory) {
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
