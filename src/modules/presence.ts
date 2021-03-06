import {
  PlayerStatus,
  DiscordRichPresence,
  XMLCoversObject,
} from "../types/declarations";
import { app } from "electron";
import fs = require("fs");
import path = require("path");
import Store = require("electron-store");
import DiscordRPC = require("discord-rpc");
import xmltojs = require("xml-js");
import { Http2ServerResponse } from "http2";
const store = new Store();
const customCoversPath = path.join(app.getPath("userData"), "userCovers.xml"); //Will be implemented later..
const coversPath = path.join(app.getPath("userData"), "covers.xml");

let clientId = String(store.get("clientId") || "");
let rpc: DiscordRPC.Client;
let timeout: NodeJS.Timeout;
let Presence: DiscordRichPresence = {
  largeImageKey: "yandexmusiclarge",
  largeImageText: "Yandex.Music",
  instance: false,
};
let ignoreFavorites = store.get("showfavorites-state") as boolean;

export function startPresence(newClientId?: string) {
  if (newClientId) clientId = newClientId;
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
    getCovers({
      artists: status.artists[0],
      albums: status.album_title,
      playlists: status.playlist_title,
    });

    if (!rpc) {
      startPresence(clientId);
    }
  }
  Presence.startTimestamp = Math.floor(
    new Date().getTime() / 1000 - status.progress
  );
}

function getCovers(matches = { artists: "", albums: "", playlists: "" }) {
  let coversXML;

  try {
    coversXML = xmltojs.xml2js(fs.readFileSync(coversPath, "utf-8"));
  } catch (err) {
    console.error(err);
    downloadCovers(); //Try to download file again.
  }

  //Wrap the XML structure
  let covers = {
    artists: coversXML.elements[0].elements[0] as XMLCoversObject,
    albums: coversXML.elements[0].elements[1] as XMLCoversObject,
    playlists: coversXML.elements[0].elements[2] as XMLCoversObject,
  };

  //Delete Favorites
  if (ignoreFavorites === true) covers.playlists.elements.splice(0, 1);

  //This complicated loop tries to find largeImageKey in XML and returns if found.
  for (const key in covers) {
    if (Object.prototype.hasOwnProperty.call(covers, key)) {
      for (const el of covers[key].elements) {
        if (matches[covers[key].name] === el.attributes.name) {
          Presence.largeImageKey = el.attributes.assetId;
          return (Presence.smallImageKey = "yandexmusiclarge");
        }
      }
    }
  }

  //Return to default images if didn't find right cover.
  Presence.largeImageKey = "yandexmusiclarge";
  delete Presence.smallImageKey;
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

function boldify(string = ""): string {
  //This function transforms usual letters to bold ones an cuts strings.
  if (string.length > 30) string = string.slice(0, 27) + "...";

  return (
    string
      //TypeScript error: Property 'replaceAll' does not exist on type 'string' . . .
      //@ts-ignore
      .replaceAll("Q", "????")
      .replaceAll("q", "????")
      .replaceAll("W", "????")
      .replaceAll("w", "????")
      .replaceAll("E", "????")
      .replaceAll("e", "????")
      .replaceAll("R", "????")
      .replaceAll("r", "????")
      .replaceAll("T", "????")
      .replaceAll("t", "????")
      .replaceAll("Y", "????")
      .replaceAll("y", "????")
      .replaceAll("U", "????")
      .replaceAll("u", "????")
      .replaceAll("I", "????")
      .replaceAll("i", "????")
      .replaceAll("O", "????")
      .replaceAll("o", "????")
      .replaceAll("P", "????")
      .replaceAll("p", "????")
      .replaceAll("]", "]")
      .replaceAll("[", "[")
      .replaceAll("A", "????")
      .replaceAll("a", "????")
      .replaceAll("S", "????")
      .replaceAll("s", "????")
      .replaceAll("D", "????")
      .replaceAll("d", "????")
      .replaceAll("F", "????")
      .replaceAll("f", "????")
      .replaceAll("G", "????")
      .replaceAll("g", "????")
      .replaceAll("H", "????")
      .replaceAll("h", "????")
      .replaceAll("J", "????")
      .replaceAll("j", "????")
      .replaceAll("K", "????")
      .replaceAll("k", "????")
      .replaceAll("L", "????")
      .replaceAll("l", "????")
      .replaceAll("Z", "????")
      .replaceAll("z", "????")
      .replaceAll("X", "????")
      .replaceAll("x", "????")
      .replaceAll("C", "????")
      .replaceAll("c", "????")
      .replaceAll("V", "????")
      .replaceAll("v", "????")
      .replaceAll("B", "????")
      .replaceAll("b", "????")
      .replaceAll("N", "????")
      .replaceAll("n", "????")
      .replaceAll("M", "????")
      .replaceAll("m", "????")
      .replaceAll("1", "????")
      .replaceAll("2", "????")
      .replaceAll("3", "????")
      .replaceAll("4", "????")
      .replaceAll("5", "????")
      .replaceAll("6", "????")
      .replaceAll("7", "????")
      .replaceAll("8", "????")
      .replaceAll("9", "????")
      .replaceAll("0", "????") as string
  );
}

function downloadCovers() {
  require("https").get(
    "https://raw.githubusercontent.com/Ruzzk1y/Ya.Music-RichPresence/master/covers.xml",
    function (response: Http2ServerResponse) {
      response.pipe(fs.createWriteStream(coversPath));
    }
  );
}

downloadCovers();

export const getPresence = () => {
  return Presence;
};

export const shouldIgnoreFavorites = (ignore: boolean) => {
  ignoreFavorites = ignore;
};
