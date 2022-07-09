import InitStripe from 'stripe';

const stripe = new InitStripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27',
  typescript: true,
});

export default stripe;
