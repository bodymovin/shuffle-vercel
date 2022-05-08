import {
  AnimationConfigWithData,
  AnimationConfigWithPath,
  AnimationEventCallback,
  AnimationEventName,
  AnimationItem,
  AnimationSegment,
  RendererType,
  SVGRendererConfig,
} from 'lottie-web';
import Lottie, {
} from 'lottie-web/build/player/lottie_worker';
import {
  cloneElement,
  createElement,
  HTMLAttributes,
  isValidElement,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type LottieRenderer = 'svg' | 'canvas' | 'html'

type PlayDirection = 1 | -1;

export type LottieState = {
  duration: number;
  paused: boolean;
  time: number;
  playing: boolean;
}

export type LottieSegmentTypes = AnimationSegment | AnimationSegment[]

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
  direction?: PlayDirection,
  poster?: string | null,
  segment?: LottieSegmentTypes,
  rendererSettings?: SVGRendererConfig,
}

export type LottieControls = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  goToAndPlay: (val: number, isFrame?: boolean) => void;
  goToAndStop: (val: number, isFrame?: boolean) => void;
  addEventListener: (eventName: AnimationEventName, callback: AnimationEventCallback) => void;
  removeEventListener: (eventName: AnimationEventName, callback: AnimationEventCallback) => void;
  replay: () => void;
  setSpeed: (num: number) => void;
  setDirection: (direction: PlayDirection) => void;
  loadAnimation: (settings: LottieSettings) => void;
  onComplete: () => void;
  onLoad: () => void;
  playSegments: (segments: LottieSegmentTypes, forceFlag?: boolean) => void;
  setText: (text: string, position: (string|number)[]) => void;
}

type LottieConfigType =
  AnimationConfigWithPath<RendererType> | AnimationConfigWithData<RendererType> | null

export type ElOrPropsType = HTMLAttributes<any> | ReactElement<HTMLAttributes<any>> | null

export type UseLottieReturnType = [
  ReactElement,
  LottieControls | null,
  AnimationItem | null,
]

function buildConfig(
  props: LottieSettings | null,
  container: HTMLElement | null,
): LottieConfigType {
  if (props && container) {
    if (props.path) {
      return {
        container,
        loop: props.loop,
        autoplay: props.autoplay,
        renderer: props.renderer || 'svg',
        path: props.path,
        rendererSettings: props.rendererSettings,
      };
    }
    if (props.animationString) {
      return {
        container,
        loop: props.loop,
        autoplay: props.autoplay,
        renderer: props.renderer || 'svg',
        animationData: JSON.parse(props.animationString),
        rendererSettings: props.rendererSettings,
      };
    }
  }
  return null;
}

function getContainer(
  elOrProps: ElOrPropsType,
  containerRef: any,
) {
  let containerElement: ReactElement | null = null;
  let props: HTMLAttributes<any> | null;
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
): UseLottieReturnType {
  const [settings, setSettings] = useState<LottieSettings | null>(null);
  const [currentContainer, setCurrentContainer] = useState<HTMLElement | null>(null);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationItem | null>(null);

  const animationRef = useRef<AnimationItem | null>(null);
  const settingsRef = useRef<LottieSettings | null>(null);
  const controlsRef = useRef<LottieControls | null>(null);
  const eventListenersRef = useRef<LottieEventListeners>({});

  const setRef = useCallback((node) => {
    if (currentContainer !== node) {
      setCurrentContainer(node);
    }
  }, []);

  const container: ReactElement | null = getContainer(elOrProps, setRef);

  const updateSettings = (newSettings: LottieSettings) => {
    settingsRef.current = newSettings;
    setSettings(settingsRef.current);
  };

  useEffect(() => {
    const config = buildConfig(settings, currentContainer);
    if (currentContainer && config) {
      animationRef.current = Lottie.loadAnimation(config);
      setCurrentAnimation(animationRef.current);
      addListenersToAnimation(animationRef.current!, eventListenersRef.current);
    }
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [currentContainer, settings]);

  useEffect(() => {
    if (!settingsRef.current) {
      updateSettings(lottieSettings);
    } else if (settingsRef.current.path !== lottieSettings.path) {
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

  useEffect(() => {
    controlsRef.current = {
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
      replay: () => {
        if (animationRef.current) {
          animationRef.current.goToAndPlay(0);
        }
      },
      goToAndPlay: (position: number, isFrame: boolean = false) => {
        if (animationRef.current) {
          animationRef.current.goToAndPlay(position, isFrame);
        }
      },
      goToAndStop: (position: number, isFrame: boolean = false) => {
        if (animationRef.current) {
          animationRef.current.goToAndStop(position, isFrame);
        }
      },
      playSegments: (segments: LottieSegmentTypes, forceFlag: boolean = false) => {
        if (animationRef.current) {
          animationRef.current.playSegments(segments, forceFlag);
        }
      },
      setSpeed: (speed: number) => {
        if (animationRef.current) {
          animationRef.current.setSpeed(speed);
        }
      },
      setDirection: (direction: PlayDirection) => {
        if (animationRef.current) {
          animationRef.current.setDirection(direction);
          if (animationRef.current.isPaused) {
            animationRef.current.play();
          }
        }
      },
      setText: (text: string, path: (string|number)[]) => {
        // TODO: Consider validating the second condition.
        // It is not working for lottie_worker since isLoaded does not exist.
        if (animationRef.current /* && animationRef.current.isLoaded */) {
          animationRef.current.updateDocumentData(path, {
            t: text,
          });
        }
      },
      loadAnimation: (newSettings: LottieSettings) => updateSettings(newSettings),
      addEventListener: (eventName: AnimationEventName, callback: AnimationEventCallback) => {
        if (animationRef.current) {
          animationRef.current.addEventListener(eventName, callback);
        }
      },
      removeEventListener: (eventName: AnimationEventName, callback: AnimationEventCallback) => {
        if (animationRef.current) {
          animationRef.current.removeEventListener(eventName, callback);
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
          // if (animationRef.current.isLoaded) {
          //   callback();
          // }
          animationRef.current.removeEventListener('DOMLoaded', eventListenersRef.current.onComplete);
          animationRef.current.addEventListener('DOMLoaded', callback);
        }
        eventListenersRef.current.onLoad = callback;
      },
    };
  }, [currentAnimation]);

  return [container, controlsRef.current, currentAnimation];
}
