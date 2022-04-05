import { ChapterStrings, ChapterNavigation } from '~/interfaces/chapters';
import SubmitButton from './SubmitButton';

export interface ChapterButtonProps {
  path: string
  chapter: ChapterNavigation
  currentChapter: ChapterStrings
}

function ChapterButton({ chapter, currentChapter, path }: ChapterButtonProps) {
  const isSelected = currentChapter === chapter.id;
  return (
    <SubmitButton
      id={chapter.id}
      isSelected={isSelected}
      path={path}
      value={chapter.path}
      name='redirect'
      ariaLabel={chapter.name}
    />
  );
}
export default ChapterButton;
