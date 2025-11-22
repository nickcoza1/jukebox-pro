import express from "express";
import bcrypt from "bcryptjs";

import requireBody from "../middleware/requireBody.js";
import { createUser, getUserByUsername } from "../db/queries/users.js";
import { createToken } from "../utils/jwt.js";

const router = express.Router();

// POST /users/register
router.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const existing = await getUserByUsername(username);
      if (existing) {
        return res.status(400).send("Username already taken.");
      }

      const hash = await bcrypt.hash(password, 10);
      const user = await createUser(username, hash);

      const token = createToken({ id: user.id });
      // tests expect a bare token string
      res.status(201).send(token);
    } catch (err) {
      next(err);
    }
  }
);

// POST /users/login
router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await getUserByUsername(username);
      if (!user) {
        return res.status(400).send("Invalid credentials.");
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).send("Invalid credentials.");
      }

      const token = createToken({ id: user.id });
      res.status(200).send(token);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
