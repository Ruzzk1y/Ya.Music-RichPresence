import { app, BrowserWindow, Tray, ipcMain } from "electron";
import { startPresence, getPresence } from "./modules/presence";
import updateServer from "./modules/websocket";
import path = require("path");
import Store = require("electron-store");
import { ElectronWindowPosition } from "./types/types";
const store = new Store();
const icon128 = path.join(__dirname, "img/128.ico");
let tray: Tray;

//For tests:
require("electron-reload")(__dirname, {
  electron: path.join(app.getPath("exe")),
});

if (require("electron-squirrel-startup")) {
  app.quit();
}

if (process.platform === "win32") {
  //Fixes flickering on showup: https://github.com/electron/electron/issues/22691
  app.commandLine.appendSwitch("wm-window-animations-disabled");
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
    },
  });
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.addListener("blur", mainWindow.hide);
  tray = new Tray(icon128);

  tray.addListener("click", (ev, b, pos: ElectronWindowPosition) => {
    mainWindow.setPosition(
      Math.round(pos.x / 1.1222),
      Math.round(pos.y / 1.78888)
    );
    mainWindow.show();
  });
  updateServer(Number(store.get("ws-port")));
};
app.on("ready", createWindow);

ipcMain.on("startup-state-changed", (e, state: boolean) => {
  app.setLoginItemSettings({
    enabled: state,
    openAtLogin: state,
    path: app.getPath("exe"),
  });
});

ipcMain.on("port-changed", (e, port: number) => {
  updateServer(port);
  store.set("ws-port", port);
});

ipcMain.on("clientId-changed", (e, newKey: string) => {
  startPresence(newKey);
  store.set("clientId", newKey);
});

ipcMain.on("get-startup-state", e => {
  e.reply("get-startup-state", app.getLoginItemSettings().openAtLogin);
});

ipcMain.on("close", () => {
  app.quit();
});

ipcMain.on("get-current-rich-presence", e => {
  e.reply("get-current-rich-presence", getPresence());
});
