function renderStorySets (storySets) {
  const storySetsContainer = document.querySelector('.stories');
  storySetsContainer.innerHTML = "";
  storySets.forEach((storySet, index) => {
    const coverImage = storySet._params.user.profile_pic_url;
    const username = storySet._params.user.username;
    const seenClass = storySet._params.seen === storySet._params.latestReelMedia ? 'seen' : 'not-seen';
    const storySetDom = dom(
      `<div class="stories-item center">
        <img src="${coverImage}" class="thumb ${seenClass}">
        <div class="username">${username}</div>
      <div/>`
    );

    storySetDom.onclick = () => {
      // todo try to detect the last storySet item seen and start from there
      playStories(storySets, index, 0);
    }
    storySetsContainer.appendChild(storySetDom);
  });

  if (document.querySelector('.story.hide')) {
    // story is hidden, then most likely this the first time the page is loaded
    // so we will display the lading view
    document.querySelector('.landing-view').classList.remove('hide');
  }
}

function renderStorySetView(storySets, storySetIndex, itemIndex) {
  document.querySelector('.landing-view').classList.add('hide');

  const storySet = storySets[storySetIndex];
  document.querySelector('.story').classList.remove('hide');
  const time = formatTime(storySet._params.items[itemIndex].taken_at)
  const title = `${storySet._params.user.username} (${time})`
  document.querySelector('.story .title').textContent = title;

  const viewDom = document.querySelector('.story .view');
  viewDom.innerHTML = '';
  const item = storySet._params.items[itemIndex];
  if (item.video_versions) {
    const videoDom = dom(
      `<video controls autoplay src="${item.video_versions[0].url}">`
    );
    viewDom.appendChild(videoDom);
    videoDom.oncanplay = () => document.querySelector('.story').scrollIntoView();
  } else {
    const imgDom = dom(`<img src="${item.image_versions2.candidates[0].url}">`);
    viewDom.appendChild(imgDom);
    imgDom.onload = () => document.querySelector('.story').scrollIntoView();
  }

  const playFromNext = () => {
    const nextIndices = getNextIndices(storySets, storySetIndex, itemIndex);
    if (nextIndices.storySetIndex !== -1) {
      playStories(storySets, nextIndices.storySetIndex, nextIndices.itemIndex);
    }
  }

  // handle "previous" button
  document.querySelector('.story button.prev').onclick = () => {
    const prevIndices = getPrevIndices(storySets, storySetIndex, itemIndex);
    if (prevIndices.storySetIndex !== -1) {
      playStories(storySets, prevIndices.storySetIndex, prevIndices.itemIndex);
    }
  }

  // handle "next" button
  document.querySelector('.story button.next').onclick = playFromNext;

  // hande pause/play buttons
  document.querySelector('button.play').onclick = playFromNext;
  document.querySelector('button.pause').classList.remove('hide');
  document.querySelector('button.play').classList.add('hide');
  document.querySelector('button.pause').onclick = () => stopPlayingStories();

  renderTimeline(storySet, itemIndex);
}

function renderTimeline(storySet, itemIndex) {
  const timelineDom = document.querySelector('.story .timeline');
  timelineDom.innerHTML = '';
  storySet._params.items.forEach((item, index) => {
    const value = index < itemIndex ? 100 : 0;
    const active = index === itemIndex ? 'active' : '';
    timelineDom.appendChild(dom(
      `<div class="timeline-item ${active}">
          <progress max="100" value="${value}"></progress>
        </div>`
      )
    );
  });
  playTimelineProgress();
}
