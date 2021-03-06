import {
  PrefetchPageLinks, useLoaderData, useNavigate,
} from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { i18n } from '~/i18n.server';
import { Language } from 'remix-i18next';
import { createSVG } from '~/helpers/svgToString';
import { useEffect, useState } from 'react';
import useComponentLottie from '~/utils/hooks/useComponentLottie';

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

  const [shouldPrefetch, doPrefetch] = useState(false);

  const [lottieElement, lottieControls] = useComponentLottie(
    {
      path,
      autoplay: true,
      loop: false,
      renderer: 'svg',
      poster,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    },
  );

  useEffect(() => {
    if (lottieControls) {
      lottieControls.onComplete = () => {
        navigate('/selection/character');
      };

      lottieControls.onLoad = () => {
        doPrefetch(true);
      };
    }
  }, [lottieControls, navigate, doPrefetch]);

  return (
    <>
      {shouldPrefetch && (
        <PrefetchPageLinks page="/selection/character" />
      )}
      {lottieElement}
    </>
  );
}
export default Splash;
