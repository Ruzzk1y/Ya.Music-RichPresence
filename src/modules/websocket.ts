import websocket = require("ws");
import { setPresence } from "./presence.js";
import { isPlayerStatus } from "../types/guards";
let wss: websocket.Server;
const setWebsocket = (port = 51972) => {
  if (wss) wss = wss.close();
  wss = new websocket.Server({ port });
  wss.on("connection", ws => {
    console.log("Connection established.");
    ws.on("message", (message: string) => {
      try {
        console.log(message);
        let status = JSON.parse(message);
        if (!isPlayerStatus(status))
          return console.log("Invalid request received.");
        setPresence(status);
      } catch (e) {
        console.error(e);
      }
    });
  });
  console.log(`Succesfully opened a server on port ${port}`);
};

export default setWebsocket;
