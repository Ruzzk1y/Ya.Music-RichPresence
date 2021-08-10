const fs = require('fs')
const { app } = require('electron')
const coversPath = require("path").join(app.getPath("userData") + "\\covers.json")
const Store = require("electron-store")
const store = new Store()
let clientId = store.get('clientId') || ''
const DiscordRPC = require("discord-rpc");
const __coversPlaceholder = `[
    ["*THIS ARRAY IS FOR ARTIST PROFILE PICTURES*"], ["*THIS ARRAY IS FOR ALBUM COVERS*"], ["*THIS ARRAY IS FOR PLAYLIST PICTURES*"],
    [
        "HOW TO USE COVERS:",
        "Covers are used to show album covers/artist profile pictures in rich presence large image.",
        "To start using covers you need to enter string in this format: [Name of album/artist%your_image_key_in_application%]",
        "Example: Nevermind%nevermind_nirvana%"
    ]
]`;
let rpc;
let timeout;
let presence = {
    largeImageKey: 'yandexmusiclarge',
    largeImageText: 'Yandex.Music',
    instance: false,
    startTimestamp: ''
}

function resetTimeout() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
        if (rpc) rpc.destroy();
        rpc = undefined;
        console.log("RPC Destroyed due to a time out.");
    }, 20e3);
}

function startPresence(clientId) {
    try {
        if (rpc) rpc.destroy();
        rpc = new DiscordRPC.Client({ transport: 'ipc' });
        rpc.on('ready', () => {
            rpc.setActivity(presence);
            setInterval(() => {
                if (rpc) {
                    rpc.setActivity(presence)
                }
            }, 15e3);
        });
        rpc.login({ clientId }).catch(console.error);
        console.log("RPC Created.");
    } catch (err) { console.error(err); rpc.destroy(); rpc = undefined; }
}

const setPresence = (status) => {
    const date = new Date();
    if (status.isPlaying == true) {
        resetTimeout()
        presence.startTimestamp = Math.floor(date.getTime() / 1000 - status.progress)
        presence.details = `Listening to ${boldify(status.title)}`
        if (!status.artists[0].title) status.artists[0].title = "Unknown Artist"
        presence.state = `by ${boldify(getArtists(status.artists))}`
        getCovers(status.artists[0], status.album_title, status.playlist_title)
        if (!rpc) { startPresence(clientId); }
    }
    else presence.startTimestamp = Math.floor(date.getTime() / 1000 - status.progress)
}

function getCovers(artist = '', album_title = '', playlist_title = '') {
    const regex = /(?<=\%).+?(?=\%)/g;
    let found = false;
    let uplCovers;
    try {
        uplCovers = JSON.parse(fs.readFileSync(coversPath, "utf-8"));
    } catch (err) {
        //check if file exists and if not, create it.
        fs.access(coversPath, fs.F_OK, (err) => {
            if (err) {
                fs.appendFile(coversPath, __coversPlaceholder, err => { if (err) throw err; });
            }
        })
        console.error(err);
    }
    uplCovers[0].forEach(el => {
        if (el.startsWith(artist)) {
            if (regex.test(el)) presence.largeImageKey = el.match(regex)[0];
            found = true;
        }
    })
    uplCovers[1].forEach(el => {
        if (el.startsWith(album_title)) {
            if (regex.test(el)) presence.largeImageKey = el.match(regex)[0];
            found = true;
        }
    })
    uplCovers[2].forEach(el => {
        if (el.startsWith(playlist_title)) {
            if (regex.test(el)) presence.largeImageKey = el.match(regex)[0];
            found = true;
        }
    })
    if (found != true) {
        presence.largeImageKey = "yandexmusiclarge";
        delete presence.smallImageKey;
    }
    else presence.smallImageKey = "yandexmusiclarge";
}

function getArtists(artists = []) {
    let list = '';
    artists.forEach(el => {
        list += el + ", ";
    });
    return list.slice(0, -2);
}

function boldify(string = '') {
    //This function transforms usual letters to bold ones... yeah..
    //..and now it also cuts strings
    if (string.length > 30) string = string.slice(30, string.length) + '...'
    return string
        .replaceAll("Q", "𝗤").replaceAll("q", "𝗾")
        .replaceAll("W", "𝗪").replaceAll("w", "𝘄")
        .replaceAll("E", "𝗘").replaceAll("e", "𝗲")
        .replaceAll("R", "𝗥").replaceAll("r", "𝗿")
        .replaceAll("T", "𝗧").replaceAll("t", "𝘁")
        .replaceAll("Y", "𝗬").replaceAll("y", "𝘆")
        .replaceAll("U", "𝗨").replaceAll("u", "𝘂")
        .replaceAll("I", "𝗜").replaceAll("i", "𝗶")
        .replaceAll("O", "𝗢").replaceAll("o", "𝗼")
        .replaceAll("P", "𝗣").replaceAll("p", "𝗽")
        .replaceAll("]", "]").replaceAll("[", "[")
        .replaceAll("A", "𝗔").replaceAll("a", "𝗮")
        .replaceAll("S", "𝗦").replaceAll("s", "𝘀")
        .replaceAll("D", "𝗗").replaceAll("d", "𝗱")
        .replaceAll("F", "𝗙").replaceAll("f", "𝗳")
        .replaceAll("G", "𝗚").replaceAll("g", "𝗴")
        .replaceAll("H", "𝗛").replaceAll("h", "𝗵")
        .replaceAll("J", "𝗝").replaceAll("j", "𝗷")
        .replaceAll("K", "𝗞").replaceAll("k", "𝗸")
        .replaceAll("L", "𝗟").replaceAll("l", "𝗹")
        .replaceAll("Z", "𝗭").replaceAll("z", "𝘇")
        .replaceAll("X", "𝗫").replaceAll("x", "𝘅")
        .replaceAll("C", "𝗖").replaceAll("c", "𝗰")
        .replaceAll("V", "𝗩").replaceAll("v", "𝘃")
        .replaceAll("B", "𝗕").replaceAll("b", "𝗯")
        .replaceAll("N", "𝗡").replaceAll("n", "𝗻")
        .replaceAll("M", "𝗠").replaceAll("m", "𝗺")
        .replaceAll("1", "𝟭").replaceAll("2", "𝟮")
        .replaceAll("3", "𝟯").replaceAll("4", "𝟰")
        .replaceAll("5", "𝟱").replaceAll("6", "𝟲")
        .replaceAll("7", "𝟳").replaceAll("8", "𝟴")
        .replaceAll("9", "𝟵").replaceAll("0", "𝟬")
}

const getPresence = () => { return presence }

module.exports = { setPresence, startPresence, getPresence }