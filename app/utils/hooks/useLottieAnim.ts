import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import { LottieComponentHandle } from '~/components/Lottie';

export enum LottieStates {
  IDLE,
  REPLAY,
  STOP,
}

export const useLottieAnim = ():[
  RefObject<LottieComponentHandle>,
  Dispatch<SetStateAction<LottieStates>>] => {
  const lottieRef = useRef<LottieComponentHandle>(null);
  const [currentState, setState] = useState(LottieStates.IDLE);

  useEffect(() => {
    if (lottieRef.current) {
      if (currentState === LottieStates.REPLAY) {
        lottieRef.current.replay();
        setState(LottieStates.IDLE);
      } else if (currentState === LottieStates.STOP) {
        lottieRef.current.stop();
      }
    }
  }, [currentState, lottieRef]);
  return [lottieRef, setState];
};
