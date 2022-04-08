// import Lottie from 'lottie-web/build/player/lottie_worker';
import Lottie from 'lottie-web';
import type {
  AnimationItem, AnimationConfigWithPath, AnimationConfigWithData,
} from 'lottie-web/build/player/lottie';
import React, {
  forwardRef, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { Speeds } from '~/interfaces/speeds';
import { useSpeed } from '~/utils/providers/speed-provider';
import InlineSVG from './InlineSVG';

type LottieRenderer = 'svg'

export interface LottieComponentProps {
  path?: string,
  animationString?: string,
  loop?: boolean,
  autoplay?: boolean,
  renderer?: LottieRenderer,
  onComplete?: () => void,
  onLoad?: (anim: AnimationItem | null) => void,
  className?: string
  direction?: 1 | -1
  poster?: string | null,
  segment?: LottieSegment
}

export interface LottieSegment {
  segment: any
}

function getConfig(
  props: LottieComponentProps,
  container: any,
): AnimationConfigWithPath | AnimationConfigWithData | null {
  if (props.path) {
    return {
      container,
      loop: props.loop,
      autoplay: props.autoplay,
      renderer: props.renderer,
      path: props.path,
    };
  }
  if (props.animationString) {
    return {
      container,
      loop: props.loop,
      autoplay: props.autoplay,
      renderer: props.renderer,
      animationData: JSON.parse(props.animationString),
    };
  }
  return null;
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

export type LottieComponentHandle = {
  replay: () => void
  stop: () => void
}

// eslint-disable-next-line react/function-component-definition
const LottieComponent:
  React.ForwardRefRenderFunction<
  LottieComponentHandle,
    // eslint-disable-next-line react/function-component-definition
LottieComponentProps> = (props: LottieComponentProps, ref) => {
  const speed = useSpeed();
  const {
    onComplete,
    onLoad,
    poster,
    direction,
    animationString,
    path,
    className,
    segment,
  } = props;

  const containerElem = useRef(null);
  const containerAnimation = useRef<AnimationItem | null>(null);
  const [isLoaded, setLoaded] = useState(false);

  const onDomLoaded = () => {
    if (containerAnimation.current) {
      containerAnimation.current.setSpeed(calculateSpeed(speed));
      if (direction) {
        containerAnimation.current.setDirection(direction);
      }
    }
    setLoaded(true);
    if (onLoad) {
      onLoad(containerAnimation.current);
    }
  };

  useEffect(() => {
    if (containerElem.current) {
      if (containerAnimation.current) {
        containerAnimation.current.destroy();
      }
      setLoaded(false);
      const config = getConfig(props, containerElem.current);
      if (config) {
        containerAnimation.current = Lottie.loadAnimation(config) as AnimationItem;
        if (onComplete) {
          containerAnimation.current.addEventListener('complete', onComplete);
        }
        containerAnimation.current.addEventListener('DOMLoaded', onDomLoaded);
      }
    }
  }, [animationString, path]);

  useEffect(() => {
    if (containerAnimation.current) {
      containerAnimation.current.setSpeed(calculateSpeed(speed));
    }
  }, [speed]);

  useEffect(() => {
    if (containerAnimation.current && direction) {
      containerAnimation.current.setDirection(direction);
      containerAnimation.current.play();
    }
  }, [direction]);

  useEffect(() => {
    if (segment && containerAnimation.current) {
      containerAnimation.current.playSegments(segment.segment, true);
    }
  }, [segment]);

  useImperativeHandle(ref, () => ({
    replay: () => {
      if (containerAnimation.current) {
        containerAnimation.current.goToAndPlay(0);
      }
    },
    stop: () => {
      if (containerAnimation.current) {
        containerAnimation.current.stop();
      }
    },
  }));

  return (
    <div
      className={`lottie-wrapper ${className}`}
    >
      {!!poster
        && (
        <InlineSVG
          content={poster}
          className={`lottie-poster ${isLoaded ? 'lottie-poster--hidden' : ''}`}
        />
        )}
      <div
        className={`lottie-animation ${isLoaded ? '' : 'lottie-animation--hidden'}`}
        ref={containerElem}
      />
    </div>
  );
};

LottieComponent.defaultProps = {
  autoplay: false,
  loop: false,
  animationString: '',
  path: '',
  onComplete: () => {},
  onLoad: (anim: AnimationItem | null) => {},
  className: '',
  direction: 0,
  poster: null,
  renderer: 'svg',
};

export default forwardRef(LottieComponent);
