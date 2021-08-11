import websocket = require("ws");
import { setPresence } from "./presence.js";
let wss: websocket.Server;
const setWebsocket = (port = 51972) => {
  if (wss) wss = wss.close();
  wss = new websocket.Server({ port });
  wss.on("connection", ws => {
    console.log("Connection established.");
    ws.on("message", (message: string) => {
      try {
        let status = JSON.parse(message);
        console.log(message);
        if (!status.__DRP) return console.log("INVALID REQUEST RECEIVED");
        setPresence(status);
      } catch (e) {
        console.error(e);
      }
    });
  });
  console.log(`Succesfully opened a server on port ${port}`);
};

export default setWebsocket;
