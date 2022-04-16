import Lottie, {
  AnimationConfigWithData,
  AnimationConfigWithPath,
  AnimationEventCallback,
  AnimationEventName,
  AnimationItem,
  RendererType,
} from 'lottie-web';
import {
  cloneElement,
  createElement,
  HTMLAttributes,
  isValidElement,
  ReactElement, useCallback, useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

type LottieRenderer = 'svg' | 'canvas' | 'html'

export type LottieState = {
  duration: number;
  paused: boolean;
  time: number;
  playing: boolean;
}

export type LottieSegment = {
  segment: any // TODO: fix this
}

type LottieEventListeners = {
  onComplete?: () => void;
  onLoad?: () => void;
}

export type LottieSettings = {
  path?: string,
  animationString?: string,
  loop?: boolean,
  autoplay?: boolean,
  renderer?: LottieRenderer,
  className?: string
  direction?: 1 | -1
  poster?: string | null,
  segment?: LottieSegment
}

export type LottieControls = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  goToAndPlay: (val: number, isFrame: boolean) => void;
  goToAndStop: (val: number, isFrame: boolean) => void;
  setSpeed: (num: number) => void;
  loadAnimation: (settings: LottieSettings) => void;
  onComplete: () => void;
  onLoad: () => void;
}

type LottieConfigType =
  AnimationConfigWithPath<RendererType> | AnimationConfigWithData<RendererType> | null

export type ElOrPropsType = HTMLAttributes<any> | ReactElement<HTMLAttributes<any>> | null

function buildConfig(
  props: LottieSettings | null,
  container: any,
): LottieConfigType {
  if (props && container) {
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
  }
  return null;
}

function getContainer(elOrProps: ElOrPropsType, containerRef: any) {
  let containerElement: ReactElement | null = null;
  let props: any;
  if (isValidElement(elOrProps)) {
    containerElement = elOrProps;
    props = containerElement.props;
  } else {
    props = elOrProps;
  }
  let container;
  if (containerElement) {
    container = cloneElement(containerElement, {
      ...props,
      ref: containerRef,
    });
  } else {
    container = createElement('div', {
      ...props,
      ref: containerRef,
    });
  }
  return container;
}

function addListenersToAnimation(animation: AnimationItem, listeners: LottieEventListeners) {
  if (listeners.onComplete) {
    animation.addEventListener('complete', listeners.onComplete);
  }
  if (listeners.onLoad) {
    animation.addEventListener('DOMLoaded', listeners.onLoad);
  }
}

export default function useLottie(
  lottieSettings: LottieSettings,
  elOrProps: ElOrPropsType = null,
): [
  any /* TODO: look into this type */,
  LottieControls,
  AnimationItem | null,
] {
  const [settings, setSettings] = useState<LottieSettings | null>(null);
  const [currentContainer, setCurrentContainer] = useState(null);

  const containerRef = useRef(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const settingsRef = useRef<LottieSettings | null>(null);
  const eventListenersRef = useRef<LottieEventListeners>({});

  const container: ReactElement | null = getContainer(elOrProps, containerRef);

  const updateSettings = (newSettings: LottieSettings) => {
    settingsRef.current = newSettings;
    setSettings(settingsRef.current);
  };

  useEffect(() => {
    const config = buildConfig(settings, currentContainer);
    if (currentContainer && config) {
      animationRef.current = Lottie.loadAnimation(config);
      addListenersToAnimation(animationRef.current, eventListenersRef.current);
    }
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [currentContainer, settings]);

  useEffect(() => {
    if (!settingsRef.current) {
      updateSettings(lottieSettings);
    }
    /* TODO: this doesn't work if functions are passed since they are different
    on each render. For now, updated settings will not create a new instance

    if (lottieSettings) {
      const hasChanged = Object.keys(lottieSettings).some(
        (key: any) => lottieSettings[key] !== settingsRef.current[key], // TODO: fix this
      );
      if (hasChanged) {
        updateSettings(lottieSettings);
      }
    }++
    */
  }, [lottieSettings]);

  // useEffect(() => {
  //   if (animationRef.current) {
  //     Object.keys(eventListeners).forEach((key: string) => {
  //       animationRef.current[key] = eventListeners[key];
  //     });
  //   }
  // }, [eventListeners, animationRef]);

  // This effect tests if the rendered DOM element has changed and needs to
  // reload the animation
  useLayoutEffect(() => {
    if (currentContainer !== containerRef.current) {
      setCurrentContainer(containerRef.current);
    }
  });

  const controls = {
    play: () => {
      if (animationRef.current) {
        animationRef.current.play();
      }
    },
    pause: () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    },
    stop: () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    },
    goToAndPlay: (position: number, isFrame: boolean) => {
      if (animationRef.current) {
        animationRef.current.goToAndPlay(position, isFrame);
      }
    },
    goToAndStop: (position: number, isFrame: boolean) => {
      if (animationRef.current) {
        animationRef.current.goToAndStop(position, isFrame);
      }
    },
    setSpeed: (speed: number) => {
      if (animationRef.current) {
        animationRef.current.setSpeed(speed);
      }
    },
    loadAnimation: (newSettings: LottieSettings) => updateSettings(newSettings),
    addEventListener: (eventName: AnimationEventName, callback: AnimationEventCallback) => {
      if (animationRef.current) {
        animationRef.current.addEventListener(eventName, callback);
      }
    },
    set onComplete(callback: () => void) {
      if (animationRef.current) {
        animationRef.current.removeEventListener('complete', eventListenersRef.current.onComplete);
        animationRef.current.addEventListener('complete', callback);
      }
      eventListenersRef.current.onComplete = callback;
    },
    set onLoad(callback: () => void) {
      if (animationRef.current) {
        animationRef.current.removeEventListener('DOMLoaded', eventListenersRef.current.onComplete);
        animationRef.current.addEventListener('DOMLoaded', callback);
      }
      eventListenersRef.current.onLoad = callback;
    },
  };

  return [container, controls, animationRef.current];
}
