import { Chapters } from '~/helpers/enums/chapters';

export type ChapterStrings = keyof typeof Chapters;

export type ChapterToContent = {
  // eslint-disable-next-line no-unused-vars
  [key in Chapters]: string
}

export interface ChapterNavigation {
  id: ChapterStrings
  path: string
  name: string
}
