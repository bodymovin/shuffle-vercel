import { useEffect } from 'react';
import { ChapterStrings, ChapterNavigation } from '~/interfaces/chapters';
import useLottie, { LottieSegmentTypes } from '~/utils/hooks/useLottie';

export interface ChapterButtonProps {
  path: string
  chapter: ChapterNavigation
  currentChapter: ChapterStrings
}

const segment: LottieSegmentTypes = [0, 25];

function ChapterButton({ chapter, currentChapter, path }: ChapterButtonProps) {
  const isSelected = currentChapter === chapter.id;
  const [lottieElement, lottieControls] = useLottie(
    {
      loop: false,
      autoplay: false,
      path,
      renderer: 'svg',
      direction: isSelected ? 1 : -1,
    },
    {
      className: 'footer__chapter-button__animation',
    },
  );

  useEffect(() => {
    if (lottieControls && segment) {
      lottieControls.playSegments(isSelected
        ? segment : [segment[1] as number, segment[0] as number], true);
    }
  }, [isSelected, segment]);

  useEffect(() => {
    if (lottieControls) {
      lottieControls.onLoad = () => {
        if (isSelected) {
          lottieControls.goToAndStop(segment![1] as number, true);
        } else {
          lottieControls.goToAndStop(segment![0] as number, true);
        }
      };
    }
  }, [lottieControls]);
  return (
    <button
      key={chapter.id}
      type="submit"
      name="redirect"
      className={`footer__chapter-button ${isSelected ? 'footer__chapter-button--selected' : ''}`}
      value={chapter.path}
      aria-label={chapter.name}
    >
      {lottieElement}
    </button>
  );
}
export default ChapterButton;
