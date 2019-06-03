const Client = require('instagram-private-api').V1;
const utils = require('./utils');

exports.checkAuth = function (session) {
  return new Promise((resolve, reject) => {
    if (!session) {
      const device = utils.getDevice();
      const storage = utils.getCookieStorage();
      if (!device || !storage) {
        return resolve({ isLoggedIn: false });
      }
      session = new Client.Session(device, storage);
    }

    session.getAccountId()
      .then(() => resolve({ isLoggedIn: true, session }))
      .catch(Client.Exceptions.CookieNotValidError, () => resolve({ isLoggedIn: false }))
  });
}

exports.login = function (username, password, keepLastSession) {
  if (!keepLastSession) {
    utils.clearCookieFiles();
  }
  return new Promise((resolve, reject) => {
    const device = utils.getDevice(username);
    const storage = utils.getCookieStorage(`${username}.json`);
    Client.Session.create(device, storage, username, password).then(resolve).catch(reject)
  })
}

exports.logout = function () {
  utils.clearCookieFiles();
}

exports.isCheckpointError = (error) => {
  return (error instanceof Client.Exceptions.CheckpointError)
}

exports.startCheckpoint = (error) => {
  return Client.Web.Challenge.resolve(error, 'email')
}

exports.getAllStories = (session) => {
  return new Promise((resolve, reject) => {
    new Client.Feed.StoryTray(session).get()
      .then((storySets) => {
        const userIds = storySets.map((storySet) => `${storySet._params.user.pk}`)
        const fullStorySets = {}
        const loadFullStories = () => {
          new Client.Feed.UserStory(session, userIds.splice(0, 50)).get()
          .then((stories) => {
            Object.assign(fullStorySets, stories)
            userIds.length ? loadFullStories() : resolve(fullStorySets)
          })
          .catch(reject)
        }

        loadFullStories()
      })
      .catch(reject)
  })
}

exports.searchUsers = function (session, search) {
  return new Promise((resolve, reject) => {
    Client.Account.search(session, search)
      .then((users) => {
        const userIds = users.map((user) => user.id);
        new Client.Feed.UserStory(session, userIds.splice(0, 50)).get()
          .then(resolve).catch(reject);
      })
      .catch(reject)
  })
}

exports.getLoggedInUser = function (session) {
  return new Promise((resolve, reject) => {
    session.getAccountId().then((id) => {
      Client.Account.getById(session, id).then(resolve).catch(reject);
    });
  });
}
