const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

window.loggedInUserId = null;
window.loggedInUser = null;
window.playerTimeoutInstance = null;
window.storySets = null;
window.storySetsById = null;
