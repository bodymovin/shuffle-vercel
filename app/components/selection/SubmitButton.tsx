import { useEffect, useState } from 'react';
import LottieComponent, { LottieSegment } from '../Lottie';

export interface ChapterButtonProps {
  path: string
  value: string
  id: string
  isSelected: boolean
  name?: string
  ariaLabel: string
  segment?: LottieSegment
}

function SubmitButton({
  value, path, isSelected, id, name = 'redirect', ariaLabel, segment,
}: ChapterButtonProps) {
  const [localSegment, setLocalSegment] = useState(segment);

  useEffect(() => {
    setLocalSegment(segment);
  }, [segment]);

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
      <LottieComponent
        loop={false}
        autoplay
        path={path}
        renderer="svg"
        direction={isSelected ? 1 : -1}
        segment={localSegment}
        className="footer__chapter-button__animation"
      />
    </button>
  );
}

SubmitButton.defaultProps = {
  name: '',
  segment: null,
};

export default SubmitButton;
