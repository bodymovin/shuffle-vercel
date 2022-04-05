import { useEffect, useState } from 'react';
import {
  ActionFunction, LoaderFunction, redirect, json,
} from '@remix-run/node';
import {
  useLoaderData, Form,
} from '@remix-run/react';
import { bodyParser } from 'remix-utils';
import ChapterButton from '~/components/selection/ChapterButton';
import SubmitButton from '~/components/selection/SubmitButton';
import { ChapterToContent, ChapterStrings, ChapterNavigation } from '~/interfaces/chapters';
import { User } from '@prisma/client';
import { getUser, getUserById, updateUser } from '~/utils/user.server';
import { getSessionFromRequest, commitSession } from '~/sessions';
import StoryChapter from '~/components/selection/StoryChapter';
import { getUserPrefsFromRequest, updateUserPrefs, UserPrefs } from '~/cookies';
import { getSelectionChapterButtons, getSelectionChapterAnimationForStory, getSelectionChapterPathForStory } from '../../helpers/animationData';
import { Chapters } from '../../helpers/enums/chapters';
import {
  getStories, getUserStoryForChapterFromRequest, SelectionStory,
} from '../../helpers/story';
import { getSelectionSubTitleByChapter, getSelectionTitleByChapter } from '../../helpers/textData';

const getChapterFromRequest = (request: Request): ChapterStrings => {
  const urlData = new URL(request.url);
  const path = urlData.pathname;
  const partParts = path.split('/');
  if (Object.prototype.hasOwnProperty.call(Chapters, partParts[partParts.length - 1])) {
    // TODO: improve this
    return partParts[partParts.length - 1] as ChapterStrings;
  }
  throw redirect(`/selection/${Chapters.character}`, 302);
};

export interface SelectionUserData {
  currentChapter: ChapterStrings
  selectedStoryId: string
  chapterPaths: ChapterToContent
  title: string
  subtitle: string
  stories: SelectionStory[]
  user: User,
}

export const loader: LoaderFunction = async ({ request }):Promise<any> => {
  const session = await getSessionFromRequest(request);
  const user = await getUser(request);
  //
  const chapter = getChapterFromRequest(request);
  const stories = await getStories();
  const selectedStoryId = await getUserStoryForChapterFromRequest(chapter, request, stories);
  const selectionStories = await Promise.all(
    await stories
      .map(async (story) => (
        {
          id: story.id,
          title: story.title,
          enabled: story.free || (user && user.games >= 3),
          path: selectedStoryId === story.id ? '' : (await getSelectionChapterPathForStory(story.path, chapter)),
          animation: selectedStoryId === story.id ? JSON.stringify(await getSelectionChapterAnimationForStory(story.path, chapter)) : '',
        }
      )),
  );
  return json(
    {
      currentChapter: chapter,
      chapterPaths: await getSelectionChapterButtons(),
      title: await getSelectionTitleByChapter(chapter),
      subtitle: await getSelectionSubTitleByChapter(chapter),
      selectedStoryId,
      stories: selectionStories,
      user,
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    },
  );
};

export const action: ActionFunction = async ({ request }) => {
  const body: any = await bodyParser.toJSON(request);
  // eslint-disable-next-line no-undef
  const headers: HeadersInit = {};
  const userPrefs: UserPrefs = await getUserPrefsFromRequest(request);
  if (body.story) {
    const chapter = getChapterFromRequest(request);
    // const storyChapter = {
    //   [chapter]: body.story,
    // };
    userPrefs[chapter] = body.story;
    // const serializedCookie = await setUserStory(storyChapter, request);
    // headers['Set-Cookie'] = serializedCookie;
  }
  if (body.toStory) {
    const session = await getSessionFromRequest(request);
    const userId = session.get('userId');
    if (userId) {
      const user = await getUserById(userId);
      if (user) {
        user.games += 1;
        await updateUser(user);
      }
    } else {
      userPrefs.games = userPrefs.games ? userPrefs.games + 1 : 1;
    }
  }
  // TODO: review if it makes sense avoid updating the cookie when not needed
  const serializedCookie = await updateUserPrefs(request, userPrefs);
  headers['Set-Cookie'] = serializedCookie;
  const redirectPath = body.redirect ? `selection/${body.redirect}` : 'story';
  return redirect(redirectPath, {
    headers,
  });
};

