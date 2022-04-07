import { Chapter } from '@prisma/client';
import {
  LoaderFunction,
} from '@remix-run/node';
import {
  Link, useLoaderData, useLocation,
} from '@remix-run/react';
import StoryVignette from '~/components/story/StoryVignette';
import { getUserPrefsFromRequest } from '~/cookies';
import { Chapters } from '~/helpers/enums/chapters';
import { createSVG } from '~/helpers/svgToString';
import { chaptersAriaLabels } from '~/helpers/texts/story';
import { ChapterStrings, ChapterToContent } from '~/interfaces/chapters';
import styles from '~/styles/story.css';
import { findFirstFreeStory, findStories, StoryWithChapters } from '~/utils/stories.server';
import { i18n } from '~/i18n.server';
import { TFunction, useTranslation } from 'react-i18next';

const getChapterFromPath = (path: string): ChapterStrings | null => {
  const partParts = path.split('/');
  const chapterPart = partParts[partParts.length - 1];
  if (Object.prototype.hasOwnProperty.call(Chapters, chapterPart)) {
    // TODO: improve this
    return chapterPart as ChapterStrings;
  }
  return null;
};

interface UserStoryData {
  posters: ChapterToContent
  animationPaths: ChapterToContent
  texts: ChapterToContent
  i18n: any
}

interface StoriesDictInterface {
  [key: string]: StoryWithChapters,
}

// eslint-disable-next-line arrow-body-style
const findStoryChapter = (story: StoryWithChapters, chapterType: Chapters): Chapter => {
  return story.chapters.find((chapter) => chapter.type === chapterType)!;
};

export const loader: LoaderFunction = async ({ request }):Promise<UserStoryData> => {
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

  // console.log(userPrefs)
  const storyValueIterator = storiesSet.values();
  const storyIds: string[] = Array.from(storyValueIterator) as string[];
  const stories = await findStories(storyIds);
  const storiesDict: StoriesDictInterface = stories.reduce((dict: any, story) => {
    // eslint-disable-next-line no-param-reassign
    dict[story.id] = story;
    return dict;
  }, {});

  // TODO: decide what to do if there is no stories still attached to the user
  const defaultStoryId = stories[0].id;

  const posters: ChapterToContent = {
    [Chapters.character]: await createSVG(`${storiesDict[userPrefs.character || defaultStoryId].path}character.svg`),
    [Chapters.partner]: await createSVG(`${storiesDict[userPrefs.partner || defaultStoryId].path}partner.svg`),
    [Chapters.object]: await createSVG(`${storiesDict[userPrefs.object || defaultStoryId].path}object.svg`),
    [Chapters.vehicle]: await createSVG(`${storiesDict[userPrefs.vehicle || defaultStoryId].path}vehicle.svg`),
    [Chapters.path]: await createSVG(`${storiesDict[userPrefs.path || defaultStoryId].path}path.svg`),
    [Chapters.destination]: await createSVG(`${storiesDict[userPrefs.destination || defaultStoryId].path}destination.svg`),
  };
  const animationPaths: ChapterToContent = {
    [Chapters.character]: `/routed${storiesDict[userPrefs.character || defaultStoryId].path}character_highlight.json`,
    [Chapters.partner]: `/routed${storiesDict[userPrefs.partner || defaultStoryId].path}partner_highlight.json`,
    [Chapters.object]: `/routed${storiesDict[userPrefs.object || defaultStoryId].path}object_highlight.json`,
    [Chapters.vehicle]: `/routed${storiesDict[userPrefs.vehicle || defaultStoryId].path}vehicle_highlight.json`,
    [Chapters.path]: `/routed${storiesDict[userPrefs.path || defaultStoryId].path}path_highlight.json`,
    [Chapters.destination]: `/routed${storiesDict[userPrefs.destination || defaultStoryId].path}destination_highlight.json`,
  };
  const texts: ChapterToContent = {
    [Chapters.character]: findStoryChapter(
      storiesDict[userPrefs.character || defaultStoryId],
      Chapters.character,
    ).text,
    [Chapters.partner]: findStoryChapter(
      storiesDict[userPrefs.partner || defaultStoryId],
      Chapters.partner,
    ).text,
    [Chapters.object]: findStoryChapter(
      storiesDict[userPrefs.object || defaultStoryId],
      Chapters.object,
    ).text,
    [Chapters.vehicle]: findStoryChapter(
      storiesDict[userPrefs.vehicle || defaultStoryId],
      Chapters.vehicle,
    ).text,
    [Chapters.path]: findStoryChapter(
      storiesDict[userPrefs.path || defaultStoryId],
      Chapters.path,
    ).text,
    [Chapters.destination]: findStoryChapter(
      storiesDict[userPrefs.destination || defaultStoryId],
      Chapters.destination,
    ).text,
  };
  return {
    posters,
    animationPaths,
    texts,
    i18n: await i18n.getTranslations(request, ['index', 'story']),
  };
};

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: styles,
    },
  ];
}

function buildChapterButton(
  chapter: ChapterStrings,
  animationPaths: ChapterToContent,
  posters: ChapterToContent,
  currentChapter: ChapterStrings | null,
  t: TFunction<'story'>,
) {
  const animationPath = animationPaths[chapter];
  const link = `/story/${chapter}`;
  const isSelected = chapter === currentChapter;
  const hasChapterSelected = !!currentChapter;
  const poster = posters[chapter];
  let className = `chapter chapter__${chapter}`;
  if (isSelected) {
    className += ` chapter__${chapter}--selected chapter--selected`;
  } else if (hasChapterSelected) {
    className += ' chapter--unselected';
  }
  return (
    <Link
      key={chapter}
      to={link}
      className={className}
      aria-label={t(chaptersAriaLabels[chapter])}
    >
      <div className="chapter__background" />
      <div className="chapter__anim">
        <StoryVignette
          poster={poster}
          animationPath={animationPath}
          isSelected={isSelected}
        />
      </div>
      <div className="chapter__border" />
    </Link>
  );
}

function StoryComponent() {
  const location = useLocation();
  const currentChapter = getChapterFromPath(location.pathname);
  const { posters, animationPaths, texts } = useLoaderData<UserStoryData>();
  const buttons = [
    Chapters.character,
    Chapters.partner,
    Chapters.object,
    Chapters.vehicle,
    Chapters.path,
    Chapters.destination,
  ];
  const { t } = useTranslation('story');
  return (
    <div className="wrapper">
      <div className="container">
        {buttons.map((chapter) => buildChapterButton(
          chapter,
          animationPaths,
          posters,
          currentChapter,
          t,
        ))}
        { currentChapter
        && (
          <div
            className="story-chapter"
            key={currentChapter}
          >
            {texts[currentChapter]}
          </div>
        )}
      </div>
    </div>
  );
}
export default StoryComponent;
