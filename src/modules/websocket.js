const WebSocket = require('ws')
const { setPresence } = require('./presence.js')
let wss;
const setWebsocket = (port = 51972) => {
    if (wss) wss = wss.close()
    wss = new WebSocket.Server({ port });
    wss.on('connection', (ws) => {
        console.log("Connection established.");
        ws.on('message', (message) => {
            try {
                let status = JSON.parse(message);
                console.log(message);
                if (!status.__DRP)
                    return console.log("INVALID REQUEST RECEIVED");
                setPresence(status);
            }
            catch (e) { console.error(e); }
        });
    });
    console.log(`Succesfully opened a server on port ${port}`);
}

module.exports = setWebsocket