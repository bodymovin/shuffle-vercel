import LottieComponent from '../Lottie';

export interface StoryVignetteProps {
  poster: string
  animationPath: string
  isSelected: boolean
}

function StoryVignette({ animationPath, poster, isSelected }: StoryVignetteProps) {
  const path = isSelected ? animationPath : '';
  return (
    <LottieComponent
      loop={false}
      autoplay
      path={path}
      renderer="svg"
      className="chapter__anim_wrapper"
      poster={poster}
    />
  );
}
export default StoryVignette;
