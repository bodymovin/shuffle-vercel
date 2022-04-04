import Lottie from '~/components/Lottie';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { loadAnimation } from '~/helpers/animationData';

interface UserLoaderData {
  animation: string
}

export const loader: LoaderFunction = async ({ request }):Promise<UserLoaderData> => {
  const animationData = await loadAnimation('assets/title/data.json');
  return {
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
