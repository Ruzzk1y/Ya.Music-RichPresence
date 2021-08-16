import { PlayerStatus } from "./declarations";

export function isPlayerStatus(object: unknown): object is PlayerStatus {
  return (
    Object.prototype.hasOwnProperty.call(object, "title") &&
    Object.prototype.hasOwnProperty.call(object, "album_title") &&
    Object.prototype.hasOwnProperty.call(object, "artists") &&
    Object.prototype.hasOwnProperty.call(object, "playlist_title") &&
    Object.prototype.hasOwnProperty.call(object, "progress") &&
    Object.prototype.hasOwnProperty.call(object, "isPlaying") &&
    Object.prototype.hasOwnProperty.call(object, "__DRP")
  );
}
