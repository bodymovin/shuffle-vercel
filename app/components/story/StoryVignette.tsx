import { useState, useEffect } from 'react';
import { Speeds } from '~/interfaces/speeds';
import { useSpeed } from '~/utils/providers/speed-provider';
import useComponentLottie from '~/utils/hooks/useComponentLottie';

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
  }, [animationPath, isSelected, speed]);

  const [lottieElement, lottieControls] = useComponentLottie({
    loop: false,
    autoplay: false,
    path,
    renderer: 'svg',
    className: 'chapter__anim_wrapper',
    poster,
  });

  useEffect(() => {
    if (isActive) {
      lottieControls.replay();
    }
  }, [isActive, lottieControls]);

  useEffect(() => {
    if (lottieControls) {
      lottieControls.onLoad = () => {
        if (isActive) {
          lottieControls.goToAndPlay(0);
        }
      };
    }
  }, [lottieControls, isActive]);


  return lottieElement;
}
export default StoryVignette;
