import { AnimationItem } from 'lottie-web';
import { useCallback, useEffect } from 'react';
import { Speeds } from '~/interfaces/speeds';
import { useSpeed } from '../providers/speed-provider';
import useLottie, { ElOrPropsType, LottieSettings, UseLottieReturnType } from './useLottie';

type SpeedToData = {
  // eslint-disable-next-line no-unused-vars
  [key in Speeds]: number;
};

const calculateSpeed = (speed: Speeds) => {
  const speeds:SpeedToData = {
    slow: 0.33,
    medium: 1,
    fast: 3,
    static: 99999,
  };
  return speeds[speed] || speeds.medium;
};

// eslint-disable-next-line no-shadow
export enum PreferredStaticFrame {
  LAST,
  FIRST,
}

type ShuffleLottieSettings = {
  preferredStaticFrame: PreferredStaticFrame
}

const defaultShuffleLottieSettings = {
  preferredStaticFrame: PreferredStaticFrame.LAST,
};

const getFrame = (anim: AnimationItem | null, setting: PreferredStaticFrame) => {
  if (anim) {
    if (anim?.playDirection === -1) {
      return (setting === PreferredStaticFrame.LAST) ? 0 : anim.totalFrames - 1;
    }
    return (setting === PreferredStaticFrame.LAST) ? anim.totalFrames - 1 : 0;
  }
  return 0;
};

const useShuffleLottie = (
  settings: LottieSettings,
  elOrProps: ElOrPropsType,
  shuffleSettings?: ShuffleLottieSettings,
): UseLottieReturnType => {
  const speed = useSpeed();
  const [lottieElem, lottieControls, animationItem] = useLottie(settings, elOrProps);
  const enterFrameCallback = useCallback(() => {
    const preferredStaticFrame = shuffleSettings?.preferredStaticFrame
      ? shuffleSettings?.preferredStaticFrame
      : defaultShuffleLottieSettings.preferredStaticFrame;
    if (lottieControls) {
      lottieControls.removeEventListener('enterFrame', enterFrameCallback);
      lottieControls.goToAndStop(
        getFrame(animationItem, preferredStaticFrame),
        true,
      );
    }
  }, [lottieControls, animationItem, shuffleSettings?.preferredStaticFrame]);
  useEffect(() => {
    if (lottieControls) {
      if (speed === Speeds.STATIC) {
        lottieControls.addEventListener('enterFrame', enterFrameCallback);
      } else {
        lottieControls.setSpeed(calculateSpeed(speed));
        lottieControls.removeEventListener('enterFrame', enterFrameCallback);
      }
    }
    return () => {
      if (lottieControls) {
        lottieControls.removeEventListener('enterFrame', enterFrameCallback);
      }
    };
  }, [speed, enterFrameCallback, lottieControls]);
  return [lottieElem, lottieControls, animationItem];
};

export default useShuffleLottie;
