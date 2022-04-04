import { ChapterStrings, ChapterToContent } from '~/interfaces/chapters';

const chapterTitles: ChapterToContent = {
  character: 'The Adventurer',
  partner: 'The Partner',
  object: 'The Object',
  vehicle: 'The Vehicle',
  path: 'The Path',
  destination: 'The Destination',
};

const chapterSubtitles: ChapterToContent = {
  character: 'An intrepid hero',
  partner: 'A curious companion',
  object: 'A useful device',
  vehicle: 'A peculiar ride',
  path: 'A perilous road',
  destination: 'A place to explore',
};

export const getSelectionTitleByChapter = async (chapter: ChapterStrings): Promise<string> => (
  chapterTitles[chapter]
);

export const getSelectionSubTitleByChapter = async (chapter: ChapterStrings): Promise<string> => (
  chapterSubtitles[chapter]
);
