import { Prisma, Story } from '@prisma/client';
import { getUserPrefsFromRequest, UserPrefs } from '~/cookies';
import { Chapters } from '~/helpers/enums/chapters';
import { createSVG } from '~/helpers/svgToString';
import { ChapterToContent } from '~/interfaces/chapters';
import { db } from './db.server';

// 1: Define a type that includes the relation to `Chapters`
const storyWithChapters = Prisma.validator<Prisma.StoryArgs>()({
  include: { chapters: true },
});

// 3: This type will include a user and all their chapters
export type StoryWithChapters = Prisma.StoryGetPayload<typeof storyWithChapters>

export const findStories = async (storyIds: string[]): Promise<Story[]> => {
  const stories = await db.story.findMany({
    where: {
      id: { in: storyIds },
    },
  });
  return stories;
};

export const findFirstFreeStory = async (): Promise<Story | null> => {
  const story = await db.story.findFirst({
    where: {
      free: true,
    },
    orderBy: [
      {
        order: 'asc',
      },
    ],
  });
  return story;
};

interface StoriesDictInterface {
  [key: string]: StoryWithChapters,
}

export const getSelectedStories = async (
  request: Request,
): Promise<Story[]> => {
  const userPrefs = await getUserPrefsFromRequest(request);
  const defaultStory = await findFirstFreeStory();
  if (!defaultStory) {
    throw new Error('There are no stories?! What?!!');
  }

  const storiesSet = new Set();
  storiesSet.add(userPrefs.character || defaultStory.id);
  storiesSet.add(userPrefs.partner || defaultStory.id);
  storiesSet.add(userPrefs.object || defaultStory.id);
  storiesSet.add(userPrefs.vehicle || defaultStory.id);
  storiesSet.add(userPrefs.path || defaultStory.id);
  storiesSet.add(userPrefs.destination || defaultStory.id);

  const storyValueIterator = storiesSet.values();
  const storyIds: string[] = Array.from(storyValueIterator) as string[];
  const stories = await findStories(storyIds);
  return stories;
};

export const getSelectedChapterPaths = async (
  stories: Story[],
  userPrefs: UserPrefs,
):Promise<ChapterToContent> => {
  const storiesDict: StoriesDictInterface = stories.reduce((dict: any, story) => {
    // eslint-disable-next-line no-param-reassign
    dict[story.id] = story;
    return dict;
  }, {});

  // TODO: decide what to do if there are no stories still attached to the user
  const defaultStoryId = stories[0].id;

  const animationPaths: ChapterToContent = {
    [Chapters.character]: `/routed${storiesDict[userPrefs.character || defaultStoryId].path}character_highlight.json`,
    [Chapters.partner]: `/routed${storiesDict[userPrefs.partner || defaultStoryId].path}partner_highlight.json`,
    [Chapters.object]: `/routed${storiesDict[userPrefs.object || defaultStoryId].path}object_highlight.json`,
    [Chapters.vehicle]: `/routed${storiesDict[userPrefs.vehicle || defaultStoryId].path}vehicle_highlight.json`,
    [Chapters.path]: `/routed${storiesDict[userPrefs.path || defaultStoryId].path}path_highlight.json`,
    [Chapters.destination]: `/routed${storiesDict[userPrefs.destination || defaultStoryId].path}destination_highlight.json`,
  };
  return animationPaths;
};

export const getSelectedPosters = async (
  stories: Story[],
  userPrefs: UserPrefs,
):Promise<ChapterToContent> => {
  const storiesDict: StoriesDictInterface = stories.reduce((dict: any, story) => {
    // eslint-disable-next-line no-param-reassign
    dict[story.id] = story;
    return dict;
  }, {});

  // TODO: decide what to do if there are no stories still attached to the user
  const defaultStoryId = stories[0].id;

  const posters: ChapterToContent = {
    [Chapters.character]: await createSVG(`${storiesDict[userPrefs.character || defaultStoryId].path}character.svg`),
    [Chapters.partner]: await createSVG(`${storiesDict[userPrefs.partner || defaultStoryId].path}partner.svg`),
    [Chapters.object]: await createSVG(`${storiesDict[userPrefs.object || defaultStoryId].path}object.svg`),
    [Chapters.vehicle]: await createSVG(`${storiesDict[userPrefs.vehicle || defaultStoryId].path}vehicle.svg`),
    [Chapters.path]: await createSVG(`${storiesDict[userPrefs.path || defaultStoryId].path}path.svg`),
    [Chapters.destination]: await createSVG(`${storiesDict[userPrefs.destination || defaultStoryId].path}destination.svg`),
  };
  return posters;
};
