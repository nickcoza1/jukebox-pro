import express from "express";
const router = express.Router();
export default router;

import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
} from "../db/queries/playlists.js";
import { createPlaylistTrack } from "../db/queries/playlists_tracks.js";
import { getTracksByPlaylistId } from "../db/queries/tracks.js";

// All routes here assume requireUser ran earlier in app.js and set req.user

// GET /playlists -> playlists owned by logged-in user
router.get("/", async (req, res, next) => {
  try {
    const playlists = await getPlaylists(req.user.id);
    res.send(playlists);
  } catch (err) {
    next(err);
  }
});

// POST /playlists -> create playlist owned by logged-in user
router.post("/", async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).send("Request body is required.");

    const { name, description } = req.body;
    if (!name || !description)
      return res.status(400).send("Request body requires: name, description");

    const playlist = await createPlaylist(name, description, req.user.id);
    res.status(201).send(playlist);
  } catch (err) {
    next(err);
  }
});

// GET /playlists/:id -> 403 if not owner
router.get("/:id", async (req, res, next) => {
  try {
    const playlist = await getPlaylistById(req.params.id);
    if (!playlist) return res.status(404).send("Playlist not found.");

    if (playlist.user_id !== req.user.id) {
      return res.sendStatus(403);
    }

    const tracks = await getTracksByPlaylistId(playlist.id);
    res.send({ ...playlist, tracks });
  } catch (err) {
    next(err);
  }
});

// GET /playlists/:id/tracks -> 403 if not owner
router.get("/:id/tracks", async (req, res, next) => {
  try {
    const playlist = await getPlaylistById(req.params.id);
    if (!playlist) return res.status(404).send("Playlist not found.");

    if (playlist.user_id !== req.user.id) {
      return res.sendStatus(403);
    }

    const tracks = await getTracksByPlaylistId(playlist.id);
    res.send(tracks);
  } catch (err) {
    next(err);
  }
});

// POST /playlists/:id/tracks -> add track, 403 if not owner
router.post("/:id/tracks", async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).send("Request body is required.");

    const { trackId } = req.body;
    if (!trackId) return res.status(400).send("Request body requires: trackId");

    const playlist = await getPlaylistById(req.params.id);
    if (!playlist) return res.status(404).send("Playlist not found.");

    if (playlist.user_id !== req.user.id) {
      return res.sendStatus(403);
    }

    const playlistTrack = await createPlaylistTrack(playlist.id, trackId);
    res.status(201).send(playlistTrack);
  } catch (err) {
    next(err);
  }
});
