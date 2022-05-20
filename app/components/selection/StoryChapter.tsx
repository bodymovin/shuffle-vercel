import { SelectionStory } from '~/helpers/story';
import { User } from '~/interfaces/user';
import { withTranslation } from 'react-i18next';
import { useEffect } from 'react';
import useComponentLottie from '~/utils/hooks/useComponentLottie';
import GamePaywall from './story_paywalls/GamePaywall';


interface StoryChapterProps {
  story: SelectionStory
  selectedStoryId: string
  isFocused: boolean
  user: User
  t: any
}

function StoryChapter(props: StoryChapterProps) {
  const {
    story,
    selectedStoryId,
    user,
    t,
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
      <input
        className="scroller__element__input"
        key={`${story.id}__input`}
        type="radio"
        id={`radio_${story.id}`}
        name="story"
        disabled={isLocked}
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
          {isLocked
            && (
            <div className="scroller__element__figure__lock">
              <div
                className="scroller__element__figure__lock__background"
              />
              <GamePaywall
                story={story}
                playedGames={user.games}
              />
            </div>
            )}
        </figure>
      </label>
    </div>
  );
}
export default withTranslation('selection')(StoryChapter);
