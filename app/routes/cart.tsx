import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { bodyParser } from 'remix-utils';
import type { User } from '~/interfaces/user';
import type { CartItem } from '~/utils/cart.server';
import { createCartItem, getCartByUser, updateCartItem } from '~/utils/cart.server';
import { getProductsByIds } from '~/utils/product.server';
import { getUser } from '~/utils/user.server';

const findCartItem = async (user: User, productId: string): Promise<CartItem | null> => {
  const cart = await getCartByUser(user.id);
  const productIds = cart.map((item) => item.productId);
  const products = await getProductsByIds(productIds);
  const product = products.find((item) => item.itemId === productId);
  if (product) {
    return cart.find((cartItem) => cartItem.productId === product.id) || null;
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  const body: any = await bodyParser.toJSON(request);
  let cartItem = await findCartItem(user, body.id);
  if (body.value === '0' && cartItem) {
    cartItem.status = 'deleted';
    await updateCartItem(cartItem);
  } else if (body.value === '1') {
    if (cartItem) {
      cartItem.status = 'pending';
      await updateCartItem(cartItem);
    } else {
      cartItem = await createCartItem({
        status: 'pending',
        userId: user.id,
        productId: body.id,
      });
    }
  }
  return json(cartItem || {});
};
