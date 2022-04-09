import Lottie from '~/components/Lottie';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { loadAnimation } from '~/helpers/animationData';
import { i18n } from '~/i18n.server';
import { Language } from 'remix-i18next';

interface UserLoaderData {
  animation: string,
  i18n: Record<string, Language>
}

export const loader: LoaderFunction = async ({ request }):Promise<UserLoaderData> => {
  const animationData = await loadAnimation('assets/title/data.json');
  return {
    i18n: await i18n.getTranslations(request, ['index']),
    animation: JSON.stringify(animationData),
  };
};

function Splash() {
  const { animation } = useLoaderData<UserLoaderData>();

  const navigate = useNavigate();

  const onComplete = () => {
    navigate('/selection/character');
  };

  return (
    <Lottie
      loop={false}
      autoplay
      animationString={animation}
      renderer="svg"
      onComplete={onComplete}
    />
  );
}
export default Splash;
