import { ChapterToContent } from '~/interfaces/chapters';
import { Chapters } from '../enums/chapters';

export const chaptersAriaLabels: ChapterToContent = {
  [Chapters.character]: 'Read character chapter',
  [Chapters.partner]: 'Read partner chapter',
  [Chapters.object]: 'Read object chapter',
  [Chapters.vehicle]: 'Read vehicle chapter',
  [Chapters.path]: 'Read path chapter',
  [Chapters.destination]: 'Read destination chapter',
};
