import { AnimationItem } from 'lottie-web';
import { useEffect, useRef } from 'react';
import LottieComponent, { LottieComponentProps } from '../Lottie';

interface TextLottieProps extends LottieComponentProps {
  text?: string
}

function TextLottie(props: TextLottieProps) {
  const {
    path,
    animationString,
    loop,
    autoplay,
    renderer,
    onComplete,
    className,
    direction,
    poster,
    text,
  } = props;

  const containerAnimation = useRef<AnimationItem | null>(null);

  const onLoad = (anim: AnimationItem | null) => {
    containerAnimation.current = anim;
    if (text && containerAnimation.current) {
      containerAnimation.current.renderer.elements[0].updateDocumentData({ t: text });
    }
  };

  useEffect(() => {
    if (containerAnimation.current) {
      containerAnimation.current.renderer.elements[0].updateDocumentData({ t: text });
      if (text) {
        containerAnimation.current.goToAndPlay(0);
      } else {
        containerAnimation.current.goToAndStop(100000);
      }
    }
  }, [text]);

  return (
    <LottieComponent
      path={path}
      animationString={animationString}
      loop={false}
      autoplay={false}
      renderer={renderer}
      onComplete={onComplete}
      onLoad={onLoad}
      className={className}
      direction={direction}
      poster={poster}
    />
  );
}

TextLottie.defaultProps = {
  text: '',
};

export default TextLottie;
