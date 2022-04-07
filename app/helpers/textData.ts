import { ChapterStrings, ChapterToContent } from '~/interfaces/chapters';

const chapterTitles: ChapterToContent = {
  character: 'chapter_title_character',
  partner: 'chapter_title_partner',
  object: 'chapter_title_object',
  vehicle: 'chapter_title_vehicle',
  path: 'chapter_title_path',
  destination: 'chapter_title_destination',
};

const chapterSubtitles: ChapterToContent = {
  character: 'chapter_subtitle_character',
  partner: 'chapter_subtitle_partner',
  object: 'chapter_subtitle_object',
  vehicle: 'chapter_subtitle_vehicle',
  path: 'chapter_subtitle_path',
  destination: 'chapter_subtitle_destination',
};

export const getSelectionTitleByChapter = async (chapter: ChapterStrings): Promise<string> => (
  chapterTitles[chapter]
);

export const getSelectionSubTitleByChapter = async (chapter: ChapterStrings): Promise<string> => (
  chapterSubtitles[chapter]
);
