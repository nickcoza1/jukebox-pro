import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://postgres:Slidethru42@localhost:5432/jukebox_pro";

const db = new pg.Client({ connectionString });

export default db;
