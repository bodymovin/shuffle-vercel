import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { getPurchase, updatePurchase } from '~/utils/purchase.server';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const purchaseId = url.searchParams.get('purchase');
  if (!purchaseId) {
    return redirect('/selection/character', 302);
  }
  const purchase = await getPurchase(purchaseId);
  if (purchase && ['pending', 'processing'].includes(purchase.status)) {
    purchase.status = 'cancelled';
    await updatePurchase(purchase);
  }
  return redirect('/selection/character', 302);
};
