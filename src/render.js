const { ipcRenderer } = require("electron");
const Store = require('electron-store');
const store = new Store();
const infobox = document.getElementById("infobox");
const port_input = document.getElementsByClassName("input-port")[0];
const clientId_input = document.getElementsByClassName("input-clientId")[0];
const startup_switch = document.getElementById("checkbox-startup");
const rpe = {
    title: document.getElementById("rpexample-title"),
    description: document.getElementById("rpexample-description"),
    timestamp: document.getElementById("rpexample-timestamp"),
}

port_input.value = store.get("ws-port") || 51972;
port_input.addEventListener("change", (e) => {
    if (Number(e.target.value) > 0 && Number(e.target.value) < 65536) {
        infobox.textContent = "Port set to " + e.target.value
        return ipcRenderer.send("port-changed", e.target.value);
    }
    else { infobox.textContent = "Port must be greater than 0 and less than 65536" }
})

clientId_input.value = store.get("clientId") || '';
clientId_input.addEventListener("change", (e) => {
    ipcRenderer.send("clientId-changed", e.target.value);
    infobox.textContent = "Client ID set to " + e.target.value
})

ipcRenderer.on("get-startup-state", (e, state) => { startup_switch.checked = state });
ipcRenderer.send("get-startup-state", true);
startup_switch.addEventListener("change", (e) => {
    ipcRenderer.send("startup-state-changed", e.target.checked);
})

document.getElementById("button-exitapp").addEventListener('click', () => { ipcRenderer.send("close", true) })

setInterval(() => {
    ipcRenderer.send("get-current-rich-presence", true)
}, 1e3);

ipcRenderer.on("get-current-rich-presence", (e, rp) => {
    if (!rp.details || !rp.state) return rpe.title.textContent = "Presence isn't running."
    rpe.title.textContent = rp.details;
    rpe.description.textContent = rp.state;
    rpe.timestamp.textContent = getTime(rp.startTimestamp) + " elapsed";
})

function getTime(timestamp) {
    let diff = new Date() - new Date(timestamp * 1000)
    var minutes = Math.floor(diff / 60000);
    var seconds = ((diff % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}