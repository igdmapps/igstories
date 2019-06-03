const app = require('electron').app
const { openExternal } = require('electron').shell

const template = [
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { openExternal('http://igdm.me/igstories') }
      },
      {
        label: 'Report an issue',
        click() { openExternal('https://github.com/ifedapoolarewaju/igstories/issues/new') }
      },
      {
        label: 'Star this project (Show us some love. 🙂)',
        click () { openExternal('https://github.com/ifedapoolarewaju/igstories/stargazers') }
      },
      {
        label: 'Donate to this Project',
        click() { openExternal('http://paypal.me/SolomonOmojola') }
      },
      {
        label: 'Tweet about IG:Stories',
        click() {
          openExternal('https://twitter.com/intent/tweet?original_referer=https%3A%2F%2Figdm.me%2F&ref_src=twsrc%5Etfw&text=Anonymous%20Instagram%20Stories%20on%20your%20computer&tw_p=tweetbutton&url=https%3A%2F%2Figdm.me%2Figstories%2F')
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })

  // Edit menu
  template[1].submenu.push(
    {type: 'separator'},
    {
      label: 'Speech',
      submenu: [
        {role: 'startspeaking'},
        {role: 'stopspeaking'}
      ]
    }
  )

  // Window menu
  template[3].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
}

module.exports = template
