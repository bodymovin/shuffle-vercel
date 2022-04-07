import { ChapterToContent } from '~/interfaces/chapters';
import { Chapters } from '../enums/chapters';

export const chaptersAriaLabels: ChapterToContent = {
  [Chapters.character]: 'chapter_button_character_aria',
  [Chapters.partner]: 'chapter_button_partner_aria',
  [Chapters.object]: 'chapter_button_object_aria',
  [Chapters.vehicle]: 'chapter_button_vehicle_aria',
  [Chapters.path]: 'chapter_button_path_aria',
  [Chapters.destination]: 'chapter_button_destination_aria',
};
