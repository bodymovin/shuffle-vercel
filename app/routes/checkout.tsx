import { LoaderFunction, redirect } from '@remix-run/node';
import stripe from '~/helpers/stripe/stripe';
import fs from 'fs/promises';
import { getUser } from '~/utils/user.server';
import { CartItem, getCartByUser, updateCartItem } from '~/utils/cart.server';
import { getProductsByIds } from '~/utils/product.server';
import { createPurchase } from '~/utils/purchase.server';

export const loader: LoaderFunction = async ({ request }) => {
  // TODO: handle user not signed in
  const user = await getUser(request);
  // TODO: get cart items only in pending status
  const cartItems = await getCartByUser(user.id);
  // TODO: handle empty cart
  const productIds = cartItems.map((cartItem) => cartItem.productId);
  const products = await getProductsByIds(productIds);
  const session = await stripe.checkout.sessions.create({
    line_items: products.map((product) => ({
      quantity: 1,
      price: product.priceId,
    })),
    mode: 'payment',
    success_url: `${process.env.DOMAIN}/success.html`,
    cancel_url: `${process.env.DOMAIN}/cancel.html`,
    customer: 'cus_LmkTCsgCg76LXY',
  });
  await createPurchase({
    userId: user.id,
    intentId: (typeof session.payment_intent === 'string') ? session.payment_intent : (session.payment_intent?.id || ''),
    status: 'pending',
    cartItems: cartItems.map((cartItem) => cartItem.id).join(','),
  });
  await Promise.all(cartItems.map((cartItem) => {
    const updatedCartItem: CartItem = {
      ...cartItem,
      status: 'processing',
    };
    return updateCartItem(updatedCartItem);
  }));
  // await fs.writeFile(`${__dirname}/../public/webhook/session.txt`, JSON.stringify(session, null, ' '));
  // TODO: handle stripe error
  return redirect(session.url || '');
  // return '';
};
