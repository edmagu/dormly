import pg from "pg";

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required. Set it in your environment to connect the API to Postgres."
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function initDb() {
  await query(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      bio TEXT,
      avatar_url TEXT,
      phone TEXT,
      campus TEXT,
      preferences JSONB,
      quiz JSONB,
      updated_at TIMESTAMPTZ
    );`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL,
      address TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      max_renters INTEGER,
      photos JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      applicant_email TEXT NOT NULL,
      message TEXT,
      status TEXT,
      created_at TIMESTAMPTZ NOT NULL
    );`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      reviewer_email TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMPTZ NOT NULL
    );`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS waitlist (
      email TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      joined_at TIMESTAMPTZ NOT NULL
    );`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS match_likes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      UNIQUE (user_id, target_user_id)
    );`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS match_passes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      UNIQUE (user_id, target_user_id)
    );`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      user_ids TEXT[] NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      UNIQUE (user_ids)
    );`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      participant_ids TEXT[] NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      read_by TEXT[] NOT NULL
    );`
  );

  await query("CREATE INDEX IF NOT EXISTS idx_listings_owner_email ON listings(owner_email);");
  await query("CREATE INDEX IF NOT EXISTS idx_applications_listing ON applications(listing_id);");
  await query("CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_email);");
  await query("CREATE INDEX IF NOT EXISTS idx_match_likes_user ON match_likes(user_id);");
  await query("CREATE INDEX IF NOT EXISTS idx_match_passes_user ON match_passes(user_id);");
  await query("CREATE INDEX IF NOT EXISTS idx_connections_users ON connections USING GIN (user_ids);");
  await query("CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participant_ids);");
  await query("CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);");
}