function buildChaptersNavigation(chapterPaths: ChapterToContent, currentChapter: ChapterStrings) {
  const chapters: ChapterNavigation[] = [
    {
      id: Chapters.character,
      path: 'character',
      name: 'Character',
    },
    {
      id: Chapters.partner,
      path: 'partner',
      name: 'Partner',
    },
    {
      id: Chapters.object,
      path: 'object',
      name: 'Object',
    },
    {
      id: Chapters.vehicle,
      path: 'vehicle',
      name: 'Vehicle',
    },
    {
      id: Chapters.path,
      path: 'path',
      name: 'Path',
    },
    {
      id: Chapters.destination,
      path: 'destination',
      name: 'Destination',
    },
  ];
  return chapters.map((chapter) => (
    <ChapterButton
      key={chapter.id}
      chapter={chapter}
      currentChapter={currentChapter}
      path={chapterPaths[chapter.id]}
    />
  ));
}

function View() {
  const {
    chapterPaths,
    currentChapter,
    title,
    subtitle,
    selectedStoryId,
    stories,
    user,
  } = useLoaderData<SelectionUserData>();
  const [currentStoryId, setStoryId] = useState(selectedStoryId);
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    setStoryId(selectedStoryId);
    setIsFirst(true);
  }, [currentChapter, selectedStoryId]);

  const navigateToNextStory = (direction: number) => {
    const currentStoryIndex = stories.findIndex((story) => story.id === currentStoryId);
    if (currentStoryIndex > 0 && direction === -1) {
      setStoryId(stories[currentStoryIndex - 1].id);
    } else if (currentStoryIndex < stories.length - 1 && direction === 1) {
      setStoryId(stories[currentStoryIndex + 1].id);
    }
    setIsFirst(false);
  };

  const currentStoryIndex = stories.findIndex((story) => story.id === currentStoryId);

  return (
    <Form
      method="post"
      action={`/selection/${currentChapter}`}
      className="wrapper"
    >
      <article
        className="container"
      >
        <header
          className="header"
        >
          <h1 className="header--title">{title}</h1>
          <h2 className="header--subtitle">{subtitle}</h2>
        </header>
        <main
          className="main"
        >
          <button
            type="button"
            onClick={(ev) => { ev.preventDefault(); navigateToNextStory(-1); }}
            className="story__navigation"
            disabled={currentStoryIndex <= 0}
          >
            <svg
              viewBox="0 0 54.01 106.02"
              className="story__navigation__icon story__navigation__icon--flipped"
            >
              <polyline
                points="1,1 53.01,53.01 1,105.02"
              />
            </svg>
          </button>
          <div
            className="story-container"
            key={currentChapter}
          >
            <div
              className={`story-container__scroller ${isFirst ? '' : 'story-container__scroller--animated'}`}
              style={{ transform: `translate(${-100 * currentStoryIndex}%, 0)` }}
            >
              {stories.map((story) => (
                <StoryChapter
                  key={story.id}
                  story={story}
                  selectedStoryId={selectedStoryId}
                  user={user}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={(ev) => { ev.preventDefault(); navigateToNextStory(1); }}
            className="story__navigation"
            disabled={currentStoryIndex >= stories.length - 1}
          >
            <svg
              viewBox="0 0 54.01 106.02"
              className="story__navigation__icon"
            >
              <polyline
                points="1,1 53.01,53.01 1,105.02"
              />
            </svg>
          </button>
        </main>
        <footer
          className="footer"
        >
          {buildChaptersNavigation(chapterPaths, currentChapter)}
          <SubmitButton
            id="story"
            value="story"
            isSelected={false}
            name="toStory"
            path="/routed/assets/selection/read_button_3.json"
          />
        </footer>
      </article>
    </Form>
  );
}
export default View;
