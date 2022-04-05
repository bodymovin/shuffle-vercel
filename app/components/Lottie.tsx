// import Lottie from 'lottie-web/build/player/lottie_worker';
import Lottie from 'lottie-web';
import type {
  AnimationItem, AnimationConfigWithPath, AnimationConfigWithData,
} from 'lottie-web/build/player/lottie';
import { useEffect, useRef, useState } from 'react';
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

function LottieComponent(props: LottieComponentProps) {
  const {
    onComplete,
    onLoad,
    poster,
    direction,
    animationString,
    path,
    className,
  } = props;

  const containerElem = useRef(null);
  const containerAnimation = useRef<AnimationItem | null>(null);
  const [isLoaded, setLoaded] = useState(false);

  const onDomLoaded = () => {
    if (containerAnimation.current && direction) {
      containerAnimation.current.setDirection(direction);
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
    if (containerAnimation.current && direction) {
      containerAnimation.current.setDirection(direction);
      containerAnimation.current.play();
    }
  }, [direction]);

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
}

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

export default LottieComponent;
