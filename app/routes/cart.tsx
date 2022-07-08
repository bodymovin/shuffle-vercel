import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { bodyParser } from 'remix-utils';
import {
  createCartItem, updateCartItem, deleteCartItem, getCartItemByUserIdAndProductId,
} from '~/utils/cart.server';
import { getProductByItemIdAndType } from '~/utils/product.server';
import { getUser } from '~/utils/user.server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { errorCodes } from '~/helpers/constants/prisma';

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  const body: any = await bodyParser.toJSON(request);
  let cartItem;
  if (request.method === 'PUT') {
    // TODO: consider throwing. This should never happen
    if (user.id !== body.userId) {
      return json({});
    }
    cartItem = await updateCartItem(body);
  } else if (request.method === 'DELETE') {
    // TODO: consider throwing. This should never happen
    if (user.id !== body.userId) {
      return json({});
    }
    try {
      cartItem = await deleteCartItem(body);
    } catch (error) {
      // TODO: handle cases where the Remove button is clicked multiple times
    }
  } else if (request.method === 'POST') {
    const product = await getProductByItemIdAndType(body.storyId);
    if (product) {
      try {
        cartItem = await createCartItem({
          status: 'pending',
          userId: user.id,
          productId: product.id,
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === errorCodes.UNIQUE_CONSTRAINT_FAILED) {
            cartItem = await getCartItemByUserIdAndProductId(user.id, product.id);
          }
        }
      }
    }
  }
  return json(cartItem || {});
};
