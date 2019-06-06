const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const menuTemplate = require('./menutemplate');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const instagram = require('./instagram');
const autoUpdater = require('./autoupdater');
const Store = require('electron-store');

// avoid TLS warning
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let session

function createWindow () {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      width: 400,
      maxWidth: 700,
      height: 800,
      icon: `${__dirname}/../browser/img/icon.png`,
      webPreferences: {
        nodeIntegration: true
      }
    })
  }
  mainWindow.setTitle('IGStories - Instagram Stories')

  instagram.checkAuth(session).then((result) => {
    let view = result.isLoggedIn ? '../browser/index.html' : '../browser/login.html'
    session = result.session || session

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, view),
      protocol: 'file:',
      slashes: true
    }))
  })

  mainWindow.on('closed', () => mainWindow = null)
}

function createCheckpointWindow() {
  const checkpointWindow = new BrowserWindow({
    width: 300,
    height: 300,
    resizable: false,
    icon: `${__dirname}/../browser/img/icon.png`,
    webPreferences: {
      nodeIntegration: true
    }
  })
  checkpointWindow.setTitle('IG:Stories - Instagram verification code')
  checkpointWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../browser/checkpoint.html'),
    protocol: 'file:',
    slashes: true
  }))
  return checkpointWindow
}

function handleCheckpoint (checkpointError) {
  return new Promise((resolve, reject) => {
    instagram.startCheckpoint(checkpointError)
      .then((challenge) => {
        const cpWindow = createCheckpointWindow()
        electron.ipcMain.on('checkpointCode', (evt, data) => {
          electron.ipcMain.removeAllListeners('checkpointCode')
          cpWindow.close()
          challenge.code(data.code).then(resolve).catch(reject)
        })
      }).catch(reject)
  })
}

// fixes this issue https://github.com/electron/electron/issues/10864
app.setAppUserModelId('com.ifedapoolarewaju.desktop.igstories')

app.on('ready', () => {
  createWindow();
  // only set the menu template when in production mode/
  // this also leaves the dev console enabled when in dev mode.
  if (!process.defaultApp) {
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu); 
  }
  autoUpdater.init();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // only call createWindow afeter mainWindow is set to null at
  // mainWindow.on('closed')
  if (mainWindow === null) createWindow()
})

electron.ipcMain.on('login', (evt, data) => {
  if(data.username === "" || data.password === "") {
    return mainWindow.webContents.send('loginError', "Please enter all required fields");
  }
  const login = (keepLastSession) => {
    instagram.login(data.username, data.password, keepLastSession).then((session_) => {
      session = session_
      createWindow()
    }).catch((error) => {
      if (instagram.isCheckpointError(error)) {
        handleCheckpoint(error)
          .then(() => login(true))
          .catch(() => mainWindow.webContents.send('loginError', getErrorMsg(error)))
      } else {
        mainWindow.webContents.send('loginError', getErrorMsg(error));
      }
    })
  }

  const getErrorMsg = (error) => {
    let message = 'An unknown error occurred.';
    if (error.message) {
      message = error.message;
    } else if (error.hasOwnProperty('json') && !!error.json.two_factor_required) {
      message = 'You have two factor authentication enabled. Two factor authentication is not yet supported.';
    }
    return message
  }

  login()
})

electron.ipcMain.on('logout', () => {
  instagram.logout();
  (new Store()).clear()
  session = null
  createWindow()
})

electron.ipcMain.on('reload', () => {
  mainWindow.reload()
})

electron.ipcMain.on('getLoggedInUser', () => {
  instagram.getLoggedInUser(session).then((user) => {
    mainWindow.webContents.send('loggedInUser', user);
  })
})

electron.ipcMain.on('getAllStories', () => {
  instagram.getAllStories(session).then((stories) => {
    mainWindow.webContents.send('allStories', stories);
  })
})

electron.ipcMain.on('searchUsers', (_, search) => {
  instagram.searchUsers(session, search).then((stories) => {
    mainWindow.webContents.send('searchResult', stories);
  })
})
