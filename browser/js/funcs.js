function format (number) {
  return number > 9 ? "" + number: "0" + number;
}

function formatTime (time) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let date = new Date(time * 1000);
  let hours = format(date.getHours());
  let minutes = format(date.getMinutes());
  let day = format(date.getDate());
  let month = MONTHS[date.getMonth()];
  return `${day} ${month} ${hours}:${minutes}`
}

function dom(content) {
  var template = document.createElement('template');
  template.innerHTML = content;
  return template.content.firstChild;
}

function setProfilePic () {
  const url = window.loggedInUser._params.profilePicUrl;
  const settingsButton = document.querySelector('.settings');
  settingsButton.style.backgroundImage = `url(${url})`;
}

function getNextIndices(storySets, storySetIndex, itemIndex) {
  const itemsLength = storySets[storySetIndex]._params.items.length;
  if (itemIndex >= itemsLength - 1) {
    itemIndex = 0;
    storySetIndex = storySets.length - 1 <= storySetIndex ? -1 : storySetIndex + 1;
  } else {
    itemIndex++;
  }

  return { itemIndex, storySetIndex }
}

function getPrevIndices(storySets, storySetIndex, itemIndex) {
  if (itemIndex <= 0) {
    if (storySetIndex <= 0) {
      storySetIndex = -1;
    } else {
      storySetIndex--;
      const prevItemsLength = storySets[storySetIndex]._params.items.length;
      itemIndex = prevItemsLength - 1;
    }
  } else {
    itemIndex--;
  }

  return { itemIndex, storySetIndex }
}

function stopPlayingStories () {
  if (window.playerTimeoutInstance) {
    clearTimeout(window.playerTimeoutInstance);
  }
}

function playStories (storySets, storySetIndex, itemIndex) {
  // end any currently running stories player
  stopPlayingStories();

  const play = () => {
    renderStorySetView(storySets, storySetIndex, itemIndex);
    let duration = storySets[storySetIndex]._params.items[itemIndex].video_duration;
    // additional 5 secs to video duration to make for download lag
    duration = (duration || 15) + 5;

    const nextIndices = getNextIndices(storySets, storySetIndex, itemIndex);
    storySetIndex = nextIndices.storySetIndex;
    itemIndex = nextIndices.itemIndex;

    if (storySetIndex === -1) {
      // stories have ended
      return;
    }

    window.playerTimeoutInstance = setTimeout(play, duration * 1000);
  }
  play();
}

function playTimelineProgress () {
  const progressDom = document.querySelector(
    '.timeline .timeline-item.active progress'
  );
  const play = () => {
    if (!progressDom || progressDom.value >= 100) {
      return;
    }

    // fill progress of "100" in 20 seconds
    progressDom.value += 0.25;
    setTimeout(play, 50);
  }
  play();
}
