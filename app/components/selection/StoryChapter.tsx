import { User } from '@prisma/client';
import { SelectionStory } from '~/helpers/story';
import { withTranslation } from 'react-i18next';
import { useEffect } from 'react';
import useComponentLottie from '~/utils/hooks/useComponentLottie';
import InlineSVG from '../InlineSVG';

const lockIconContent = `
<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
 viewBox="0 0 58 58" style="width:100%; height: 100%;">
<path d="M40,21.314V10.22C40,4.585,35.065,0,29,0S18,4.585,18,10.22v11.094C12.584,24.896,9,31.034,9,38c0,11.028,8.972,20,20,20
 s20-8.972,20-20C49,31.034,45.416,24.896,40,21.314z M20,20.157V10.22C20,5.688,24.037,2,29,2s9,3.688,9,8.22v9.938
 c-0.188-0.095-0.38-0.179-0.57-0.268c-0.393-0.184-0.792-0.356-1.198-0.515c-0.261-0.102-0.523-0.198-0.787-0.289
 c-0.26-0.089-0.518-0.178-0.782-0.256c-0.437-0.13-0.879-0.241-1.324-0.341c-0.193-0.043-0.387-0.084-0.582-0.122
 c-0.523-0.101-1.049-0.183-1.579-0.242c-0.12-0.013-0.24-0.021-0.36-0.032C30.213,18.036,29.608,18,29,18s-1.213,0.036-1.816,0.092
 c-0.12,0.011-0.241,0.019-0.36,0.032c-0.53,0.059-1.056,0.141-1.579,0.242c-0.195,0.037-0.389,0.079-0.582,0.122
 c-0.445,0.1-0.887,0.211-1.324,0.341c-0.264,0.078-0.523,0.168-0.782,0.256c-0.264,0.091-0.527,0.187-0.787,0.289
 c-0.407,0.158-0.805,0.331-1.198,0.515C20.38,19.978,20.188,20.062,20,20.157z M33,40c0,2.206-1.794,4-4,4s-4-1.794-4-4v-6
 c0-2.206,1.794-4,4-4s4,1.794,4,4V40z"/>
</svg>
`;

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
              <div
                className="scroller__element__figure__lock__content"
              >
                <figure
                  className="scroller__element__figure__lock__content__figure"
                >
                  <InlineSVG
                    content={lockIconContent}
                    className="anim-color-1"
                  />
                </figure>
                <figcaption
                  className="scroller__element__figure__lock__content__caption"
                >
                  {t('story_locked', { key: 3 - user.games })}
                </figcaption>
              </div>
            </div>
            )}
        </figure>
      </label>
    </div>
  );
}
export default withTranslation('selection')(StoryChapter);
