import { LoaderFunction } from '@remix-run/node';
import { loadAnimation } from '~/helpers/animationData';

export const loader: LoaderFunction = async ({request}) => {
  const url = new URL(request.url);
  const { pathname } = url;
  const prefix = '/routed';
  const animation = await loadAnimation(pathname.substr(pathname.indexOf(prefix) + prefix.length));
  return new Response(JSON.stringify(animation), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
