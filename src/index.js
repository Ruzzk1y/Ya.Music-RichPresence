const { app, BrowserWindow, Tray, ipcMain } = require('electron');
const Store = require('electron-store')
const store = new Store()
const path = require('path');
const updateServer = require('./modules/websocket')
const { startPresence, getPresence } = require("./modules/presence")
const icon128 = path.join(__dirname, "img/128.ico");
let tray = null;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    show: false,
    width: 350,
    height: 450,
    resizable: false,
    frame: false,
    icon: icon128,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.addListener("blur", mainWindow.hide)
  tray = new Tray(icon128)
  tray.addListener("click", (event, bounds, pos) => {
    mainWindow.setPosition(Math.round(Number(pos.x) / 1.1222), Math.round(Number(pos.y) / 1.78888))
    mainWindow.show();
  })
  updateServer(store.get("ws-port"))
};
app.on('ready', createWindow);

ipcMain.on("startup-state-changed", (e, state) => {
  app.setLoginItemSettings({
    enabled: state,
    openAtLogin: state,
    path: app.getPath("exe")
  });
})

ipcMain.on("port-changed", (e, port) => {
  updateServer(port);
  store.set("ws-port", port);
})

ipcMain.on("clientId-changed", (e, newKey) => {
  startPresence(newKey);
  store.set("clientId", newKey);
})

ipcMain.on("get-startup-state", e => { e.reply("get-startup-state", app.getLoginItemSettings().openAtLogin) }) //this gives cur state to 'checkbox-startup'

ipcMain.on("close", () => { app.quit() })

ipcMain.on("get-current-rich-presence", e => { e.reply("get-current-rich-presence", getPresence()) })
