import type { SelectionStory } from '~/helpers/story';
import type { User } from '~/interfaces/user';
import { withTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import useComponentLottie from '~/utils/hooks/useComponentLottie';
import GamePaywall from './story_paywalls/GamePaywall';
import PaidPaywall from './story_paywalls/PaidPaywall';

interface StoryChapterProps {
  story: SelectionStory
  selectedStoryId: string
  isFocused: boolean
  user: User
}

function renderPaywall(story: SelectionStory, user: User) {
  if (story.payMode === 'games') {
    return (
      <GamePaywall
        story={story}
        playedGames={user.games}
      />
    );
  }
  return (
    <PaidPaywall
      story={story}
    />
  );
}

function renderSelectableStory(
  story: SelectionStory,
  selectedStoryId: string,
  lottieElement: React.ReactElement<any>,
) {
  return (
    <>
      <input
        className="scroller__element__input"
        key={`${story.id}__input`}
        type="radio"
        id={`radio_${story.id}`}
        name="story"
        value={story.id}
        defaultChecked={selectedStoryId === story.id}
      />
      <label
        htmlFor={`radio_${story.id}`}
        key={`${story.id}__label`}
        className="scroller__element__label"
        id={`story-selection-${story.id}`}
      >
        <figure className="scroller__element__figure">
          <div
            className="scroller__element__figure__border"
          />
          {lottieElement}
        </figure>
      </label>
    </>
  );
}

function renderLockedStory(
  story: SelectionStory,
  lottieElement: React.ReactElement<any>,
  user: User,
) {
  return (
    <div
      key={`${story.id}__label`}
      className="scroller__element__label"
      id={`story-selection-${story.id}`}
    >
      <figure className="scroller__element__figure">
        <div
          className="scroller__element__figure__border"
        />
        {lottieElement}
        <div className="scroller__element__figure__lock">
          <div
            className="scroller__element__figure__lock__background"
          />
          {renderPaywall(story, user)}
        </div>
      </figure>
    </div>
  );
}

function StoryChapter(props: StoryChapterProps) {
  const {
    story,
    selectedStoryId,
    user,
    isFocused,
  } = props;
  const isLocked = !story.enabled;
  const classNames = ['scroller__element'];
  if (isLocked) {
    classNames.push('scroller__element--disabled');
  }

  const [lottieElement, lottieControls] = useComponentLottie({
    loop: false,
    autoplay: isFocused,
    path: story.path,
    animationString: story.animation,
    renderer: 'svg',
    className: 'scroller__element__figure__animation',
  });

  useEffect(() => {
    if (lottieControls) {
      if (isFocused) {
        lottieControls.replay();
      } else {
        lottieControls.goToAndStop(0);
      }
    }
  }, [isFocused, lottieControls]);

  return (
    <div key={story.id} className={classNames.join(' ')}>
      {isLocked
        ? renderLockedStory(story, lottieElement, user)
        : renderSelectableStory(story, selectedStoryId, lottieElement)}
    </div>
  );
}
export default withTranslation('selection')(StoryChapter);
