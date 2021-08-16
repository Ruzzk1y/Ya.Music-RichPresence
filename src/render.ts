import { ipcRenderer } from "electron";
import Store = require("electron-store");
import { DiscordRichPresence } from "./types/declarations";
const store = new Store();
const infobox = document.getElementById("infobox") as HTMLParagraphElement;
const port_input = document.getElementById("input-port") as HTMLInputElement;
const clientId_input = document.getElementById(
  "input-clientId"
) as HTMLInputElement;
const startup_switch = document.getElementById(
  "checkbox-startup"
) as HTMLInputElement;
const showfavorites_switch = document.getElementById(
  "checkbox-showfavorites"
) as HTMLInputElement;

const rpe = {
  title: document.getElementById("rpexample-title"),
  description: document.getElementById("rpexample-description"),
  timestamp: document.getElementById("rpexample-timestamp"),
};

port_input.value = String(store.get("ws-port") || 51972);
port_input.addEventListener("change", e => {
  let target = e.target as HTMLInputElement;
  if (Number(target.value) > 0 && Number(target.value) < 65536) {
    infobox.textContent = "Port set to " + target.value;
    return ipcRenderer.send("port-changed", target.value);
  } else {
    infobox.textContent = "Port must be greater than 0 and less than 65536";
  }
});

clientId_input.value = String(store.get("clientId") || "");
clientId_input.addEventListener("change", e => {
  let target = e.target as HTMLInputElement;
  ipcRenderer.send("clientId-changed", target.value);
  infobox.textContent = "Client ID set to " + target.value;
});

ipcRenderer.on("get-startup-state", (e, state) => {
  startup_switch.checked = state;
});
ipcRenderer.send("get-startup-state");
startup_switch.addEventListener("change", e => {
  let target = e.target as HTMLInputElement;
  ipcRenderer.send("startup-state-changed", target.checked);
});

ipcRenderer.on("get-showfavorites-state", (e, state) => {
  showfavorites_switch.checked = state;
});
ipcRenderer.send("get-showfavorites-state");
showfavorites_switch.addEventListener("change", e => {
  let target = e.target as HTMLInputElement;
  ipcRenderer.send("showfavorites-state-changed", target.checked);
});

document.getElementById("button-exitapp").addEventListener("click", () => {
  ipcRenderer.send("close", true);
});

setInterval(() => {
  ipcRenderer.send("get-current-rich-presence", true);
}, 1e3);

ipcRenderer.on("get-current-rich-presence", (e, rp: DiscordRichPresence) => {
  if (!rp || !rp.hasOwnProperty("details") || !rp.hasOwnProperty("state"))
    return (rpe.title.textContent = "Presence isn't running.");
  rpe.title.textContent = rp.details;
  rpe.description.textContent = rp.state;
  rpe.timestamp.textContent = getTime(rp.startTimestamp) + " elapsed";
});

function getTime(timestamp: number): string {
  let diff = Number(new Date()) - Number(new Date(timestamp * 1000));
  var minutes = Math.floor(diff / 60000);
  var seconds = Number(((diff % 60000) / 1000).toFixed(0));
  return String(minutes) + ":" + String((seconds < 10 ? "0" : "") + seconds);
}
