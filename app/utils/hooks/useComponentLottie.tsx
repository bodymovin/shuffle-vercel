import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import InlineSVG from '~/components/InlineSVG';
import { LottieSettings, UseLottieReturnType } from './useLottie';
import useShuffleLottie from './useShuffleLottie';

type ComponentLottieSettings = LottieSettings & {
  poster?: string,
  className?: string,
}

type CurrentEventListeners = {
  DOMLoaded?: () => void | null
}

export default function useComponentLottie(
  settings: ComponentLottieSettings,
): UseLottieReturnType {
  const [isLoaded, setLoaded] = useState(false);
  const currentEventListeners = useRef<CurrentEventListeners>({});
  const { className } = settings;
  const lottieContainer = (
    <div
      className={`lottie-animation ${isLoaded ? '' : 'lottie-animation--hidden'}`}
    />
  );
  const [container, controls, animation] = useShuffleLottie(settings, lottieContainer);

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
