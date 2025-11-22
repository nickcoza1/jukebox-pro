import db from "#db/client";
import fs from "fs/promises";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  const schema = await fs.readFile("db/schema.sql", "utf8");
  await db.query(schema);

  const {
    rows: [user1],
  } = await db.query(
    `
    INSERT INTO users (username, password)
    VALUES ($1, $2)
    RETURNING *;
    `,
    ["seeduser1", "seedpass1"]
  );

  const {
    rows: [user2],
  } = await db.query(
    `
    INSERT INTO users (username, password)
    VALUES ($1, $2)
    RETURNING *;
    `,
    ["seeduser2", "seedpass2"]
  );

  for (let i = 1; i <= 20; i++) {
    await createTrack("Track " + i, i * 50000);
  }

  for (let i = 1; i <= 20; i++) {
    const ownerId = i <= 10 ? user1.id : user2.id;
    await createPlaylist(
      "Playlist " + i,
      "lorem ipsum playlist description",
      ownerId
    );
  }

  for (let i = 1; i <= 15; i++) {
    const playlistId = 1 + Math.floor(i / 2); 
    await createPlaylistTrack(playlistId, i);
  }
}
