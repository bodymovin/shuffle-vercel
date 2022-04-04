import { redirect } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { getUserPrefsFromRequest } from '~/cookies';

export const loader: LoaderFunction = async ({ request }):Promise<null> => {
  const cookie = await getUserPrefsFromRequest(request);
  if (!cookie.visitedSplash) {
    throw redirect('/splash', 302);
  } else {
    throw redirect('/selection/character', 302);
  }
};

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Shuffle Stories</h1>
    </div>
  );
}
