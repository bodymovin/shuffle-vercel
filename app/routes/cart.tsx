import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { bodyParser } from 'remix-utils';
import {
  createCartItem, updateCartItem,
} from '~/utils/cart.server';
import { getProductByItemIdAndType } from '~/utils/product.server';
import { getUser } from '~/utils/user.server';

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  const body: any = await bodyParser.toJSON(request);
  let cartItem;
  if (request.method === 'DELETE' || request.method === 'PUT') {
    // TODO: consider throwing. This should never happen
    if (user.id !== body.userId) {
      return json({});
    }
    cartItem = await updateCartItem(body);
  } else if (request.method === 'POST') {
    const product = await getProductByItemIdAndType(body.storyId);
    if (product) {
      cartItem = await createCartItem({
        status: 'pending',
        userId: user.id,
        productId: product.id,
      });
    }
  }
  return json(cartItem || {});
};
