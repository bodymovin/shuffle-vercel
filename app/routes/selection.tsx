import { json, LoaderFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { updateUserPrefs } from '~/cookies';
import styles from '~/styles/selection.css';
import { i18n } from '~/i18n.server';

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: styles,
    },
  ];
}

export const loader: LoaderFunction = async ({ request }): Promise<any> => {
  const serializedCookie = await updateUserPrefs(request, { visitedSplash: true });
  return json({
    ok: true,
    i18n: await i18n.getTranslations(request, ['index', 'selection']),
  }, {
    headers: {
      'Set-Cookie': serializedCookie,
    },
  });
};

export default function Navigation() {
  return (
    <Outlet />
  );
}
