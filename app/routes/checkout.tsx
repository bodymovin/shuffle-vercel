import { LoaderFunction, redirect } from '@remix-run/node';
import stripe from '~/helpers/stripe/stripe';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1L1uNlE3GPXeTIWOqlOdTVVL',
        quantity: 1,
      },
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1L1uWqE3GPXeTIWOnuOI5kFf',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.DOMAIN}/success.html`,
    cancel_url: `${process.env.DOMAIN}/cancel.html`,
  });
  console.log('session', session);
  //TODO: handle stripe error
  return redirect(session.url || '');
};
