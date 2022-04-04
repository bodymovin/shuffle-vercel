import { LoaderFunction } from '@remix-run/node';
import { loadAnimation } from '~/helpers/animationData';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const animation = await loadAnimation(url.searchParams.get('path') || '');
  return new Response(JSON.stringify(animation), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
