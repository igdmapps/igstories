function getLoggedInUser () {
  ipcRenderer.send('getLoggedInUser');
}

function getAllStories () {
  ipcRenderer.send('getAllStories');
}

// This code runs once the DOM is loaded (just in case you missed it).
document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('loggedInUser', (evt, user) => {
    window.loggedInUserId = user.id;
    window.loggedInUser = user;
    setProfilePic();
  });

  ipcRenderer.on('allStories', (evt, storySetsById) => {
    window.storySets = Object.keys(storySetsById).map((userId) => storySetsById[userId]);
    window.storySets.sort((a, b) => {
      if (lastSeen(b) !== b._params.latestReelMedia && b._params.expiringAt > a._params.expiringAt) {
        return 1
      }

      if (lastSeen(a) !== a._params.latestReelMedia && a._params.expiringAt > b._params.expiringAt) {
        return -1
      }

      return lastSeen(b) !== b._params.latestReelMedia ? 1 : -1;
    })
    renderStorySets(window.storySets);
  });

  ipcRenderer.on('searchResult', (evt, storySetsById) => {
    const storySets = Object.keys(storySetsById).map((userId) => storySetsById[userId]);
    renderStorySets(storySets);
  });

  let searchForm = document.querySelector('.header input[name=search]');
  searchForm.onkeyup = (e) => {
    const value = searchForm.value;
    const trimmedValue = value.trim() 

    if (trimmedValue.length > 3) {
      ipcRenderer.send('searchUsers', searchForm.value)      
    } else if (trimmedValue.length === 0) {
      renderStorySets(window.storySets);
    }
  }

  window.onblur = () => {
    if (window.playerTimeoutInstance) {
      document.querySelector('button.pause').click();
    }
  }

  document.querySelector('#logout').onclick = () => ipcRenderer.send('logout');
  document.querySelector('#reload').onclick = () => ipcRenderer.send('reload');

  getLoggedInUser();
  getAllStories();
});