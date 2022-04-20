import { AnimationItem } from 'lottie-web';
import {
  ReactElement,
  useCallback, useEffect, useRef, useState,
} from 'react';
import InlineSVG from '~/components/InlineSVG';
import { Speeds } from '~/interfaces/speeds';
import { useSpeed } from '../providers/speed-provider';
import useLottie, { LottieControls, LottieSettings } from './useLottie';

type ComponentLottieSettings = LottieSettings & {
  poster?: string,
  className?: string,
}

type CurrentEventListeners = {
  DOMLoaded?: () => void | null
}

type SpeedToData = {
  // eslint-disable-next-line no-unused-vars
  [key in Speeds]: number;
};

const calculateSpeed = (speed: Speeds) => {
  const speeds:SpeedToData = {
    slow: 0.33,
    medium: 1,
    fast: 3,
    static: 999999999,
  };
  return speeds[speed] || speeds.medium;
};

export default function useComponentLottie(
  settings: ComponentLottieSettings,
): [
  ReactElement /* TODO: look into this type */,
  LottieControls,
  AnimationItem | null,
] {
  const [isLoaded, setLoaded] = useState(false);
  const currentEventListeners = useRef<CurrentEventListeners>({});
  const { className } = settings;
  const lottieContainer = (
    <div
      className={`lottie-animation ${isLoaded ? '' : 'lottie-animation--hidden'}`}
    />
  );
  const [container, controls, animation] = useLottie(settings, lottieContainer);
  const speed = useSpeed();

  const onAnimationLoaded = useCallback(() => {
    setLoaded(true);
  }, [setLoaded]);

  useEffect(() => {
    if (animation) {
      if (currentEventListeners.current && currentEventListeners.current.DOMLoaded) {
        animation.removeEventListener('DOMLoaded', currentEventListeners.current.DOMLoaded);
      }
      if (animation.isLoaded) {
        onAnimationLoaded();
      } else {
        animation.addEventListener('DOMLoaded', onAnimationLoaded);
        currentEventListeners.current.DOMLoaded = onAnimationLoaded;
      }
    }
  }, [animation, onAnimationLoaded]);

  useEffect(() => {
    if (controls) {
      controls.setSpeed(calculateSpeed(speed));
    }
  }, [speed, controls]);

  useEffect(() => {
    if (!settings.path && !settings.animationString && isLoaded) {
      setLoaded(false);
    }
  }, [settings, isLoaded]);

  const compContainer = (
    <div
      className={`lottie-wrapper ${className}`}
    >
      {
        !!settings.poster
        && (
          <InlineSVG
            content={settings.poster}
            className={`lottie-poster ${isLoaded ? 'lottie-poster--hidden' : ''}`}
          />
        )
      }
      {container}
    </div>
  );

  return [compContainer, controls, animation];
}
