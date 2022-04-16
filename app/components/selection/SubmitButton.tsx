import { useEffect, useState } from 'react';
import useLottie, { LottieSegmentTypes } from '~/utils/hooks/useLottie';

export interface ChapterButtonProps {
  path: string
  value: string
  id: string
  isSelected: boolean
  name?: string
  ariaLabel: string
  segment?: LottieSegmentTypes
}

function SubmitButton({
  value, path, isSelected, id, name = 'redirect', ariaLabel, segment,
}: ChapterButtonProps) {
  const [localSegment, setLocalSegment] = useState(segment);

  const buttonContainer = (
    <button
      key={id}
      type="submit"
      name={name}
      className={`footer__chapter-button ${isSelected ? 'footer__chapter-button--selected' : ''}`}
      value={value}
      aria-label={ariaLabel}
      onMouseOver={() => localSegment && setLocalSegment({ ...localSegment })}
      onFocus={() => localSegment && setLocalSegment({ ...localSegment })}
    />
  );

  const [lottieElement, lottieControls] = useLottie(
    {
      loop: false,
      autoplay: true,
      path,
      renderer: 'svg',
      direction: isSelected ? 1 : -1,
    },
    {
      className: 'footer__chapter-button__animation',
    },
  );

  useEffect(() => {
    if (localSegment) {
      lottieControls.playSegments(localSegment);
    }
  }, [lottieControls, localSegment]);

  useEffect(() => {
    if (lottieControls) {
      lottieControls.setDirection(isSelected ? 1 : -1);
    }
  }, [isSelected, lottieControls]);
  return (
    <button
      key={id}
      type="submit"
      name={name}
      className={`footer__chapter-button ${isSelected ? 'footer__chapter-button--selected' : ''}`}
      value={value}
      aria-label={ariaLabel}
      onMouseOver={() => localSegment && setLocalSegment({ ...localSegment })}
      onFocus={() => localSegment && setLocalSegment({ ...localSegment })}
    >
      {lottieElement}
    </button>
  );
}

SubmitButton.defaultProps = {
  name: '',
  segment: null,
};

export default SubmitButton;
