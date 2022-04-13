import { Chapter } from '@prisma/client';
import {
  LinkDescriptor,
  LoaderFunction,
} from '@remix-run/node';
import {
  Link, useLoaderData, useLocation,
} from '@remix-run/react';
import StoryVignette from '~/components/story/StoryVignette';
import { getUserPrefsFromRequest } from '~/cookies';
import { Chapters } from '~/helpers/enums/chapters';
import { chaptersAriaLabels } from '~/helpers/texts/story';
import { ChapterStrings, ChapterToContent } from '~/interfaces/chapters';
import styles from '~/styles/story.css';
import { getSelectedChapterPaths, getSelectedPosters, getSelectedStories, StoryWithChapters } from '~/utils/stories.server';
import { i18n } from '~/i18n.server';
import { TFunction, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { DynamicLinksFunction } from 'remix-utils';

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

const dynamicLinks: DynamicLinksFunction<UserStoryData> = ({ data }):
  LinkDescriptor[] => {
  if (!data.animationPaths) {
    return [];
  }
  const keys = Object.keys(data.animationPaths);
  const crossOrigin = 'anonymous' as const;
  const dynLinks = keys.map((key) => (
    {
      rel: 'prefetch',
      href: data.animationPaths[key as Chapters],
      type: 'application/json',
      as: 'fetch',
      crossOrigin,
    }));
  return dynLinks;
};

export const handle = {
  dynamicLinks,
};

// eslint-disable-next-line arrow-body-style
const findStoryChapter = (story: StoryWithChapters, chapterType: Chapters): Chapter => {
  return story.chapters.find((chapter) => chapter.type === chapterType)!;
};

export const loader: LoaderFunction = async ({ request }):Promise<UserStoryData> => {
  const userPrefs = await getUserPrefsFromRequest(request);

  // console.log(userPrefs)
  const stories = await getSelectedStories(request);
  const animationPaths = await getSelectedChapterPaths(stories, userPrefs);
  const posters = await getSelectedPosters(stories, userPrefs);

  // TODO: decide what to do if there are no stories still attached to the user
  const defaultStoryId = stories[0].id;

  const translators = (await Promise.all(stories.map(async (story) => {
    // TODO: build locale path in a better way. Probably add it to the db
    const langPath = story.path.substring(story.path.lastIndexOf('/', story.path.lastIndexOf('/') - 1));
    return {
      storyId: story.id,
      translator: await i18n.getFixedT(request, `stories${langPath}story`),
    };
  }))).reduce((translatorsDict: any, translatorData) => (
    {
      ...translatorsDict,
      [translatorData.storyId]: translatorData.translator,
    }
  ), {});
  const texts: ChapterToContent = {
    [Chapters.character]: translators[userPrefs.character || defaultStoryId](Chapters.character),
    [Chapters.partner]: translators[userPrefs.partner || defaultStoryId](Chapters.partner),
    [Chapters.object]: translators[userPrefs.object || defaultStoryId](Chapters.object),
    [Chapters.vehicle]: translators[userPrefs.vehicle || defaultStoryId](Chapters.vehicle),
    [Chapters.path]: translators[userPrefs.path || defaultStoryId](Chapters.path),
    [Chapters.destination]: translators[userPrefs.destination || defaultStoryId](
      Chapters.destination,
    ),
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
      prefetch="intent"
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

// eslint-disable-next-line no-shadow
const enum ComponentStates {
  INIT,
  OPEN,
  CLOSE,
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

  const [componentState, setComponentState] = useState(ComponentStates.INIT);

  const toggleCollapse = () => setComponentState(
    [ComponentStates.CLOSE].includes(componentState)
      ? ComponentStates.OPEN
      : ComponentStates.CLOSE,
  );

  useEffect(() => {
    setComponentState(ComponentStates.INIT);
  }, [currentChapter]);

  const storyChapterContentClasses = [
    'story-chapter__content',
  ];
  if (componentState === ComponentStates.CLOSE) {
    storyChapterContentClasses.push('story-chapter__content--collapsed');
  } else if (componentState === ComponentStates.OPEN) {
    storyChapterContentClasses.push('story-chapter__content--expanded');
  }

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
      </div>
      { currentChapter
      && (
        <div
          className="story-chapter"
          key={currentChapter}
        >
          <div className={storyChapterContentClasses.join(' ')}>
            <div className="story-chapter__collapse">
              <button
                type="button"
                onClick={toggleCollapse}
                className="story-chapter__collapse__button"
                aria-label={t('chapter_story_collapse_button')}
              >
                <span className="story-chapter__collapse__button__icon">↓</span>
              </button>
            </div>
            <span>
              {texts[currentChapter]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
export default StoryComponent;
