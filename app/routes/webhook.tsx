import { ActionFunction } from '@remix-run/node';
import stripe from '~/helpers/stripe/stripe';
import fs from 'fs/promises';
import { resolvePurchaseByIntentId } from '~/utils/purchase.server';

export const action: ActionFunction = async ({ request }) => {
  console.log('================');
  const secret = 'whsec_309b9f05bade18cbf11a7f80974385c96ea6998e7d7c1a3b1819f60fb7b5854d';
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') || '';
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
    await fs.writeFile(`${__dirname}/../public/webhook/${event.type}.txt`, JSON.stringify(event, null, ' '));
  } catch (err: any) {
    console.log(err);
    return new Response(err.message, {
      status: 400,
    });
  }
  console.log('EVENT: ', event.type);
  if (event.type === 'payment_intent.succeeded') {
    // TODO: review the stripe object model
    await Promise.all(event.data.object.charges.data.map((paymentData: any) => {
      const intentId = paymentData.payment_intent;
      return resolvePurchaseByIntentId(intentId);
    }));
  }
  // console.log('request', request.body);
  // console.log('type', typeof request.body);
  // const bodyRequest = JSON.parse(body);
  // console.log('bodyRequest', bodyRequest);
  // console.log('EVENT: ', bodyRequest.type);
  return '';
};
