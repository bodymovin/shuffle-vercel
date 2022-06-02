import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { errorCodes } from '~/helpers/constants/prisma';
import { db } from './db.server';

type UserStory = {
  userId: string
  storyId: string
}

const getStoryByUserIdAndStoryId = async (
  userId: string,
  storyId: string,
): Promise<UserStory | null> => (
  db.userStory.findFirst({
    where: {
      storyId,
      userId,
    },
  })
);

export const create = async (userId: string, storyId: string):Promise<UserStory | null> => {
  try {
    const userStory = await db.userStory.create({
      data: {
        userId,
        storyId,
      },
    });
    return userStory;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === errorCodes.UNIQUE_CONSTRAINT_FAILED) {
        const userStory = await getStoryByUserIdAndStoryId(userId, storyId);
        if (!userStory) {
          throw new Error('No user story');
        }
        return userStory;
      }
    } else {
      throw error;
    }
  }
  return null;
};
