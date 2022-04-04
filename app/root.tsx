import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import {
  LinksFunction,
  LoaderFunction,
} from '@remix-run/server-runtime';
import styles from '~/styles/global.css';
import menuStyles from '~/styles/menu.css';
import lottieStyles from '~/styles/lottie.css';
import { MetaFunction } from '@remix-run/react/routeModules';
import { getColorsFromCookie } from './helpers/colorParser';
import { ColorSet } from './interfaces/colors';
import Menu from './components/menu/Menu';
import { User } from '@prisma/client';
import { getUser } from './utils/user.server';

export const meta: MetaFunction = () => ({ title: 'Shuffle Stories' });

export const links: LinksFunction = () => (
  [
    { rel: 'stylesheet', href: styles },
    { rel: 'stylesheet', href: menuStyles },
    { rel: 'stylesheet', href: lottieStyles },
  ]
);

interface UserData {
  colors: ColorSet
  user: User
}

export const loader: LoaderFunction = async ({ request }):Promise<UserData> => (
  {
    colors: await getColorsFromCookie(request),
    user: await getUser(request),
  }
);

export default function App() {
  const { colors, user } = useLoaderData<UserData>();
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--color-1', colors.color1);
    root.style.setProperty('--color-2', colors.color2);
    root.style.setProperty('--color-3', colors.color3);
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Menu
          colors={colors}
          user={user}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
