const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const Store = require('electron-store');
const viewsStorage = new Store();

window.loggedInUserId = null;
window.loggedInUser = null;
window.playerTimeoutInstance = null;
window.storySets = null;
window.storySetsById = null;
