/**
 * This is the first script run by the app, it is called the main process.
 * It is basically responsible for creating windows (pages) and listening to app
 * events. It can communicate with the window renderer process (renderer.js)
 * via the Remote module or IPC.
 */

/**
 * Electron module
 * @type {object}
 * @see http://electron.atom.io/docs/
 */
const electron = require('electron')

/**
 * Controls app event lifecycle
 * @type {object}
 * @see http://electron.atom.io/docs/api/app/
 */
const app = electron.app
app.commandLine.appendSwitch('--enable-viewport-meta', 'true')
/**
 * Creates a new app window.
 * @class
 * @see http://electron.atom.io/docs/api/browser-window/
 */
const BrowserWindow = electron.BrowserWindow

/**
 * Creates native menus.
 * @class
 * @see http://electron.atom.io/docs/api/menu/
 */
const Menu = electron.Menu

let mainWindow = null

/**
 * Creates the app menus
 * @return undefined
 */
function createMenus() {
  // build application menus
  const appName = electron.app.getName()

  const menuTemplate = [{
    label: appName,
    submenu: [{
      label: `About ${appName}`,
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      click: _ => {
        app.quit()
      },
      accelerator: 'CommandOrControl+Q'
    }, {
      label: 'Open Dev tools',
      click: _ => {
        mainWindow.openDevTools();
      }
    }]
  }]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

/**
 * Creates the main app window
 * @return undefined
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    title: app.getName()
  })
  mainWindow.loadURL(`file://${__dirname}/../index.html`)
  mainWindow.maximize()
  // mainWindow.openDevTools()
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
  createMenus()
});

app.on('window-all-closed', () => {
  /* On macOS it is common for applications and their menu bar
   to stay active until the user quits explicitly with Cmd + Q
   */
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  /* On macOS it's common to re-create a window in the app when the
   dock icon is clicked and there are no other windows open.
   */
  if (mainWindow === null) {
    createWindow()
  }
})