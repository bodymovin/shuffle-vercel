import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import stripe from '~/helpers/stripe/stripe';
import { getUser } from '~/utils/user.server';
import type { CartItem } from '~/utils/cart.server';
import { getCartByUser, updateCartItem } from '~/utils/cart.server';
import { getProductsByIds } from '~/utils/product.server';
import type { PurchaseItem } from '~/utils/purchase.server';
import { createPurchase, updatePurchase } from '~/utils/purchase.server';
import { ANONYMOUS_ID } from '~/helpers/constants/user';
import type { User } from '~/interfaces/user';

const getCheckoutUser = async (request: Request): Promise<User> => {
  const user = await getUser(request);
  if (!user || user.id === ANONYMOUS_ID) {
    throw redirect('/selection/character', 302);
  }
  return user;
};

const getCartItems = async (userId: string): Promise<CartItem[]> => {
  const cartItems = await getCartByUser(userId);
  if (!cartItems.length) {
    throw redirect('/selection/character', 302);
  }
  return cartItems;
};

const createPurchaseItem = async (cartItems: CartItem[], userId: string): Promise<PurchaseItem> => {
  const purchase = await createPurchase({
    userId,
    intentId: '',
    status: 'pending',
    cartItems: cartItems.map((cartItem) => cartItem.id).join(','),
  });
  if (!purchase) {
    throw redirect('/selection/character', 302);
  }
  return purchase;
};

const updatePurchaseItem = async (purchaseItem: PurchaseItem, intentId: string) => {
  try {
    await updatePurchase({
      ...purchaseItem,
      intentId,
      status: 'processing',
    });
  } catch (error) {
    throw redirect('/selection/character', 302);
  }
};

const createStripeSession = async (cartItems: CartItem[], purchase: PurchaseItem) => {
  const productIds = cartItems.map((cartItem) => cartItem.productId);
  const products = await getProductsByIds(productIds);
  const session = await stripe.checkout.sessions.create({
    line_items: products.map((product) => ({
      quantity: 1,
      price: product.priceId,
    })),
    mode: 'payment',
    success_url: `${process.env.DOMAIN}/purchase-success?purchase=${purchase.id}`,
    cancel_url: `${process.env.DOMAIN}/purchase-cancel?purchase=${purchase.id}`,
    // customer: user.stripe_customer,
    customer: 'cus_LmkTCsgCg76LXY',
  });
  return session;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getCheckoutUser(request);
  // TODO: get cart items only in pending status
  const cartItems = await getCartItems(user.id);
  const purchase = await createPurchaseItem(cartItems, user.id);
  const session = await createStripeSession(cartItems, purchase);
  await updatePurchaseItem(
    purchase,
    (typeof session.payment_intent === 'string') ? session.payment_intent : (session.payment_intent?.id || ''),
  );
  await Promise.all(cartItems.map((cartItem) => {
    const updatedCartItem: CartItem = {
      ...cartItem,
      status: 'processing',
    };
    return updateCartItem(updatedCartItem);
  }));
  // await fs.writeFile(
  //   `${__dirname}/../public/webhook/session.txt`,
  //   JSON.stringify(session, null, ' ')
  // );
  // TODO: handle stripe error
  return redirect(session.url || '');
  // return '';
};
