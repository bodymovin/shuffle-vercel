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
    {
      rel: 'preload',
      href: '/routed/assets/selection/Adventurer.json',
      type: 'application/json',
      as: 'fetch',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: '/routed/assets/selection/Partner.json',
      type: 'application/json',
      as: 'fetch',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: '/routed/assets/selection/Object.json',
      type: 'application/json',
      as: 'fetch',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: '/routed/assets/selection/Vehicle.json',
      type: 'application/json',
      as: 'fetch',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: '/routed/assets/selection/Path.json',
      type: 'application/json',
      as: 'fetch',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: '/routed/assets/selection/Destiny.json',
      type: 'application/json',
      as: 'fetch',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: '/routed/assets/selection/read_button_3.json',
      type: 'application/json',
      as: 'fetch',
      crossOrigin: 'anonymous',
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
