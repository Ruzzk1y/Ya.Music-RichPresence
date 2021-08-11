import { PlayerStatus, DiscordRichPresence } from "../types/types";
import { app } from "electron";
import fs = require("fs");
import path = require("path");
import Store = require("electron-store");
import DiscordRPC = require("discord-rpc");
const store = new Store();
const customCoversPath = path.join(app.getPath("userData"), "userCovers.json"); //Will be implemented later..
const coversPath = path.join(app.getPath("userData") + "\\covers.json");
require("https").get(
  "https://raw.githubusercontent.com/Ruzzk1y/Ya.Music-RichPresence/master/__covers/covers.json",
  function (response) {
    response.pipe(fs.createWriteStream(coversPath));
  }
);

let clientId = String(store.get("clientId") || "");
let rpc: DiscordRPC.Client;
let timeout: NodeJS.Timeout;
let Presence: DiscordRichPresence = {
  largeImageKey: "yandexmusiclarge",
  largeImageText: "Yandex.Music",
  instance: false,
};

export function startPresence(clientId: string | number) {
  try {
    if (rpc) rpc.destroy();
    rpc = new DiscordRPC.Client({ transport: "ipc" });
    rpc.on("ready", () => {
      rpc.setActivity(Presence);
      setInterval(() => {
        if (rpc) {
          rpc.setActivity(Presence);
        }
      }, 15e3);
    });
    rpc.login({ clientId }).catch(console.error);
    console.log("RPC Created.");
  } catch (err) {
    console.error(err);
    rpc.destroy();
    rpc = undefined;
  }
}

export function setPresence(status: PlayerStatus) {
  if (status.isPlaying == true) {
    resetTimeout();
    Presence.details = `Listening to ${boldify(status.title)}`;
    if (!status.artists[0]) status.artists[0] = "Unknown Artist";
    Presence.state = `by ${boldify(getArtists(status.artists))}`;

    //getCovers mutates original 'Presence' object.
    getCovers(status.artists[0], status.album_title, status.playlist_title);

    if (!rpc) {
      startPresence(clientId);
    }
  }
  Presence.startTimestamp = Math.floor(
    new Date().getTime() / 1000 - status.progress
  );
}

export function getPresence() {
  return Presence;
}

function getCovers(artist = "", album_title = "", playlist_title = "") {
  const regex = /(?<=\%).+?(?=\%)/g;
  let found = false;
  let uplCovers: string[][];

  try {
    uplCovers = JSON.parse(fs.readFileSync(coversPath, "utf-8"));
  } catch (err) {
    console.error(err);
  }

  fs.access(customCoversPath, err => {
    if (err) return;
    else
      try {
        uplCovers = JSON.parse(fs.readFileSync(customCoversPath, "utf-8"));
      } catch (err) {
        console.error(err);
      }
  });

  uplCovers[0].forEach(el => {
    if (el.startsWith(artist)) {
      if (regex.test(el)) Presence.largeImageKey = el.match(regex)[0];
      found = true;
    }
  });
  uplCovers[1].forEach(el => {
    if (el.startsWith(album_title)) {
      if (regex.test(el)) Presence.largeImageKey = el.match(regex)[0];
      found = true;
    }
  });
  uplCovers[2].forEach(el => {
    if (el.startsWith(playlist_title)) {
      if (regex.test(el)) Presence.largeImageKey = el.match(regex)[0];
      found = true;
    }
  });

  if (found) {
    Presence.largeImageKey = "yandexmusiclarge";
    delete Presence.smallImageKey;
  } else Presence.smallImageKey = "yandexmusiclarge";
}

function resetTimeout() {
  if (timeout) clearTimeout(timeout);
  return (timeout = setTimeout(() => {
    if (rpc) rpc.destroy();
    rpc = undefined;
    console.log("RPC Destroyed due to a time out.");
  }, 20e3));
}

function getArtists(artists = []) {
  let list = "";
  artists.forEach(el => {
    list += el + ", ";
  });
  return list.slice(0, -2);
}

function boldify(string = "") {
  //This function transforms usual letters to bold ones an cuts strings.
  if (string.length > 30) string = string.slice(0, 27) + "...";

  return (
    string
      //TypeScript error: Property 'replaceAll' does not exist on type 'string' . . .
      //@ts-ignore
      .replaceAll("Q", "𝗤")
      .replaceAll("q", "𝗾")
      .replaceAll("W", "𝗪")
      .replaceAll("w", "𝘄")
      .replaceAll("E", "𝗘")
      .replaceAll("e", "𝗲")
      .replaceAll("R", "𝗥")
      .replaceAll("r", "𝗿")
      .replaceAll("T", "𝗧")
      .replaceAll("t", "𝘁")
      .replaceAll("Y", "𝗬")
      .replaceAll("y", "𝘆")
      .replaceAll("U", "𝗨")
      .replaceAll("u", "𝘂")
      .replaceAll("I", "𝗜")
      .replaceAll("i", "𝗶")
      .replaceAll("O", "𝗢")
      .replaceAll("o", "𝗼")
      .replaceAll("P", "𝗣")
      .replaceAll("p", "𝗽")
      .replaceAll("]", "]")
      .replaceAll("[", "[")
      .replaceAll("A", "𝗔")
      .replaceAll("a", "𝗮")
      .replaceAll("S", "𝗦")
      .replaceAll("s", "𝘀")
      .replaceAll("D", "𝗗")
      .replaceAll("d", "𝗱")
      .replaceAll("F", "𝗙")
      .replaceAll("f", "𝗳")
      .replaceAll("G", "𝗚")
      .replaceAll("g", "𝗴")
      .replaceAll("H", "𝗛")
      .replaceAll("h", "𝗵")
      .replaceAll("J", "𝗝")
      .replaceAll("j", "𝗷")
      .replaceAll("K", "𝗞")
      .replaceAll("k", "𝗸")
      .replaceAll("L", "𝗟")
      .replaceAll("l", "𝗹")
      .replaceAll("Z", "𝗭")
      .replaceAll("z", "𝘇")
      .replaceAll("X", "𝗫")
      .replaceAll("x", "𝘅")
      .replaceAll("C", "𝗖")
      .replaceAll("c", "𝗰")
      .replaceAll("V", "𝗩")
      .replaceAll("v", "𝘃")
      .replaceAll("B", "𝗕")
      .replaceAll("b", "𝗯")
      .replaceAll("N", "𝗡")
      .replaceAll("n", "𝗻")
      .replaceAll("M", "𝗠")
      .replaceAll("m", "𝗺")
      .replaceAll("1", "𝟭")
      .replaceAll("2", "𝟮")
      .replaceAll("3", "𝟯")
      .replaceAll("4", "𝟰")
      .replaceAll("5", "𝟱")
      .replaceAll("6", "𝟲")
      .replaceAll("7", "𝟳")
      .replaceAll("8", "𝟴")
      .replaceAll("9", "𝟵")
      .replaceAll("0", "𝟬")
  );
}
