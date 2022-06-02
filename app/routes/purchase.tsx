import { json, LoaderFunction } from '@remix-run/node';
import { getPurchase } from '~/utils/purchase.server';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const purchaseId = url.searchParams.get('id');
  if (!purchaseId) {
    return json({
      status: 'failed',
    }, { status: 404 });
  }
  const purchase = await getPurchase(purchaseId);
  // const purchase = await getPurchase(purchaseId.substring(0, purchaseId.length - 2) + 'aa');
  if (!purchase) {
    return json({
      status: 'failed',
    }, { status: 404 });
  }
  return json({
    status: 'success',
  });
};
