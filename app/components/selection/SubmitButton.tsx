import LottieComponent from '../Lottie';

export interface ChapterButtonProps {
  path: string
  value: string
  id: string
  isSelected: boolean
  name?: string
}

function SubmitButton({
  value, path, isSelected, id, name = 'redirect',
}: ChapterButtonProps) {
  return (
    <button
      key={id}
      type="submit"
      name={name}
      className={`footer__chapter-button ${isSelected ? 'footer__chapter-button--selected' : '' }`}
      value={value}
    >
      <LottieComponent
        loop={false}
        autoplay
        path={path}
        renderer="svg"
        direction={isSelected ? 1 : -1}
      />
    </button>
  );
}

SubmitButton.defaultProps = {
  name: '',
};

export default SubmitButton;
