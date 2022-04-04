import { Prisma, Story } from '@prisma/client';
import { db } from './db.server';

// 1: Define a type that includes the relation to `Chapters`
const storyWithChapters = Prisma.validator<Prisma.StoryArgs>()({
  include: { chapters: true },
});

// 3: This type will include a user and all their chapters
export type StoryWithChapters = Prisma.StoryGetPayload<typeof storyWithChapters>

export const findStories = async (storyIds: string[]): Promise<StoryWithChapters[]> => {
  const stories = await db.story.findMany({
    where: {
      id: { in: storyIds },
    },
    include: {
      chapters: true,
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
