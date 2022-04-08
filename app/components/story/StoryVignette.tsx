import { useState, useEffect } from 'react';
import { Speeds } from '~/interfaces/speeds';
import { LottieStates, useLottieAnim } from '~/utils/hooks/useLottieAnim';
import { useSpeed } from '~/utils/providers/speed-provider';
import LottieComponent from '../Lottie';

export interface StoryVignetteProps {
  poster: string
  animationPath: string
  isSelected: boolean
}

type SpeedToData = {
  // eslint-disable-next-line no-unused-vars
  [key in Speeds]: number;
};

const calculateSpeed = (speed: Speeds) => {
  const speeds:SpeedToData = {
    slow: 3,
    medium: 1,
    fast: 0.333,
    static: 0,
  };
  return speeds[speed] || speeds.medium;
};

function StoryVignette({ animationPath, poster, isSelected }: StoryVignetteProps) {
  const path = isSelected ? animationPath : '';
  const speed = useSpeed();
  const [isActive, setActive] = useState(false);
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isSelected) {
      timeoutId = setTimeout(() => setActive(true), 1000 * calculateSpeed(speed));
    } else {
      setActive(false);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [animationPath, isSelected]);

  const [lottieRef, setAnimationState] = useLottieAnim();

  const onAnimationLoad = () => {
    if (isActive) {
      setAnimationState(LottieStates.REPLAY);
    }
  };

  useEffect(() => {
    if (isActive) {
      setAnimationState(LottieStates.REPLAY);
    }
  }, [isActive, setAnimationState]);

  return (
    <LottieComponent
      loop={false}
      autoplay={false}
      onLoad={onAnimationLoad}
      path={path}
      renderer="svg"
      className="chapter__anim_wrapper"
      poster={poster}
      ref={lottieRef}
    />
  );
}
export default StoryVignette;
