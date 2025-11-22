import express from "express";
const router = express.Router();
export default router;

import db from "#db/client";
import { getTracks, getTrackById } from "#db/queries/tracks";
import requireUser from "../middleware/requireUser.js";

// GET /tracks -> all tracks (public)
router.get("/", async (req, res, next) => {
  try {
    const tracks = await getTracks();
    res.send(tracks);
  } catch (err) {
    next(err);
  }
});

// 🔒 GET /tracks/:id/playlists -> playlists owned by logged-in user containing this track
router.get("/:id/playlists", requireUser, async (req, res, next) => {
  try {
    const trackId = Number(req.params.id);
    if (!Number.isInteger(trackId) || trackId <= 0) {
      return res.sendStatus(400);
    }

    const track = await getTrackById(trackId);
    if (!track) return res.sendStatus(404);

    const sql = `
      SELECT p.*
      FROM playlists_tracks pt
      JOIN playlists p ON p.id = pt.playlist_id
      WHERE pt.track_id = $1
        AND p.user_id = $2
    `;
    const { rows: playlists } = await db.query(sql, [trackId, req.user.id]);
    res.status(200).send(playlists);
  } catch (err) {
    next(err);
  }
});

// GET /tracks/:id -> single track (public)
router.get("/:id", async (req, res, next) => {
  try {
    const track = await getTrackById(req.params.id);
    if (!track) return res.status(404).send("Track not found.");
    res.send(track);
  } catch (err) {
    next(err);
  }
});
