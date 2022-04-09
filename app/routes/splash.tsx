import Lottie from '~/components/Lottie';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { loadAnimation } from '~/helpers/animationData';
import { i18n } from '~/i18n.server';
import { Language } from 'remix-i18next';
import { createSVG } from '~/helpers/svgToString';

interface UserLoaderData {
  path: string,
  i18n: Record<string, Language>
  poster: string
}

export const loader: LoaderFunction = async ({ request }):Promise<UserLoaderData> => (
  {
    i18n: await i18n.getTranslations(request, ['index']),
    path: 'assets/title/data.json',
    poster: await createSVG('assets/splash/loading_bird.svg'),
  }
);

function Splash() {
  const { path, poster } = useLoaderData<UserLoaderData>();

  const navigate = useNavigate();

  const onComplete = () => {
    navigate('/selection/character');
  };

  return (
    <Lottie
      loop={false}
      autoplay
      path={path}
      renderer="svg"
      poster={poster}
      onComplete={onComplete}
    />
  );
}
export default Splash;
