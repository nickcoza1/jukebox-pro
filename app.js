import express from "express";
import morgan from "morgan";

import tracksRouter from "#api/tracks";
import playlistsRouter from "#api/playlists";
import usersRouter from "#api/users";

import getUserFromToken from "./middleware/getUserFromToken.js";
import requireUser from "./middleware/requireUser.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Attach req.user if Authorization header has a valid token
app.use(getUserFromToken);

// Public routes
app.use("/users", usersRouter);
app.use("/tracks", tracksRouter);

// All /playlists routes are protected
app.use("/playlists", requireUser, playlistsRouter);

// Error handler for Postgres codes
app.use((err, req, res, next) => {
  switch (err.code) {
    case "22P02":
      return res.status(400).send(err.message);
    case "23505":
    case "23503":
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

// Fallback 500 handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

export default app;
