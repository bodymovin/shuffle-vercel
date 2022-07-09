import type { LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { getPurchase } from '~/utils/purchase.server';
import { useTranslation } from 'react-i18next';
import { i18n } from '~/i18n.server';
import styles from '~/styles/purchase.css';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const purchaseId = url.searchParams.get('purchase');
  if (!purchaseId) {
    throw redirect('/selection/character', 302);
  }
  const purchase = await getPurchase(purchaseId);
  // const purchase = await getPurchase(purchaseId.substring(0, purchaseId.length - 2) + 'aa');
  if (!purchase || purchase.status !== 'complete') {
    return json(
      {
        purchaseId,
        i18n: await i18n.getTranslations(request, ['index', 'purchase']),
      },
    );
  }
  return redirect('/selection/character', 302);
};

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: styles,
    },
  ];
}

export default function PurchaseSuccess() {
  const userData = useLoaderData();
  const [counter, setCounter] = useState(0);
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { t } = useTranslation('purchase');

  useEffect(() => {
    const interval = setInterval(() => {
      if (counter >= 5) {
        navigate('/selection/character');
      } else {
        fetcher.load(`/purchase?id=${userData.purchaseId}`);
      }
      setCounter((c) => c + 1);
      return () => clearInterval(interval);
    }, 1 * 1000);

    return () => clearInterval(interval);
  }, [fetcher, userData.purchaseId, counter]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.status === 'success') {
        navigate('/selection/character');
      }
    }
  }, [fetcher]);

  return (
    <div className="wrapper">
      <article className="container">
        <header className="header">
          {t('purchase_loading_animaions')}
        </header>
      </article>
    </div>
  );
}
