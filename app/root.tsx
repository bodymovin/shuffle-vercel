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
} from '@remix-run/node';
import styles from '~/styles/global.css';
import menuStyles from '~/styles/menu.css';
import lottieStyles from '~/styles/lottie.css';
import { MetaFunction } from '@remix-run/react/routeModules';
import { i18n } from '~/i18n.server';
import { useSetupTranslations } from 'remix-i18next';
import { DynamicLinks } from 'remix-utils';
import { User } from '~/interfaces/user';
import { getColorsFromCookie } from './helpers/colorParser.server';
import { ColorSet } from './interfaces/colors';
import Menu from './components/menu/Menu';
import { getUser } from './utils/user.server';
import { Speeds } from './interfaces/speeds';
import { getSpeedFromCookie } from './helpers/speedParser.server';
import { SpeedProvider } from './utils/providers/speed-provider';

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
  speed: Speeds
  locale: any
}

export const loader: LoaderFunction = async ({ request }):Promise<UserData> => (
  {
    colors: await getColorsFromCookie(request),
    speed: await getSpeedFromCookie(request),
    user: await getUser(request),
    locale: await i18n.getLocale(request),
  }
);

type SpeedValues = {
  // eslint-disable-next-line no-unused-vars
  [key in Speeds]: string;
};

const buildSpeed = (speed: Speeds): string => {
  const speeds: SpeedValues = {
    slow: '3s',
    medium: '1s',
    fast: '0.2s',
    static: '0s',
  };
  return speeds[speed] || speeds.medium;
};

export default function App() {
  const {
    colors, user, speed, locale,
  } = useLoaderData<UserData>();
  useSetupTranslations(locale);
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--color-1', colors.color1);
    root.style.setProperty('--color-2', colors.color2);
    root.style.setProperty('--color-3', colors.color3);
    root.style.setProperty('--animation-duration-unit', buildSpeed(speed));
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Shuffle stories</title>
        <meta
          name="description"
          content="Combine stories to create your own"
        />
        <meta
          name="author"
          content="L&H"
        />
        <meta name="keywords" content="Stories, Shuffle, animations" />
        <Meta />
        <Links />
        <DynamicLinks />
      </head>
      <body>
        <SpeedProvider speed={speed}>
          <Outlet />
        </SpeedProvider>
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
