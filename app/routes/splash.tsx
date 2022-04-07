import Lottie from '~/components/Lottie';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { loadAnimation } from '~/helpers/animationData';
import promiWalk from '~/helpers/fileExplorer.server';

interface UserLoaderData {
  animation: string,
  extra: any
}

export const loader: LoaderFunction = async ({ request }):Promise<UserLoaderData> => {
  const animationData = await loadAnimation('assets/title/data.json');
  let extra = ''
  try {
    extra = await promiWalk(__dirname + '/../public/', 2);
  } catch (error) {
  }
  return {
    animation: JSON.stringify(animationData),
    extra,
  };
};

function Splash() {
  const { animation, extra } = useLoaderData<UserLoaderData>();

  console.log('extra', extra);
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
